<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Document extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'uuid',
        'tenant_id',
        'customer_id',
        'salesperson_id',
        'type',
        'doc_number',
        'parent_id',
        'amount',
        'currency',
        'description',
        'payment_mode',
        'evidence_image_path',
        'gps_lat',
        'gps_long',
        'amount_words_en',
        'amount_words_ar',
        'status',
        'peppol_xml_path',
        'pdf_path',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'gps_lat' => 'decimal:7',
            'gps_long' => 'decimal:7',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Document $document) {
            if (empty($document->uuid)) {
                $document->uuid = (string) Str::uuid();
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function salesperson(): BelongsTo
    {
        return $this->belongsTo(User::class, 'salesperson_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Document::class, 'parent_id');
    }

    public function creditNotes(): HasMany
    {
        return $this->hasMany(Document::class, 'parent_id');
    }
}
