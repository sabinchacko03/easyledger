<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalespersonProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalespersonController extends Controller
{
    /**
     * List all salespeople in the authenticated admin's tenant.
     */
    public function index(Request $request): JsonResponse
    {
        $salespeople = User::where('tenant_id', $request->user()->tenant_id)
            ->where('role', 'salesperson')
            ->with('salespersonProfile')
            ->get();

        return response()->json($salespeople);
    }

    /**
     * Create a new salesperson under the admin's tenant.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'employee_id' => ['nullable', 'string', 'max:100'],
            'daily_collection_limit' => ['nullable', 'numeric', 'min:0'],
        ]);

        $salesperson = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => 'salesperson',
            'tenant_id' => $request->user()->tenant_id,
            'is_active' => true,
        ]);

        $salesperson->assignRole('salesperson');

        if ($request->employee_id || $request->daily_collection_limit !== null) {
            SalespersonProfile::create([
                'user_id' => $salesperson->id,
                'employee_id' => $request->employee_id,
                'daily_collection_limit' => $request->daily_collection_limit,
            ]);
        }

        return response()->json($salesperson->load('salespersonProfile'), 201);
    }

    /**
     * Show a single salesperson.
     */
    public function show(Request $request, User $salesperson): JsonResponse
    {
        abort_if(
            $salesperson->tenant_id !== $request->user()->tenant_id,
            403,
            'Unauthorized.'
        );

        return response()->json($salesperson->load('salespersonProfile'));
    }

    /**
     * Update salesperson info (admin only).
     */
    public function update(Request $request, User $salesperson): JsonResponse
    {
        abort_if(
            $salesperson->tenant_id !== $request->user()->tenant_id,
            403,
            'Unauthorized.'
        );

        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
            'employee_id' => ['sometimes', 'nullable', 'string', 'max:100'],
            'daily_collection_limit' => ['sometimes', 'nullable', 'numeric', 'min:0'],
        ]);

        $salesperson->update($request->only('name', 'is_active'));

        if ($request->hasAny(['employee_id', 'daily_collection_limit'])) {
            $salesperson->salespersonProfile()->updateOrCreate(
                ['user_id' => $salesperson->id],
                $request->only('employee_id', 'daily_collection_limit')
            );
        }

        return response()->json($salesperson->fresh('salespersonProfile'));
    }
}
