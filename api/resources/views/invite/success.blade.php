<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Activated — ReceiptApp</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f0f4f8; margin: 0; min-height: 100vh;
               display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { background: #fff; border-radius: 16px; padding: 40px; max-width: 480px; width: 100%;
                box-shadow: 0 4px 24px rgba(0,0,0,0.08); text-align: center; }
        .icon { font-size: 56px; margin-bottom: 16px; }
        h1 { font-size: 24px; color: #111; margin: 0 0 10px; }
        p { color: #555; line-height: 1.6; }
        .email { font-weight: bold; color: #208AEF; }
        .note { background: #f0f8ff; border-radius: 10px; padding: 16px; margin-top: 24px;
                font-size: 14px; color: #333; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">🎉</div>
        <h1>Your account is ready!</h1>
        <p>
            Welcome to ReceiptApp, <strong>{{ $invitation->name }}</strong>.<br>
            Your company <strong>{{ $invitation->company_name }}</strong> is now active.
        </p>
        <div class="note">
            Open the ReceiptApp mobile app and sign in with<br>
            <span class="email">{{ $invitation->email }}</span><br>
            using the password you just set.
            <br><br>
            All receipts created in easy mode will be synced to your account automatically on next login.
        </div>
    </div>
</body>
</html>
