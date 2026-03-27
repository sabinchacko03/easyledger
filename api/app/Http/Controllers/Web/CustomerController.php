<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::where('tenant_id', auth()->user()->tenant_id)
            ->latest()
            ->get(['id', 'name', 'trn', 'phone', 'email', 'address', 'current_balance', 'created_at']);

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
        ]);
    }

    public function create()
    {
        return Inertia::render('Customers/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'            => 'required|string|max:255',
            'trn'             => 'required|string|max:15',
            'tin'             => 'required|string|max:10',
            'phone'           => 'nullable|string|max:20',
            'email'           => 'nullable|email|max:255',
            'address'         => 'nullable|string|max:500',
            'current_balance' => 'nullable|numeric',
            'trade_license'   => 'required|file|mimes:pdf|max:2048',
        ]);

        $path = $request->file('trade_license')->store('trade-licenses', 'local');

        Customer::create([
            'tenant_id'          => auth()->user()->tenant_id,
            'name'               => $request->name,
            'trn'                => $request->trn,
            'tin'                => $request->tin,
            'phone'              => $request->phone,
            'email'              => $request->email,
            'address'            => $request->address,
            'current_balance'    => $request->current_balance ?? 0,
            'trade_license_path' => $path,
        ]);

        return redirect()->route('customers.index')
            ->with('success', 'Customer added successfully.');
    }

    public function edit(Customer $customer)
    {
        abort_if($customer->tenant_id !== auth()->user()->tenant_id, 403);

        return Inertia::render('Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        abort_if($customer->tenant_id !== auth()->user()->tenant_id, 403);

        $request->validate([
            'name'            => 'required|string|max:255',
            'trn'             => 'required|string|max:15',
            'tin'             => 'required|string|max:10',
            'phone'           => 'nullable|string|max:20',
            'email'           => 'nullable|email|max:255',
            'address'         => 'nullable|string|max:500',
            'current_balance' => 'nullable|numeric',
            'trade_license'   => 'nullable|file|mimes:pdf|max:2048',
        ]);

        $data = $request->only('name', 'trn', 'tin', 'phone', 'email', 'address', 'current_balance');

        if ($request->hasFile('trade_license')) {
            $data['trade_license_path'] = $request->file('trade_license')->store('trade-licenses', 'local');
        }

        $customer->update($data);

        return redirect()->route('customers.index')
            ->with('success', 'Customer updated successfully.');
    }

    public function destroy(Customer $customer)
    {
        abort_if($customer->tenant_id !== auth()->user()->tenant_id, 403);

        $customer->delete();

        return back()->with('success', 'Customer removed.');
    }
}
