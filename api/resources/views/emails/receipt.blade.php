<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; color: #333; }
  .wrapper { max-width: 560px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
  .header { background: #208AEF; padding: 24px 32px; color: #fff; }
  .header h1 { margin: 0; font-size: 20px; }
  .header p { margin: 4px 0 0; font-size: 13px; opacity: .85; }
  .body { padding: 28px 32px; }
  .highlight { background: #f0f7ff; border-left: 4px solid #208AEF; padding: 14px 18px; border-radius: 4px; margin: 20px 0; }
  .highlight .amount { font-size: 26px; font-weight: bold; color: #208AEF; }
  .highlight .words { font-size: 12px; color: #555; margin-top: 4px; }
  .highlight .words-ar { font-size: 12px; color: #555; text-align: right; direction: rtl; margin-top: 2px; }
  .detail-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
  .detail-row .label { color: #888; }
  .detail-row .value { font-weight: 600; }
  .footer { background: #f9fafb; padding: 16px 32px; font-size: 11px; color: #aaa; text-align: center; line-height: 1.6; }
  .btn { display: inline-block; margin-top: 20px; padding: 12px 28px; background: #208AEF; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold; }
</style>
</head>
<body>
<div class="wrapper">

  <div class="header">
    <h1>
      @if($document->type === '381')
        Credit Note — {{ $document->doc_number }}
      @else
        Payment Receipt — {{ $document->doc_number }}
      @endif
    </h1>
    <p>{{ $document->tenant->name }}</p>
  </div>

  <div class="body">
    <p>Dear <strong>{{ $document->customer->name }}</strong>,</p>
    <p style="color:#555; font-size:13px; margin-top:8px;">
      @if($document->type === '381')
        Please find attached your credit note for the amount below.
      @else
        Please find attached your payment receipt confirming the following transaction.
      @endif
    </p>

    <div class="highlight">
      <div class="amount">AED {{ number_format($document->amount, 2) }}</div>
      @if($document->amount_words_en)
        <div class="words">{{ $document->amount_words_en }}</div>
      @endif
      @if($document->amount_words_ar)
        <div class="words-ar">{{ $document->amount_words_ar }}</div>
      @endif
    </div>

    <div class="detail-row">
      <span class="label">Document No.</span>
      <span class="value">{{ $document->doc_number }}</span>
    </div>
    <div class="detail-row">
      <span class="label">Date</span>
      <span class="value">{{ $document->created_at->format('d M Y') }}</span>
    </div>
    @if($document->payment_mode)
    <div class="detail-row">
      <span class="label">Payment Mode</span>
      <span class="value">{{ $document->payment_mode }}</span>
    </div>
    @endif
    @if($document->description)
    <div class="detail-row">
      <span class="label">Description</span>
      <span class="value" style="max-width:300px; text-align:right;">{{ $document->description }}</span>
    </div>
    @endif
    <div class="detail-row">
      <span class="label">Collected By</span>
      <span class="value">{{ $document->salesperson->name }}</span>
    </div>

    <p style="font-size:12px; color:#aaa; margin-top:20px;">
      The PDF receipt is attached to this email for your records.
    </p>
  </div>

  <div class="footer">
    {{ $document->tenant->name }}
    @if($document->tenant->email) · {{ $document->tenant->email }}@endif
    @if($document->tenant->trn) · TRN: {{ $document->tenant->trn }}@endif
    <br>
    This is an automatically generated email. Please do not reply.
  </div>

</div>
</body>
</html>
