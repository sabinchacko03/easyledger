<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    public function register(Request $request)
    {
        $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'required|email|unique:users,email',
            'password'     => 'required|string|min:8|confirmed',
            'company_name' => 'required|string|max:255',
            'trn'          => 'nullable|string|max:15',
            'tin'          => 'nullable|string|max:10',
            'emirate'      => 'required|in:AUH,DXB,SHJ,AJM,UAQ,RAK,FUJ',
            'city'         => 'required|string|max:100',
            'address'      => 'required|string|max:500',
            'company_email'=> 'required|email|max:255',
        ]);

        // Create user first (tenant_id null — tenants.owner_id is non-nullable so user must exist first)
        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'tenant_id' => null,
            'is_active' => true,
        ]);

        // Create tenant with owner_id pointing to the new user
        $tenant = Tenant::create([
            'name'     => $request->company_name,
            'trn'      => $request->trn,
            'tin'      => $request->tin,
            'emirate'  => $request->emirate,
            'city'     => $request->city,
            'address'  => $request->address,
            'email'    => $request->company_email,
            'owner_id' => $user->id,
        ]);

        // Link user back to tenant
        $user->update(['tenant_id' => $tenant->id]);

        // Assign admin role
        $user->assignRole('admin');

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard');
    }

    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (! Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            return back()->withErrors(['email' => 'These credentials do not match our records.']);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
