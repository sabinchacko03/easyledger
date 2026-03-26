<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('logo')->nullable();
            $table->string('trn', 15)->nullable();
            $table->string('tin', 10)->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->enum('emirate', ['AUH', 'DXB', 'SHJ', 'AJM', 'UAQ', 'RAK', 'FUJ'])->nullable();
            $table->string('email')->nullable();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        // Now that tenants table exists, add FK constraint on users.tenant_id
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
        });
        Schema::dropIfExists('tenants');
    }
};
