<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activate your {{ config('app.name') }} account</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f0f4f8; margin: 0; min-height: 100vh;
               display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { background: #fff; border-radius: 16px; padding: 40px; max-width: 480px; width: 100%;
                box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .logo { font-size: 28px; font-weight: bold; color: #208AEF; margin-bottom: 24px; }
        h1 { font-size: 22px; color: #111; margin: 0 0 6px; }
        .subtitle { color: #777; font-size: 14px; margin-bottom: 28px; }
        .field-group { margin-bottom: 16px; }
        label { display: block; font-size: 13px; font-weight: bold; color: #555; margin-bottom: 4px; }
        .readonly { background: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 8px;
                    padding: 10px 14px; font-size: 14px; color: #333; }
        input[type="password"] { width: 100%; border: 1px solid #d0d0d0; border-radius: 8px;
                                  padding: 10px 14px; font-size: 14px; color: #111; outline: none; }
        input[type="password"]:focus { border-color: #208AEF; box-shadow: 0 0 0 3px rgba(32,138,239,0.15); }
        .btn { width: 100%; background: #208AEF; color: #fff; border: none; border-radius: 10px;
               padding: 14px; font-size: 15px; font-weight: bold; cursor: pointer; margin-top: 8px; }
        .btn:hover { background: #1a7ad4; }
        .error { background: #fff0f0; border: 1px solid #fcc; border-radius: 8px;
                 padding: 12px 16px; color: #c00; font-size: 13px; margin-bottom: 16px; }
        .divider { border: none; border-top: 1px solid #f0f0f0; margin: 24px 0; }
        .note { font-size: 12px; color: #aaa; text-align: center; }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo">{{ config('app.name') }}</div>
        <h1>Activate your account</h1>
        <p class="subtitle">Review your company details below, then set a password to complete registration.</p>

        @if ($errors->any())
            <div class="error">
                @foreach ($errors->all() as $error)
                    <div>{{ $error }}</div>
                @endforeach
            </div>
        @endif

        <div class="field-group">
            <label>Name</label>
            <div class="readonly">{{ $invitation->name }}</div>
        </div>

        <div class="field-group">
            <label>Email</label>
            <div class="readonly">{{ $invitation->email }}</div>
        </div>

        <div class="field-group">
            <label>Company Name</label>
            <div class="readonly">{{ $invitation->company_name }}</div>
        </div>

        @if ($invitation->company_address)
        <div class="field-group">
            <label>Address</label>
            <div class="readonly">{{ $invitation->company_address }}</div>
        </div>
        @endif

        <div class="field-group">
            <label>TRN</label>
            <div class="readonly">{{ $invitation->trn }}</div>
        </div>

        @if ($invitation->tin)
        <div class="field-group">
            <label>TIN</label>
            <div class="readonly">{{ $invitation->tin }}</div>
        </div>
        @endif

        <hr class="divider">

        <form method="POST" action="{{ route('invite.register', $invitation->token) }}">
            @csrf
            <div class="field-group">
                <label for="password">Choose a Password</label>
                <input type="password" id="password" name="password" placeholder="At least 8 characters" required>
            </div>
            <div class="field-group">
                <label for="password_confirmation">Confirm Password</label>
                <input type="password" id="password_confirmation" name="password_confirmation" placeholder="Repeat password" required>
            </div>
            <button type="submit" class="btn">Create Account &amp; Activate</button>
        </form>

        <p class="note" style="margin-top:20px;">
            This invitation expires {{ $invitation->token_expires_at->diffForHumans() }}.
        </p>
    </div>
</body>
</html>
