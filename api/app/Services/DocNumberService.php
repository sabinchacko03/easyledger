<?php

namespace App\Services;

use App\Models\Document;
use App\Models\Tenant;

class DocNumberService
{
    /**
     * Generate a sequential document number per tenant.
     * Format: PV-{TENANT}-{YEAR}-{00001} for receipts
     *         CN-{TENANT}-{YEAR}-{00001} for credit notes
     *
     * TENANT = first 3 uppercase letters of tenant name (letters only).
     */
    public function generate(int $tenantId, string $type): string
    {
        $prefix = $type === '381' ? 'CN' : 'PV';
        $year = now()->year;

        $tenant = Tenant::find($tenantId);
        $tenantCode = strtoupper(
            substr(preg_replace('/[^A-Za-z]/', '', $tenant->name ?? ''), 0, 3)
        ) ?: 'TEN';

        $lastNumber = Document::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('type', $type)
            ->whereYear('created_at', $year)
            ->lockForUpdate()
            ->count();

        $sequence = str_pad($lastNumber + 1, 5, '0', STR_PAD_LEFT);

        return "{$prefix}-{$tenantCode}-{$year}-{$sequence}";
    }
}
