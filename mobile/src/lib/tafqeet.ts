// Port of TafqeetService.php — converts AED amounts to English and Arabic words

const onesEn = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const tensEn = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const onesAr = [
  '', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة',
  'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر',
  'سبعة عشر', 'ثمانية عشر', 'تسعة عشر',
];
const tensAr = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];

function splitAmount(amount: number): [number, number] {
  const formatted = amount.toFixed(2);
  const [dirhams, fils] = formatted.split('.');
  return [parseInt(dirhams, 10), parseInt(fils, 10)];
}

function convertEn(n: number): string {
  if (n === 0) return 'Zero';
  if (n < 20) return onesEn[n];
  if (n < 100) return tensEn[Math.floor(n / 10)] + (n % 10 ? ' ' + onesEn[n % 10] : '');
  if (n < 1_000) return onesEn[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertEn(n % 100) : '');
  if (n < 1_000_000) return convertEn(Math.floor(n / 1_000)) + ' Thousand' + (n % 1_000 ? ' ' + convertEn(n % 1_000) : '');
  if (n < 1_000_000_000) return convertEn(Math.floor(n / 1_000_000)) + ' Million' + (n % 1_000_000 ? ' ' + convertEn(n % 1_000_000) : '');
  return convertEn(Math.floor(n / 1_000_000_000)) + ' Billion' + (n % 1_000_000_000 ? ' ' + convertEn(n % 1_000_000_000) : '');
}

function convertAr(n: number): string {
  if (n === 0) return 'صفر';
  if (n < 20) return onesAr[n];
  if (n < 100) return tensAr[Math.floor(n / 10)] + (n % 10 ? ' و' + onesAr[n % 10] : '');
  if (n < 1_000) return onesAr[Math.floor(n / 100)] + ' مئة' + (n % 100 ? ' و' + convertAr(n % 100) : '');
  if (n < 1_000_000) return convertAr(Math.floor(n / 1_000)) + ' ألف' + (n % 1_000 ? ' و' + convertAr(n % 1_000) : '');
  if (n < 1_000_000_000) return convertAr(Math.floor(n / 1_000_000)) + ' مليون' + (n % 1_000_000 ? ' و' + convertAr(n % 1_000_000) : '');
  return convertAr(Math.floor(n / 1_000_000_000)) + ' مليار' + (n % 1_000_000_000 ? ' و' + convertAr(n % 1_000_000_000) : '');
}

export function toEnglish(amount: number): string {
  const [dirhams, fils] = splitAmount(amount);
  let result = 'UAE Dirhams ' + convertEn(dirhams);
  if (fils > 0) result += ' and ' + convertEn(fils) + ' Fils';
  return result + ' Only';
}

export function toArabic(amount: number): string {
  const [dirhams, fils] = splitAmount(amount);
  let result = 'فقط ' + convertAr(dirhams) + ' درهم إماراتي';
  if (fils > 0) result += ' و' + convertAr(fils) + ' فلس';
  return result + ' لا غير';
}
