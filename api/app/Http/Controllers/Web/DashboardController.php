<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Document;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $tenantId = auth()->user()->tenant_id;

        $stats = [
            'customers'        => Customer::where('tenant_id', $tenantId)->count(),
            'salespeople'      => User::where('tenant_id', $tenantId)->role('salesperson')->where('is_active', true)->count(),
            'receipts_month'   => Document::where('tenant_id', $tenantId)
                ->where('type', '380')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'collected_month'  => Document::where('tenant_id', $tenantId)
                ->where('type', '380')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount'),
        ];

        $recentDocuments = Document::with(['customer:id,name', 'salesperson:id,name'])
            ->where('tenant_id', $tenantId)
            ->latest()
            ->take(8)
            ->get(['id', 'doc_number', 'type', 'amount', 'status', 'customer_id', 'salesperson_id', 'created_at']);

        return Inertia::render('Dashboard', [
            'stats'           => $stats,
            'recentDocuments' => $recentDocuments,
        ]);
    }
}
