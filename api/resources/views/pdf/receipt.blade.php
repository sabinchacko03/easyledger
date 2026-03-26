<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  /* ── Base ─────────────────────────────────────────────────────── */
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Cairo', DejaVu Sans, sans-serif;
    font-size: 11px;
    color: #1a1a1a;
    background: #fff;
  }

  /* ── Page structure ───────────────────────────────────────────── */
  .page {
    width: 100%;
    padding: 24px 28px;
  }

  /* ── Header ───────────────────────────────────────────────────── */
  .header {
    width: 100%;
    border-bottom: 2px solid #208AEF;
    padding-bottom: 12px;
    margin-bottom: 16px;
  }

  .header-inner {
    width: 100%;
  }

  .header-left {
    display: inline-block;
    width: 48%;
    vertical-align: top;
  }

  .header-right {
    display: inline-block;
    width: 48%;
    vertical-align: top;
    text-align: right;
    direction: rtl;
  }

  .company-name-en {
    font-size: 16px;
    font-weight: bold;
    color: #208AEF;
  }

  .company-name-ar {
    font-size: 16px;
    font-weight: bold;
    color: #208AEF;
  }

  .company-meta {
    font-size: 9px;
    color: #555;
    margin-top: 3px;
    line-height: 1.5;
  }

  /* ── Document title band ──────────────────────────────────────── */
  .title-band {
    background: #208AEF;
    color: #fff;
    padding: 7px 14px;
    margin-bottom: 16px;
    border-radius: 4px;
  }

  .title-band-left {
    display: inline-block;
    width: 49%;
    font-size: 13px;
    font-weight: bold;
  }

  .title-band-right {
    display: inline-block;
    width: 49%;
    text-align: right;
    font-size: 13px;
    font-weight: bold;
    direction: rtl;
  }

  /* ── Meta info row ────────────────────────────────────────────── */
  .meta-row {
    width: 100%;
    margin-bottom: 14px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    padding: 8px 12px;
  }

  .meta-cell {
    display: inline-block;
    width: 32%;
    vertical-align: top;
  }

  .meta-label-en { font-size: 8px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
  .meta-label-ar { font-size: 9px; color: #888; direction: rtl; text-align: right; }
  .meta-value { font-size: 11px; font-weight: bold; color: #111; margin-top: 2px; }
  .meta-value-ar { font-size: 11px; font-weight: bold; color: #111; direction: rtl; text-align: right; margin-top: 2px; }

  /* ── Parties ──────────────────────────────────────────────────── */
  .parties {
    width: 100%;
    margin-bottom: 14px;
  }

  .party-box {
    display: inline-block;
    width: 48%;
    vertical-align: top;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    padding: 10px 12px;
  }

  .party-box-ar {
    display: inline-block;
    width: 48%;
    vertical-align: top;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    padding: 10px 12px;
    direction: rtl;
    text-align: right;
    margin-right: 4%;
  }

  .party-title {
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #208AEF;
    font-weight: bold;
    margin-bottom: 5px;
  }

  .party-name { font-size: 12px; font-weight: bold; }
  .party-meta { font-size: 9px; color: #555; margin-top: 2px; line-height: 1.5; }

  /* ── Amount block ─────────────────────────────────────────────── */
  .amount-block {
    background: #f0f7ff;
    border: 1px solid #208AEF;
    border-radius: 4px;
    padding: 12px 16px;
    margin-bottom: 14px;
    text-align: center;
  }

  .amount-label { font-size: 8px; color: #208AEF; text-transform: uppercase; letter-spacing: 0.5px; }
  .amount-value { font-size: 22px; font-weight: bold; color: #208AEF; margin: 4px 0; }
  .amount-words-en { font-size: 9px; color: #444; margin-top: 2px; }
  .amount-words-ar { font-size: 10px; color: #444; direction: rtl; margin-top: 3px; }

  /* ── Description ──────────────────────────────────────────────── */
  .description-box {
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    padding: 8px 12px;
    margin-bottom: 14px;
    color: #333;
    font-size: 10px;
    line-height: 1.6;
  }

  /* ── Payment row ──────────────────────────────────────────────── */
  .payment-row {
    width: 100%;
    margin-bottom: 16px;
  }

  .payment-pill {
    display: inline-block;
    background: #dcfce7;
    color: #166534;
    border-radius: 20px;
    padding: 4px 14px;
    font-size: 10px;
    font-weight: bold;
  }

  /* ── Footer / Signatures ──────────────────────────────────────── */
  .sig-row {
    width: 100%;
    margin-top: 20px;
    border-top: 1px dashed #ccc;
    padding-top: 14px;
  }

  .sig-box {
    display: inline-block;
    width: 40%;
    text-align: center;
    vertical-align: top;
  }

  .sig-line {
    border-top: 1px solid #111;
    margin: 0 10px 4px 10px;
  }

  .sig-label { font-size: 8px; color: #888; }

  /* ── Footer note ──────────────────────────────────────────────── */
  .footer {
    margin-top: 16px;
    padding-top: 8px;
    border-top: 1px solid #e5e7eb;
    font-size: 8px;
    color: #aaa;
    text-align: center;
  }

  /* ── GPS / QR row ─────────────────────────────────────────────── */
  .gps-row {
    font-size: 8px;
    color: #bbb;
    margin-top: 4px;
    text-align: center;
  }

  .badge-draft {
    display: inline-block;
    background: #fef3c7;
    color: #92400e;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 9px;
  }

  .badge-synced {
    display: inline-block;
    background: #dcfce7;
    color: #166534;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 9px;
  }
</style>
</head>
<body>
<div class="page">

  {{-- ── HEADER ─────────────────────────────────────────────── --}}
  <div class="header">
    <div class="header-inner">
      <div class="header-left">
        <div class="company-name-en">{{ $tenant->name }}</div>
        <div class="company-meta">
          @if($tenant->trn) TRN: {{ $tenant->trn }}<br>@endif
          @if($tenant->email) {{ $tenant->email }}<br>@endif
          @if($tenant->address) {{ $tenant->address }}@if($tenant->emirate), {{ $tenant->emirate }}@endif@endif
        </div>
      </div>
      <div class="header-right">
        <div class="company-name-ar">{{ $tenant->name }}</div>
        <div class="company-meta" style="direction:rtl;">
          @if($tenant->trn)الرقم الضريبي: {{ $tenant->trn }}<br>@endif
          @if($tenant->email){{ $tenant->email }}<br>@endif
        </div>
      </div>
    </div>
  </div>

  {{-- ── TITLE BAND ──────────────────────────────────────────── --}}
  <div class="title-band">
    <span class="title-band-left">
      {{ $document->type === '381' ? 'CREDIT NOTE' : 'PAYMENT RECEIPT' }}
    </span>
    <span class="title-band-right">
      {{ $document->type === '381' ? 'إشعار دائن' : 'إيصال استلام' }}
    </span>
  </div>

  {{-- ── META ─────────────────────────────────────────────────── --}}
  <div class="meta-row">
    <div class="meta-cell">
      <div class="meta-label-en">Document No.</div>
      <div class="meta-value">{{ $document->doc_number }}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label-en">Date</div>
      <div class="meta-value">{{ $document->created_at->format('d M Y') }}</div>
    </div>
    <div class="meta-cell" style="text-align:right;">
      <div class="meta-label-ar">رقم الوثيقة / التاريخ</div>
      <div class="meta-value-ar">{{ $document->created_at->locale('ar')->isoFormat('D MMMM YYYY') }}</div>
    </div>
  </div>

  {{-- ── PARTIES ──────────────────────────────────────────────── --}}
  <div class="parties">
    {{-- Supplier --}}
    <div class="party-box">
      <div class="party-title">Received From / الموّرد</div>
      <div class="party-name">{{ $tenant->name }}</div>
      @if($tenant->trn)
        <div class="party-meta">TRN: {{ $tenant->trn }}</div>
      @endif
      @if($tenant->city || $tenant->emirate)
        <div class="party-meta">{{ collect([$tenant->city, $tenant->emirate])->filter()->implode(', ') }}</div>
      @endif
    </div>

    {{-- Customer --}}
    <div class="party-box" style="margin-left:4%;">
      <div class="party-title">Paid To / العميل</div>
      <div class="party-name">{{ $customer->name }}</div>
      @if($customer->trn)
        <div class="party-meta">TRN: {{ $customer->trn }}</div>
      @endif
      @if($customer->phone)
        <div class="party-meta">{{ $customer->phone }}</div>
      @endif
      @if($customer->email)
        <div class="party-meta">{{ $customer->email }}</div>
      @endif
    </div>
  </div>

  {{-- ── AMOUNT ───────────────────────────────────────────────── --}}
  <div class="amount-block">
    <div class="amount-label">Amount Received / المبلغ المستلم</div>
    <div class="amount-value">AED {{ number_format($document->amount, 2) }}</div>
    @if($document->amount_words_en)
      <div class="amount-words-en">{{ $document->amount_words_en }}</div>
    @endif
    @if($document->amount_words_ar)
      <div class="amount-words-ar">{{ $arText }}</div>
    @endif
  </div>

  {{-- ── DESCRIPTION ─────────────────────────────────────────── --}}
  @if($document->description)
  <div class="description-box">
    <strong>Description / البيان:</strong><br>
    {{ $document->description }}
  </div>
  @endif

  {{-- ── PAYMENT MODE ─────────────────────────────────────────── --}}
  @if($document->payment_mode)
  <div class="payment-row">
    <strong style="font-size:9px;">Payment Mode / طريقة الدفع:</strong>&nbsp;
    <span class="payment-pill">{{ $document->payment_mode }}</span>
  </div>
  @endif

  {{-- ── SALESPERSON ──────────────────────────────────────────── --}}
  <div style="font-size:9px; color:#555; margin-bottom:14px;">
    Collected by / بواسطة: <strong>{{ $salesperson->name }}</strong>
    @if($salesperson->salespersonProfile?->employee_id)
      &nbsp;({{ $salesperson->salespersonProfile->employee_id }})
    @endif
  </div>

  {{-- ── STATUS BADGE ────────────────────────────────────────── --}}
  <div style="margin-bottom:14px;">
    @if($document->status === 'synced')
      <span class="badge-synced">✓ Verified</span>
    @else
      <span class="badge-draft">Draft</span>
    @endif
  </div>

  {{-- ── SIGNATURES ───────────────────────────────────────────── --}}
  <div class="sig-row">
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">Authorised Signatory / توقيع مفوّض</div>
    </div>
    <div class="sig-box" style="float:right;">
      <div class="sig-line"></div>
      <div class="sig-label">Receiver's Signature / توقيع المستلم</div>
    </div>
  </div>

  {{-- ── FOOTER ───────────────────────────────────────────────── --}}
  <div class="footer">
    This document was generated electronically and is valid without a physical signature.
    <br>
    هذه الوثيقة مولّدة إلكترونياً وهي صالحة دون توقيع مادي.
  </div>

  @if($document->gps_lat && $document->gps_long)
  <div class="gps-row">
    GPS: {{ $document->gps_lat }}, {{ $document->gps_long }}
  </div>
  @endif

</div>
</body>
</html>
