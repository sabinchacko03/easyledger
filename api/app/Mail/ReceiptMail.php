<?php

namespace App\Mail;

use App\Models\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class ReceiptMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Document $document,
        public readonly string $pdfPath,
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->document->type === '381'
            ? "Credit Note {$this->document->doc_number}"
            : "Receipt {$this->document->doc_number}";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.receipt');
    }

    public function attachments(): array
    {
        return [
            Attachment::fromStorageDisk('local', $this->pdfPath)
                ->as("{$this->document->doc_number}.pdf")
                ->withMime('application/pdf'),
        ];
    }
}
