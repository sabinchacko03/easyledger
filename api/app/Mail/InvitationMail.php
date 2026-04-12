<?php

namespace App\Mail;

use App\Models\EasyInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $registrationUrl;

    public function __construct(public readonly EasyInvitation $invitation)
    {
        $this->registrationUrl = route('invite.show', $invitation->token);
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Complete your ReceiptApp registration');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.invitation');
    }
}
