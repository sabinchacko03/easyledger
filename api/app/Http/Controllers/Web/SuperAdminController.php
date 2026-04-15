<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Jobs\SendInvitationEmail;
use App\Models\AppSetting;
use App\Models\EasyInvitation;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SuperAdminController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Super/Dashboard', [
            'stats' => [
                'tenants'            => Tenant::count(),
                'users'              => User::where('is_super_admin', false)->count(),
                'pending_invitations'=> EasyInvitation::where('status', 'pending')->count(),
                'total_invitations'  => EasyInvitation::count(),
            ],
        ]);
    }

    public function settings()
    {
        return Inertia::render('Super/Settings', [
            'settings' => AppSetting::orderBy('key')->get(),
        ]);
    }

    public function updateSetting(Request $request, string $key)
    {
        $request->validate(['value' => ['required', 'string', 'max:255']]);
        AppSetting::set($key, $request->value);
        return back()->with('success', "Setting '{$key}' updated.");
    }

    public function invitations(Request $request)
    {
        $invitations = EasyInvitation::query()
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Super/Invitations', [
            'invitations' => $invitations,
            'filter'      => $request->only('status'),
        ]);
    }

    public function resendInvitation(EasyInvitation $invitation)
    {
        if ($invitation->status === 'registered') {
            return back()->with('error', 'This invitation has already been used.');
        }

        $invitation->update([
            'token'            => Str::random(48),
            'token_expires_at' => now()->addDays(7),
            'status'           => 'pending',
        ]);

        SendInvitationEmail::dispatch($invitation)->onQueue('emails');

        return back()->with('success', "Invitation resent to {$invitation->email}.");
    }

    public function tenants()
    {
        $tenants = Tenant::withCount('users', 'documents')
            ->latest()
            ->paginate(25);

        return Inertia::render('Super/Tenants', [
            'tenants' => $tenants,
        ]);
    }
}
