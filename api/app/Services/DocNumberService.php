<?php

namespace App\Services;

use App\Models\Document;

class DocNumberService
{
    /**
     * Generate a sequential document number per tenant.
     * Format: PV-2026-0001 for receipts, CN-2026-0001 for credit notes.
     */
    public function generate(int $tenantId, string $type): string
    {
        $prefix = $type === '381' ? 'CN' : 'PV';
        $year = now()->year;

        $lastNumber = Document::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('type', $type)
            ->whereYear('created_at', $year)
            ->lockForUpdate()
            ->count();

        $sequence = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return "{$prefix}-{$year}-{$sequence}";
    }
}
