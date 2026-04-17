<?php

use App\Models\AppSetting;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // 'string'|'integer'|'boolean'
            $table->text('description')->nullable();
            $table->timestamps();
        });

        AppSetting::firstOrCreate(
            ['key' => 'max_free_receipts'],
            ['value' => '50', 'type' => 'integer', 'description' => 'Maximum receipts allowed in easy (guest) mode.']
        );

        AppSetting::firstOrCreate(
            ['key' => 'max_cheque_items'],
            ['value' => '5', 'type' => 'integer', 'description' => 'Maximum number of cheque items allowed per receipt (mobile app).']
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('app_settings');
    }
};
