<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendInvitationEmail;
use App\Models\AppSetting;
use App\Models\Customer;
use App\Models\Document;
use App\Models\EasyInvitation;
use App\Services\DocNumberService;
use App\Services\TafqeetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EasyController extends Controller
{
    public function __construct(
        private readonly DocNumberService $docNumberService,
        private readonly TafqeetService $tafqeetService,
    ) {}

    /**
     * GET /api/easy/config
     * Returns app-wide configuration for easy mode (no auth required).
     */
    public function config(): JsonResponse
    {
        return response()->json([
            'max_free_receipts' => AppSetting::get('max_free_receipts', 50),
        ]);
    }

    /**
     * POST /api/easy/invite
     * Creates an invitation and sends the registration email.
     */
    public function invite(Request $request): JsonResponse
    {
        $request->validate([
            'email'           => ['required', 'email', 'unique:easy_invitations,email'],
            'name'            => ['required', 'string', 'max:255'],
            'company_name'    => ['required', 'string', 'max:255'],
            'company_address' => ['nullable', 'string'],
            'trn'             => ['required', 'regex:/^\d{15}$/'],
            'tin'             => ['required', 'regex:/^\d{10}$/'],
        ]);

        $invitation = EasyInvitation::create([
            'email'            => $request->email,
            'name'             => $request->name,
            'company_name'     => $request->company_name,
            'company_address'  => $request->company_address,
            'trn'              => $request->trn,
            'tin'              => $request->tin,
            'token'            => Str::random(48),
            'token_expires_at' => now()->addDays(7),
            'status'           => 'pending',
        ]);

        SendInvitationEmail::dispatch($invitation)->onQueue('emails');

        return response()->json(['message' => 'Invitation sent. Please check your email.'], 201);
    }

    /**
     * POST /api/easy/resend
     * Resends the invitation email for a pending/expired invitation.
     */
    public function resend(Request $request): JsonResponse
    {
        $request->validate([
            'trn' => ['required', 'string'],
        ]);

        $invitation = EasyInvitation::where('trn', $request->trn)
            ->whereIn('status', ['pending', 'expired'])
            ->latest()
            ->first();

        if (! $invitation) {
            return response()->json(['message' => 'No pending invitation found. Please submit your email again.'], 404);
        }

        $invitation->update([
            'token'            => Str::random(48),
            'token_expires_at' => now()->addDays(7),
            'status'           => 'pending',
        ]);

        SendInvitationEmail::dispatch($invitation)->onQueue('emails');

        return response()->json(['message' => 'Invitation resent successfully.']);
    }

    /**
     * GET /api/easy/status?trn={trn}
     * Polled by mobile to check if tenant registration has completed.
     */
    public function status(Request $request): JsonResponse
    {
        $request->validate([
            'trn' => ['required', 'string'],
        ]);

        $invitation = EasyInvitation::where('trn', $request->trn)
            ->latest()
            ->first();

        if (! $invitation) {
            return response()->json(['status' => 'not_found']);
        }

        if ($invitation->status === 'registered') {
            return response()->json([
                'status' => 'ready',
                'email'  => $invitation->email,
            ]);
        }

        if ($invitation->isExpired()) {
            return response()->json(['status' => 'expired']);
        }

        return response()->json(['status' => $invitation->status]);
    }

    /**
     * POST /api/easy/sync
     * Syncs easy receipts after the user logs in to a full tenant account.
     * Each receipt has: uuid, customer_name, customer_phone, amount,
     *   payment_mode, description, gps_lat, gps_long, created_at_local.
     */
    public function sync(Request $request): JsonResponse
    {
        $request->validate([
            'receipts'                      => ['required', 'array', 'min:1'],
            'receipts.*.uuid'               => ['required', 'uuid'],
            'receipts.*.customer_name'      => ['required', 'string', 'max:255'],
            'receipts.*.customer_phone'     => ['nullable', 'string', 'max:50'],
            'receipts.*.amount'             => ['required', 'numeric', 'min:0.01'],
            'receipts.*.payment_mode'       => ['nullable', 'in:Cash,Cheque,Bank Transfer,Credit'],
            'receipts.*.description'        => ['nullable', 'string'],
            'receipts.*.gps_lat'            => ['nullable', 'numeric'],
            'receipts.*.gps_long'           => ['nullable', 'numeric'],
            'receipts.*.created_at_local'   => ['nullable', 'date'],
        ]);

        $user = $request->user();
        $synced = [];
        $skipped = [];

        foreach ($request->receipts as $receipt) {
            if (Document::where('uuid', $receipt['uuid'])->exists()) {
                $skipped[] = $receipt['uuid'];
                continue;
            }

            // Find or create a customer record for this tenant
            $customer = DB::transaction(function () use ($receipt, $user) {
                return Customer::firstOrCreate(
                    [
                        'tenant_id' => $user->tenant_id,
                        'name'      => $receipt['customer_name'],
                    ],
                    [
                        'phone' => $receipt['customer_phone'] ?? null,
                    ]
                );
            });

            $docNumber = $this->docNumberService->generate($user->tenant_id, '380');

            Document::create([
                'uuid'            => $receipt['uuid'],
                'tenant_id'       => $user->tenant_id,
                'customer_id'     => $customer->id,
                'salesperson_id'  => $user->id,
                'type'            => '380',
                'doc_number'      => $docNumber,
                'amount'          => $receipt['amount'],
                'currency'        => 'AED',
                'description'     => $receipt['description'] ?? null,
                'payment_mode'    => $receipt['payment_mode'] ?? null,
                'gps_lat'         => $receipt['gps_lat'] ?? null,
                'gps_long'        => $receipt['gps_long'] ?? null,
                'amount_words_en' => $this->tafqeetService->toEnglish($receipt['amount']),
                'amount_words_ar' => $this->tafqeetService->toArabic($receipt['amount']),
                'status'          => 'synced',
                'created_at'      => $receipt['created_at_local'] ?? now(),
            ]);

            $synced[] = $receipt['uuid'];
        }

        return response()->json([
            'synced'  => $synced,
            'skipped' => $skipped,
        ]);
    }
}
