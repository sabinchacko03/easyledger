<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TenantController extends Controller
{
    public function edit()
    {
        $tenant = auth()->user()->load('tenant')->tenant;

        return Inertia::render('Settings/Edit', [
            'tenant' => $tenant,
        ]);
    }

    public function update(Request $request)
    {
        $tenant = auth()->user()->tenant;

        $validated = $request->validate([
            'name'    => ['required', 'string', 'max:255'],
            'email'   => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city'    => ['nullable', 'string', 'max:100'],
            'emirate' => ['nullable', 'in:AUH,DXB,SHJ,AJM,UAQ,RAK,FUJ'],
            'trn'     => ['nullable', 'regex:/^\d{15}$/'],
            'tin'     => ['nullable', 'regex:/^\d{10}$/'],
            'logo'    => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($tenant->logo) {
                Storage::delete($tenant->logo);
            }
            $validated['logo'] = $request->file('logo')->store("logos/{$tenant->id}");
        } else {
            unset($validated['logo']);
        }

        $tenant->update($validated);

        return back()->with('success', 'Company details updated successfully.');
    }

    public function deleteLogo()
    {
        $tenant = auth()->user()->tenant;

        if ($tenant->logo) {
            Storage::delete($tenant->logo);
            $tenant->update(['logo' => null]);
        }

        return back()->with('success', 'Logo removed.');
    }
}
