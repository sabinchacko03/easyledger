<?php

namespace App\Jobs;

use App\Mail\ReceiptMail;
use App\Models\Document;
use App\Services\PdfService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendReceiptEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(public readonly Document $document) {}

    public function handle(PdfService $pdfService): void
    {
        $document = $this->document->loadMissing([
            'tenant',
            'customer',
            'salesperson.salespersonProfile',
        ]);

        // Generate (or regenerate) the PDF
        $pdfPath = $pdfService->generate($document);

        // Send to customer if they have an email
        if ($customerEmail = $document->customer->email) {
            Mail::to($customerEmail)
                ->bcc($this->bccAddresses($document))
                ->send(new ReceiptMail($document, $pdfPath));
        } else {
            // No customer email — still send BCC to tenant only
            $bcc = $this->bccAddresses($document);
            if (! empty($bcc)) {
                Mail::to($bcc[0])
                    ->send(new ReceiptMail($document, $pdfPath));
            }
        }
    }

    public function failed(\Throwable $e): void
    {
        Log::error("SendReceiptEmail failed for document #{$this->document->id}: {$e->getMessage()}");
    }

    private function bccAddresses(Document $document): array
    {
        $bcc = [];
        if ($tenantEmail = $document->tenant->email) {
            $bcc[] = $tenantEmail;
        }
        return $bcc;
    }
}
