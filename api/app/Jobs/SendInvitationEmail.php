<?php

namespace App\Jobs;

use App\Mail\InvitationMail;
use App\Models\EasyInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendInvitationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(public readonly EasyInvitation $invitation) {}

    public function handle(): void
    {
        Mail::to($this->invitation->email)->send(new InvitationMail($this->invitation));
    }

    public function failed(\Throwable $e): void
    {
        Log::error("SendInvitationEmail failed for invitation #{$this->invitation->id}: {$e->getMessage()}");
    }
}
