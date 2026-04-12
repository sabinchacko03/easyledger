<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('easy_invitations', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('name');
            $table->string('company_name');
            $table->text('company_address')->nullable();
            $table->string('trn', 15);
            $table->string('tin', 10)->nullable();
            $table->string('token', 64)->unique();
            $table->timestamp('token_expires_at');
            $table->enum('status', ['pending', 'registered', 'expired'])->default('pending');
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('easy_invitations');
    }
};
