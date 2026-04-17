<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('salesperson_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['380', '381'])->comment('380=Receipt, 381=Credit Note');
            $table->string('doc_number');
            $table->foreignId('parent_id')->nullable()->constrained('documents')->nullOnDelete();
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('AED');
            $table->text('description')->nullable();
            $table->enum('payment_mode', ['Cash', 'Cheque', 'Bank Transfer', 'Credit'])->nullable();
            $table->json('cheque_details')->nullable();
            $table->string('evidence_image_path')->nullable();
            $table->decimal('gps_lat', 10, 7)->nullable();
            $table->decimal('gps_long', 10, 7)->nullable();
            $table->string('amount_words_en')->nullable();
            $table->string('amount_words_ar')->nullable();
            $table->enum('status', ['draft', 'synced', 'archived'])->default('draft');
            $table->string('peppol_xml_path')->nullable();
            $table->string('pdf_path')->nullable();
            $table->timestamps();

            // doc_number unique per tenant
            $table->unique(['tenant_id', 'doc_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
