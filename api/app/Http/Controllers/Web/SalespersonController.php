<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\SalespersonProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SalespersonController extends Controller
{
    public function index()
    {
        $salespeople = User::with('salespersonProfile')
            ->where('tenant_id', auth()->user()->tenant_id)
            ->role('salesperson')
            ->latest()
            ->get(['id', 'name', 'email', 'is_active', 'created_at']);

        return Inertia::render('Salespeople/Index', [
            'salespeople' => $salespeople,
        ]);
    }

    public function create()
    {
        return Inertia::render('Salespeople/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users,email',
            'password'              => 'required|string|min:8|confirmed',
            'employee_id'           => 'nullable|string|max:50',
            'daily_collection_limit'=> 'nullable|numeric|min:0',
        ]);

        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'tenant_id' => auth()->user()->tenant_id,
            'is_active' => true,
        ]);

        $user->assignRole('salesperson');

        if ($request->employee_id || $request->daily_collection_limit) {
            SalespersonProfile::create([
                'user_id'                => $user->id,
                'employee_id'            => $request->employee_id,
                'daily_collection_limit' => $request->daily_collection_limit,
            ]);
        }

        return redirect()->route('salespeople.index')
            ->with('success', "{$user->name} has been added as a salesperson.");
    }

    public function show(User $salesperson)
    {
        $this->authorizeSalesperson($salesperson);

        $salesperson->load('salespersonProfile');

        $documents = Document::with('customer:id,name')
            ->where('salesperson_id', $salesperson->id)
            ->latest()
            ->take(10)
            ->get(['id', 'doc_number', 'type', 'amount', 'status', 'customer_id', 'created_at']);

        return Inertia::render('Salespeople/Show', [
            'salesperson' => $salesperson,
            'documents'   => $documents,
        ]);
    }

    public function toggle(User $salesperson)
    {
        $this->authorizeSalesperson($salesperson);

        $salesperson->update(['is_active' => ! $salesperson->is_active]);

        $status = $salesperson->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "{$salesperson->name} has been {$status}.");
    }

    private function authorizeSalesperson(User $salesperson): void
    {
        abort_if($salesperson->tenant_id !== auth()->user()->tenant_id, 403);
    }
}
