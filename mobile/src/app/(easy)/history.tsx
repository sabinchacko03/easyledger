import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEasyProfile } from '@/lib/auth-context';
import { EasyReceipt, EasyReceiptStore } from '@/lib/db';
import { toArabic, toEnglish } from '@/lib/tafqeet';

async function logoToBase64(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    // Detect type from URI extension; fallback to jpeg
    const ext = uri.split('.').pop()?.toLowerCase();
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${base64}`;
  } catch {
    return '';
  }
}

interface ChequeItem {
  chequeNo: string;
  amount: string;
}

function buildReceiptHtml(params: {
  companyName: string;
  trn?: string;
  address?: string;
  logoDataUri?: string;
  customerName: string;
  customerPhone?: string | null;
  amount: number;
  paymentMode?: string | null;
  chequeDetails?: ChequeItem[] | null;
  description?: string | null;
  dateEn: string;
  dateAr: string;
  amountWordsEn: string;
  amountWordsAr: string;
}): string {
  const {
    companyName, trn, address, logoDataUri,
    customerName, customerPhone,
    amount, paymentMode, chequeDetails, description,
    dateEn, dateAr, amountWordsEn, amountWordsAr,
  } = params;

  const logoHtml = logoDataUri
    ? `<img src="${logoDataUri}" style="height:50px;margin-bottom:6px;display:block;" />`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a1a; background: #fff; margin: 28px 32px; }
  .page { width: 100%; }
  .two-col { width: 100%; border-collapse: collapse; }
  .two-col td { vertical-align: top; padding: 0; }
  .header { width: 100%; border-bottom: 2px solid #208AEF; padding-bottom: 12px; margin-bottom: 16px; }
  .company-name { font-size: 16px; font-weight: bold; color: #208AEF; }
  .company-meta { font-size: 9px; color: #555; margin-top: 3px; line-height: 1.6; }
  .title-band { background: #208AEF; color: #fff; padding: 7px 14px; margin-bottom: 16px; border-radius: 3px; }
  .title-en { font-size: 13px; font-weight: bold; }
  .title-ar { font-size: 13px; font-weight: bold; text-align: right; direction: rtl; }
  .meta-row { width: 100%; margin-bottom: 14px; border: 1px solid #e5e7eb; border-radius: 3px; padding: 8px 12px; }
  .meta-label { font-size: 8px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
  .meta-value { font-size: 11px; font-weight: bold; color: #111; margin-top: 2px; }
  .party-box { border: 1px solid #e5e7eb; border-radius: 3px; padding: 10px 12px; }
  .party-title { font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; color: #208AEF; font-weight: bold; margin-bottom: 5px; }
  .party-name { font-size: 12px; font-weight: bold; }
  .party-meta { font-size: 9px; color: #555; margin-top: 2px; line-height: 1.5; }
  .amount-block { background: #f0f7ff; border: 1px solid #208AEF; border-radius: 3px; padding: 12px 16px; margin-bottom: 14px; text-align: center; }
  .amount-label { font-size: 8px; color: #208AEF; text-transform: uppercase; letter-spacing: 0.5px; }
  .amount-value { font-size: 22px; font-weight: bold; color: #208AEF; margin: 4px 0; }
  .amount-words-en { font-size: 9px; color: #444; margin-top: 2px; }
  .amount-words-ar { font-size: 10px; color: #444; direction: rtl; margin-top: 3px; }
  .description-box { border: 1px solid #e5e7eb; border-radius: 3px; padding: 8px 12px; margin-bottom: 14px; color: #333; font-size: 10px; line-height: 1.6; }
  .payment-row { margin-bottom: 16px; }
  .payment-pill { display: inline-block; background: #dcfce7; color: #166534; border-radius: 20px; padding: 4px 14px; font-size: 10px; font-weight: bold; }
  .cheque-table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 14px; font-size: 10px; }
  .cheque-table th { background: #f0f7ff; color: #208AEF; text-align: left; padding: 5px 8px; border: 1px solid #d1e8fd; font-size: 9px; text-transform: uppercase; letter-spacing: 0.4px; }
  .cheque-table td { padding: 5px 8px; border: 1px solid #e5e7eb; }
  .cheque-table tr:nth-child(even) td { background: #fafafa; }
  .sig-row { margin-top: 24px; border-top: 1px dashed #ccc; padding-top: 14px; }
  .sig-box { text-align: center; }
  .sig-line { border-top: 1px solid #111; margin: 0 10px 4px 10px; }
  .sig-label { font-size: 8px; color: #888; }
  .footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 8px; color: #aaa; text-align: center; line-height: 1.6; }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <table class="two-col">
      <tr>
        <td width="60%">
          ${logoHtml}
          <div class="company-name">${companyName}</div>
          <div class="company-meta">
            ${trn ? `TRN: ${trn}<br/>` : ''}
            ${address ? address : ''}
          </div>
        </td>
        <td width="40%" style="text-align:right; vertical-align:bottom;">
          <div style="font-size:18px; font-weight:bold; color:#208AEF; letter-spacing:1px;">RECEIPT</div>
          <div class="company-meta" style="margin-top:4px;">UAE</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- TITLE BAND -->
  <div class="title-band">
    <table class="two-col">
      <tr>
        <td class="title-en">PAYMENT RECEIPT</td>
        <td class="title-ar">إيصال استلام</td>
      </tr>
    </table>
  </div>

  <!-- META -->
  <div class="meta-row">
    <table class="two-col">
      <tr>
        <td width="50%">
          <div class="meta-label">Date</div>
          <div class="meta-value">${dateEn}</div>
        </td>
        <td width="50%" style="text-align:right;">
          <div class="meta-label" style="direction:rtl;">التاريخ</div>
          <div class="meta-value" style="direction:rtl;">${dateAr}</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- PARTIES -->
  <table class="two-col" style="margin-bottom:14px;">
    <tr>
      <td width="48%">
        <div class="party-box">
          <div class="party-title">Received From</div>
          <div class="party-name">${customerName}</div>
          ${customerPhone ? `<div class="party-meta">${customerPhone}</div>` : ''}
        </div>
      </td>
      <td width="4%"></td>
      <td width="48%">
        <div class="party-box">
          <div class="party-title">Paid To</div>
          <div class="party-name">${companyName}</div>
          ${trn ? `<div class="party-meta">TRN: ${trn}</div>` : ''}
        </div>
      </td>
    </tr>
  </table>

  <!-- AMOUNT -->
  <div class="amount-block">
    <div class="amount-label">Amount Received</div>
    <div class="amount-value">AED ${amount.toFixed(2)}</div>
    <div class="amount-words-en">${amountWordsEn}</div>
    <div class="amount-words-ar">${amountWordsAr}</div>
  </div>

  <!-- DESCRIPTION -->
  ${description ? `<div class="description-box"><strong>Description:</strong><br/>${description}</div>` : ''}

  <!-- PAYMENT MODE -->
  ${paymentMode ? `
  <div class="payment-row">
    <strong style="font-size:9px;">Payment Mode:</strong>&nbsp;
    <span class="payment-pill">${paymentMode}</span>
  </div>` : ''}

  <!-- CHEQUE DETAILS -->
  ${paymentMode === 'Cheque' && chequeDetails && chequeDetails.length > 0 ? `
  <table class="cheque-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Cheque No.</th>
        <th style="text-align:right;">Amount (AED)</th>
      </tr>
    </thead>
    <tbody>
      ${chequeDetails.map((c, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${c.chequeNo || '—'}</td>
        <td style="text-align:right;">${parseFloat(c.amount || '0').toFixed(2)}</td>
      </tr>`).join('')}
    </tbody>
  </table>` : ''}

  <!-- SIGNATURES -->
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

  <!-- FOOTER -->
  <div class="footer">
    This document is an electronically generated ledger record and does not constitute a formal VAT tax invoice under UAE Federal Decree-Law No. 8 of 2017.<br/>
    For official VAT invoices, please request a formal document from the supplier.<br/>
    Generated by EasyLedger &mdash; ${new Date().getFullYear()}
  </div>

</div>
</body>
</html>`;
}

export default function EasyHistoryScreen() {
  const insets = useSafeAreaInsets();
  const profile = useEasyProfile();
  const [receipts, setReceipts] = useState<EasyReceipt[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sharingUuid, setSharingUuid] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile?.trn) return;
    const all = await EasyReceiptStore.getAll(profile.trn);
    setReceipts(all);
  }, [profile?.trn]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleShare(item: EasyReceipt) {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Not supported', 'Sharing is not available on this device.');
      return;
    }

    setSharingUuid(item.uuid);
    try {
      const date = new Date(item.created_at_local);
      const dateEn = date.toLocaleDateString('en-AE', { day: 'numeric', month: 'long', year: 'numeric' });
      const dateAr = date.toLocaleDateString('ar-AE', { day: 'numeric', month: 'long', year: 'numeric' });

      const logoDataUri = profile?.logo_uri
        ? await logoToBase64(profile.logo_uri)
        : undefined;

      let chequeDetails: ChequeItem[] | null = null;
      if (item.cheque_details) {
        try { chequeDetails = JSON.parse(item.cheque_details); } catch { /* ignore */ }
      }

      const html = buildReceiptHtml({
        companyName: profile?.company_name ?? '',
        trn: profile?.trn,
        address: profile?.company_address,
        logoDataUri,
        customerName: item.customer_name,
        customerPhone: item.customer_phone,
        amount: item.amount,
        paymentMode: item.payment_mode,
        chequeDetails,
        description: item.description,
        dateEn,
        dateAr,
        amountWordsEn: toEnglish(item.amount),
        amountWordsAr: toArabic(item.amount),
      });

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Receipt — ${item.customer_name}`,
      });
    } catch {
      Alert.alert('Error', 'Failed to generate receipt PDF.');
    } finally {
      setSharingUuid(null);
    }
  }

  return (
    <FlatList
      className="flex-1 bg-gray-50"
      data={receipts}
      keyExtractor={(item) => item.uuid}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: insets.top + 8,
        paddingBottom: 32,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#208AEF" />
      }
      ListHeaderComponent={
        <Text className="text-lg font-bold text-gray-900 mb-4 mt-2">Receipt History</Text>
      }
      ListEmptyComponent={
        <View className="items-center justify-center py-24">
          <Text style={{ fontSize: 40 }}>🧾</Text>
          <Text className="text-gray-400 text-base mt-3">No receipts yet</Text>
          <Text className="text-gray-300 text-sm mt-1">Tap New Receipt to get started</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">{item.customer_name}</Text>
              {item.customer_phone ? (
                <Text className="text-xs text-gray-500 mt-0.5">{item.customer_phone}</Text>
              ) : null}
              {item.payment_mode ? (
                <Text className="text-xs text-gray-400 mt-1">{item.payment_mode}</Text>
              ) : null}
              {item.description ? (
                <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={2}>{item.description}</Text>
              ) : null}
            </View>
            <View className="items-end ml-4">
              <Text className="text-lg font-bold text-gray-900">
                AED {Number(item.amount).toFixed(2)}
              </Text>
              <View className={`mt-1 px-2 py-0.5 rounded-full ${item.synced ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <Text className={`text-xs font-medium ${item.synced ? 'text-green-700' : 'text-yellow-700'}`}>
                  {item.synced ? 'synced' : 'local'}
                </Text>
              </View>
            </View>
          </View>
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-xs text-gray-400">
              {new Date(item.created_at_local).toLocaleDateString('en-AE', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </Text>
            <TouchableOpacity
              className="flex-row items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5"
              onPress={() => handleShare(item)}
              disabled={sharingUuid === item.uuid}
            >
              {sharingUuid === item.uuid ? (
                <ActivityIndicator size="small" color="#208AEF" />
              ) : (
                <Text className="text-xs font-medium text-primary">Share PDF</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}
