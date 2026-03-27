<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'DejaVu Sans', sans-serif;
    font-size: 11px;
    color: #1a1a1a;
    background: #fff;
    margin: 28px 32px;
  }

  .page { width: 100%; }

  /* Two-column table used for header and parties */
  .two-col { width: 100%; border-collapse: collapse; }
  .two-col td { vertical-align: top; padding: 0; }

  /* Header */
  .header { width: 100%; border-bottom: 2px solid #208AEF; padding-bottom: 12px; margin-bottom: 16px; }
  .company-name { font-size: 16px; font-weight: bold; color: #208AEF; }
  .company-meta { font-size: 9px; color: #555; margin-top: 3px; line-height: 1.6; }
  .rtl { direction: rtl; text-align: right; }

  /* Title band */
  .title-band { background: #208AEF; color: #fff; padding: 7px 14px; margin-bottom: 16px; border-radius: 3px; }
  .title-en { font-size: 13px; font-weight: bold; }
  .title-ar { font-size: 13px; font-weight: bold; text-align: right; direction: rtl; }

  /* Meta row */
  .meta-row { width: 100%; margin-bottom: 14px; border: 1px solid #e5e7eb; border-radius: 3px; padding: 8px 12px; }
  .meta-label { font-size: 8px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
  .meta-value { font-size: 11px; font-weight: bold; color: #111; margin-top: 2px; }

  /* Party boxes */
  .party-box { border: 1px solid #e5e7eb; border-radius: 3px; padding: 10px 12px; }
  .party-title { font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; color: #208AEF; font-weight: bold; margin-bottom: 5px; }
  .party-name { font-size: 12px; font-weight: bold; }
  .party-meta { font-size: 9px; color: #555; margin-top: 2px; line-height: 1.5; }

  /* Amount */
  .amount-block { background: #f0f7ff; border: 1px solid #208AEF; border-radius: 3px; padding: 12px 16px; margin-bottom: 14px; text-align: center; }
  .amount-label { font-size: 8px; color: #208AEF; text-transform: uppercase; letter-spacing: 0.5px; }
  .amount-value { font-size: 22px; font-weight: bold; color: #208AEF; margin: 4px 0; }
  .amount-words-en { font-size: 9px; color: #444; margin-top: 2px; }
  .amount-words-ar { font-size: 10px; color: #444; direction: rtl; margin-top: 3px; }

  /* Description */
  .description-box { border: 1px solid #e5e7eb; border-radius: 3px; padding: 8px 12px; margin-bottom: 14px; color: #333; font-size: 10px; line-height: 1.6; }

  /* Payment */
  .payment-row { margin-bottom: 16px; }
  .payment-pill { display: inline-block; background: #dcfce7; color: #166534; border-radius: 20px; padding: 4px 14px; font-size: 10px; font-weight: bold; }

  /* Badges */
  .badge-draft   { display: inline-block; background: #fef3c7; color: #92400e; border-radius: 3px; padding: 2px 8px; font-size: 9px; }
  .badge-synced  { display: inline-block; background: #dcfce7; color: #166534; border-radius: 3px; padding: 2px 8px; font-size: 9px; }

  /* Signatures */
  .sig-row { margin-top: 24px; border-top: 1px dashed #ccc; padding-top: 14px; }
  .sig-box { text-align: center; }
  .sig-line { border-top: 1px solid #111; margin: 0 10px 4px 10px; }
  .sig-label { font-size: 8px; color: #888; }

  /* Footer */
  .footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 8px; color: #aaa; text-align: center; }
  .gps-row { font-size: 8px; color: #bbb; margin-top: 4px; text-align: center; }
</style>
</head>
<body>
<div class="page">

  <?php
    $isCredit = $document->type === '381';
    $titleEn  = $isCredit ? 'CREDIT NOTE' : 'PAYMENT RECEIPT';
    $titleAr  = $isCredit
      ? "\u{0625}\u{0634}\u{0639}\u{0627}\u{0631} \u{062F}\u{0627}\u{0626}\u{0646}"
      : "\u{0625}\u{064A}\u{0635}\u{0627}\u{0644} \u{0627}\u{0633}\u{062A}\u{0644}\u{0627}\u{0645}";
    $dateAr = $document->created_at->locale('ar')->isoFormat('D MMMM YYYY');
  ?>

  {{-- HEADER --}}
  <div class="header">
    <table class="two-col">
      <tr>
        <td width="50%">
          <div class="company-name">{{ $tenant->name }}</div>
          <div class="company-meta">
            @if($tenant->trn)
              TRN: {{ $tenant->trn }}<br>
            @endif
            @if($tenant->email)
              {{ $tenant->email }}<br>
            @endif
            @if($tenant->address)
              {{ $tenant->address }}
              @if($tenant->emirate)
                , {{ $tenant->emirate }}
              @endif
            @endif
          </div>
        </td>
        <td width="50%" style="text-align:right; vertical-align:bottom;">
          <div style="font-size:18px; font-weight:bold; color:#208AEF; letter-spacing:1px;">RECEIPT</div>
          @if($tenant->emirate)
            <div class="company-meta" style="margin-top:4px;">{{ $tenant->emirate }}, UAE</div>
          @endif
        </td>
      </tr>
    </table>
  </div>

  {{-- TITLE BAND --}}
  <div class="title-band">
    <table class="two-col">
      <tr>
        <td class="title-en">{{ $titleEn }}</td>
        <td class="title-ar">{{ $titleAr }}</td>
      </tr>
    </table>
  </div>

  {{-- META --}}
  <div class="meta-row">
    <table class="two-col">
      <tr>
        <td width="33%">
          <div class="meta-label">Document No.</div>
          <div class="meta-value">{{ $document->doc_number }}</div>
        </td>
        <td width="33%">
          <div class="meta-label">Date</div>
          <div class="meta-value">{{ $document->created_at->format('d M Y') }}</div>
        </td>
        <td width="34%" style="text-align:right;">
          <div class="meta-label" style="direction:rtl;">{{ $dateAr }}</div>
        </td>
      </tr>
    </table>
  </div>

  {{-- PARENT RECEIPT (credit notes only) --}}
  @if($isCredit && $document->parent)
    <div style="background:#f5f3ff; border:1px solid #c4b5fd; border-radius:3px; padding:8px 12px; margin-bottom:14px;">
      <span style="font-size:8px; text-transform:uppercase; letter-spacing:0.5px; color:#7c3aed; font-weight:bold;">Ref. Receipt</span>
      <span style="font-size:11px; font-weight:bold; color:#4c1d95; margin-left:8px;">{{ $document->parent->doc_number }}</span>
    </div>
  @endif

  {{-- PARTIES --}}
  <table class="two-col" style="margin-bottom:14px;">
    <tr>
      <td width="48%">
        <div class="party-box">
          <div class="party-title">Received From</div>
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
      </td>
      <td width="4%"></td>
      <td width="48%">
        <div class="party-box">
          <div class="party-title">Paid To</div>
          <div class="party-name">{{ $tenant->name }}</div>
          @if($tenant->trn)
            <div class="party-meta">TRN: {{ $tenant->trn }}</div>
          @endif
          @if($tenant->city || $tenant->emirate)
            <div class="party-meta">{{ collect([$tenant->city, $tenant->emirate])->filter()->implode(', ') }}</div>
          @endif
        </div>
      </td>
    </tr>
  </table>

  {{-- AMOUNT --}}
  <div class="amount-block">
    <div class="amount-label">Amount Received</div>
    <div class="amount-value">AED {{ number_format($document->amount, 2) }}</div>
    @if($document->amount_words_en)
      <div class="amount-words-en">{{ $document->amount_words_en }}</div>
    @endif
    @if($document->amount_words_ar)
      <div class="amount-words-ar">{{ $arText }}</div>
    @endif
  </div>

  {{-- DESCRIPTION --}}
  @if($document->description)
    <div class="description-box">
      <strong>Description:</strong><br>
      {{ $document->description }}
    </div>
  @endif

  {{-- PAYMENT MODE --}}
  @if($document->payment_mode)
    <div class="payment-row">
      <strong style="font-size:9px;">Payment Mode:</strong>&nbsp;
      <span class="payment-pill">{{ $document->payment_mode }}</span>
    </div>
  @endif

  {{-- SALESPERSON --}}
  <div style="font-size:9px; color:#555; margin-bottom:14px;">
    Collected by: <strong>{{ $salesperson->name }}</strong>
    @if($salesperson->salespersonProfile && $salesperson->salespersonProfile->employee_id)
      &nbsp;({{ $salesperson->salespersonProfile->employee_id }})
    @endif
  </div>

  {{-- STATUS --}}
  <div style="margin-bottom:14px;">
    @if($document->status === 'synced')
      <span class="badge-synced">Verified</span>
    @else
      <span class="badge-draft">Draft</span>
    @endif
  </div>

  {{-- SIGNATURES --}}
  <div class="sig-row">
    <table class="two-col">
      <tr>
        <td width="40%" class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-label">Authorised Signatory</div>
        </td>
        <td width="20%"></td>
        <td width="40%" class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-label">Receiver Signature</div>
        </td>
      </tr>
    </table>
  </div>

  {{-- FOOTER --}}
  <div class="footer">
    This document was generated electronically and is valid without a physical signature.
  </div>

  @if($document->gps_lat && $document->gps_long)
    <div class="gps-row">GPS: {{ $document->gps_lat }}, {{ $document->gps_long }}</div>
  @endif

</div>
</body>
</html>
