<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EasyInvitation extends Model
{
    protected $fillable = [
        'email',
        'name',
        'company_name',
        'company_address',
        'trn',
        'tin',
        'token',
        'token_expires_at',
        'status',
        'tenant_id',
    ];

    protected $casts = [
        'token_expires_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function isExpired(): bool
    {
        return $this->token_expires_at->isPast() || $this->status === 'expired';
    }
}
