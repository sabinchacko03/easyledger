<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Already Registered — ReceiptApp</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f0f4f8; margin: 0; min-height: 100vh;
               display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { background: #fff; border-radius: 16px; padding: 40px; max-width: 400px; width: 100%;
                box-shadow: 0 4px 24px rgba(0,0,0,0.08); text-align: center; }
        .icon { font-size: 48px; margin-bottom: 16px; }
        h1 { font-size: 22px; color: #111; margin: 0 0 10px; }
        p { color: #777; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">✅</div>
        <h1>Already registered</h1>
        <p>
            This invitation has already been used to create an account for
            <strong>{{ $invitation->company_name }}</strong>.
            You can log in to the ReceiptApp with <strong>{{ $invitation->email }}</strong>.
        </p>
    </div>
</body>
</html>
