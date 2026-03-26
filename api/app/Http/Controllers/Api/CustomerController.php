<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(): JsonResponse
    {
        // TenantScope auto-filters by tenant_id
        $customers = Customer::orderBy('name')->get();

        return response()->json($customers);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'trn' => ['nullable', 'string', 'max:15'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email'],
            'address' => ['nullable', 'string'],
            'current_balance' => ['nullable', 'numeric'],
        ]);

        $customer = Customer::create($request->only(
            'name', 'trn', 'phone', 'email', 'address', 'current_balance'
        ));

        return response()->json($customer, 201);
    }

    public function show(Customer $customer): JsonResponse
    {
        // TenantScope ensures this customer belongs to the user's tenant
        return response()->json($customer);
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'trn' => ['sometimes', 'nullable', 'string', 'max:15'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'email' => ['sometimes', 'nullable', 'email'],
            'address' => ['sometimes', 'nullable', 'string'],
            'current_balance' => ['sometimes', 'nullable', 'numeric'],
        ]);

        $customer->update($request->only(
            'name', 'trn', 'phone', 'email', 'address', 'current_balance'
        ));

        return response()->json($customer);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();

        return response()->json(null, 204);
    }
}
