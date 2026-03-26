<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalespersonProfile extends Model
{
    protected $fillable = [
        'user_id',
        'employee_id',
        'daily_collection_limit',
    ];

    protected function casts(): array
    {
        return [
            'daily_collection_limit' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
