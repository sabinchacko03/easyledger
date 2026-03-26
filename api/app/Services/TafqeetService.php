<?php

namespace App\Services;

class TafqeetService
{
    private array $onesEn = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
        'Seventeen', 'Eighteen', 'Nineteen',
    ];

    private array $tensEn = [
        '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
    ];

    private array $onesAr = [
        '', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة',
        'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر',
        'سبعة عشر', 'ثمانية عشر', 'تسعة عشر',
    ];

    private array $tensAr = [
        '', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون',
    ];

    public function toEnglish(float|string $amount): string
    {
        [$dirhams, $fils] = $this->split($amount);

        $result = 'UAE Dirhams ' . $this->convertEn((int) $dirhams);

        if ($fils > 0) {
            $result .= ' and ' . $this->convertEn($fils) . ' Fils';
        }

        return $result . ' Only';
    }

    public function toArabic(float|string $amount): string
    {
        [$dirhams, $fils] = $this->split($amount);

        $result = 'فقط ' . $this->convertAr((int) $dirhams) . ' درهم إماراتي';

        if ($fils > 0) {
            $result .= ' و' . $this->convertAr($fils) . ' فلس';
        }

        return $result . ' لا غير';
    }

    private function split(float|string $amount): array
    {
        $parts = explode('.', number_format((float) $amount, 2, '.', ''));
        return [(int) $parts[0], (int) ($parts[1] ?? 0)];
    }

    private function convertEn(int $n): string
    {
        if ($n === 0) return 'Zero';
        if ($n < 20) return $this->onesEn[$n];
        if ($n < 100) return $this->tensEn[(int) ($n / 10)] . ($n % 10 ? ' ' . $this->onesEn[$n % 10] : '');
        if ($n < 1000) return $this->onesEn[(int) ($n / 100)] . ' Hundred' . ($n % 100 ? ' ' . $this->convertEn($n % 100) : '');
        if ($n < 1_000_000) return $this->convertEn((int) ($n / 1000)) . ' Thousand' . ($n % 1000 ? ' ' . $this->convertEn($n % 1000) : '');
        if ($n < 1_000_000_000) return $this->convertEn((int) ($n / 1_000_000)) . ' Million' . ($n % 1_000_000 ? ' ' . $this->convertEn($n % 1_000_000) : '');

        return $this->convertEn((int) ($n / 1_000_000_000)) . ' Billion' . ($n % 1_000_000_000 ? ' ' . $this->convertEn($n % 1_000_000_000) : '');
    }

    private function convertAr(int $n): string
    {
        if ($n === 0) return 'صفر';
        if ($n < 20) return $this->onesAr[$n];
        if ($n < 100) return $this->tensAr[(int) ($n / 10)] . ($n % 10 ? ' و' . $this->onesAr[$n % 10] : '');
        if ($n < 1000) return $this->onesAr[(int) ($n / 100)] . ' مئة' . ($n % 100 ? ' و' . $this->convertAr($n % 100) : '');
        if ($n < 1_000_000) return $this->convertAr((int) ($n / 1000)) . ' ألف' . ($n % 1000 ? ' و' . $this->convertAr($n % 1000) : '');
        if ($n < 1_000_000_000) return $this->convertAr((int) ($n / 1_000_000)) . ' مليون' . ($n % 1_000_000 ? ' و' . $this->convertAr($n % 1_000_000) : '');

        return $this->convertAr((int) ($n / 1_000_000_000)) . ' مليار' . ($n % 1_000_000_000 ? ' و' . $this->convertAr($n % 1_000_000_000) : '');
    }
}
