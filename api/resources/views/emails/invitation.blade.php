<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete your {{ config('app.name') }} registration</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 40px; }
        .logo { font-size: 32px; font-weight: bold; color: #208AEF; margin-bottom: 24px; }
        h1 { font-size: 22px; color: #111; margin-bottom: 8px; }
        p { color: #555; line-height: 1.6; margin: 0 0 16px; }
        .company { font-weight: bold; color: #111; }
        .btn { display: inline-block; background: #208AEF; color: #fff; text-decoration: none;
               padding: 14px 28px; border-radius: 8px; font-weight: bold; margin: 16px 0; }
        .meta { font-size: 13px; color: #999; border-top: 1px solid #eee; padding-top: 16px; margin-top: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">R</div>
        <h1>You're almost there, {{ $invitation->name }}!</h1>
        <p>
            Your company <span class="company">{{ $invitation->company_name }}</span> has been invited
            to join <strong>{{ config('app.name') }}</strong>. All the receipts generated on the mobile app will be
            transferred to your account once you complete registration.
        </p>
        <p>Click the button below to set your password and activate your account:</p>
        <a href="{{ $registrationUrl }}" class="btn">Activate Account</a>
        <p style="word-break:break-all;">
            Or copy this link: <a href="{{ $registrationUrl }}">{{ $registrationUrl }}</a>
        </p>
        <div class="meta">
            This invitation link expires on {{ $invitation->token_expires_at->format('d M Y') }}.
            If you did not expect this email, please ignore it.
        </div>
    </div>
</body>
</html>
