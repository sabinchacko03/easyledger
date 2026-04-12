<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendInvitationEmail;
use App\Models\AppSetting;
use App\Models\EasyInvitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SuperAdminController extends Controller
{
    /**
     * GET /api/super/settings
     */
    public function indexSettings(): JsonResponse
    {
        return response()->json(AppSetting::all());
    }

    /**
     * PUT /api/super/settings/{key}
     */
    public function updateSetting(Request $request, string $key): JsonResponse
    {
        $request->validate([
            'value' => ['required'],
        ]);

        AppSetting::set($key, $request->value);

        return response()->json(['message' => 'Setting updated.']);
    }

    /**
     * GET /api/super/invitations
     */
    public function indexInvitations(Request $request): JsonResponse
    {
        $invitations = EasyInvitation::query()
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(25);

        return response()->json($invitations);
    }

    /**
     * POST /api/super/invitations/{invitation}/resend
     */
    public function resendInvitation(EasyInvitation $invitation): JsonResponse
    {
        if ($invitation->status === 'registered') {
            return response()->json(['message' => 'This invitation has already been used.'], 422);
        }

        $invitation->update([
            'token'            => Str::random(48),
            'token_expires_at' => now()->addDays(7),
            'status'           => 'pending',
        ]);

        SendInvitationEmail::dispatch($invitation)->onQueue('emails');

        return response()->json(['message' => 'Invitation resent.']);
    }
}
