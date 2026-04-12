<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\EasyInvitation;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class InviteRegistrationController extends Controller
{
    public function show(string $token): View
    {
        $invitation = EasyInvitation::where('token', $token)->firstOrFail();

        if ($invitation->status === 'registered') {
            return view('invite.already-registered', compact('invitation'));
        }

        if ($invitation->isExpired()) {
            return view('invite.expired', compact('invitation'));
        }

        return view('invite.show', compact('invitation'));
    }

    public function register(Request $request, string $token): RedirectResponse|View
    {
        $invitation = EasyInvitation::where('token', $token)->firstOrFail();

        if ($invitation->status === 'registered') {
            return redirect()->route('invite.success', $token);
        }

        if ($invitation->isExpired()) {
            return view('invite.expired', compact('invitation'));
        }

        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        DB::transaction(function () use ($invitation, $request) {
            $user = User::create([
                'name'      => $invitation->name,
                'email'     => $invitation->email,
                'password'  => $request->password,
                'role'      => 'admin',
                'is_active' => true,
            ]);

            $user->assignRole('admin');

            $tenant = Tenant::create([
                'name'     => $invitation->company_name,
                'address'  => $invitation->company_address,
                'trn'      => $invitation->trn,
                'tin'      => $invitation->tin,
                'owner_id' => $user->id,
            ]);

            $user->update(['tenant_id' => $tenant->id]);

            $invitation->update([
                'status'    => 'registered',
                'tenant_id' => $tenant->id,
            ]);
        });

        return redirect()->route('invite.success', $token);
    }

    public function success(string $token): View
    {
        $invitation = EasyInvitation::where('token', $token)->firstOrFail();

        return view('invite.success', compact('invitation'));
    }
}
