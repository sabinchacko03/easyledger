<?php

namespace App\Services;

use App\Models\Document;
use ArPHP\I18N\Arabic;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class PdfService
{
    public function generate(Document $document): string
    {
        $document->loadMissing(['tenant', 'customer', 'salesperson.salespersonProfile', 'parent']);

        // Pre-process Arabic text for correct glyph shaping
        $arText = $this->reshapeArabic($document->amount_words_ar ?? '');

        $logoDataUri = $this->tenantLogoDataUri($document->tenant->logo ?? null);

        $pdf = Pdf::loadView('pdf.receipt', [
            'document'     => $document,
            'tenant'       => $document->tenant,
            'customer'     => $document->customer,
            'salesperson'  => $document->salesperson,
            'arText'       => $arText,
            'logoDataUri'  => $logoDataUri,
        ]);

        $pdf->setPaper('A4', 'portrait');

        $pdf->getDomPDF()->getOptions()->set('defaultFont', 'DejaVu Sans');
        $pdf->getDomPDF()->getOptions()->set('isRemoteEnabled', false);
        $pdf->getDomPDF()->getOptions()->set('isHtml5ParserEnabled', true);

        $path = "pdfs/{$document->tenant_id}/{$document->doc_number}.pdf";

        Storage::put($path, $pdf->output());

        // Persist path on document record
        $document->updateQuietly(['pdf_path' => $path]);

        return $path;
    }

    /**
     * Convert a stored logo path to an inline base64 data URI.
     * DomPDF has isRemoteEnabled=false so external/local URLs don't load —
     * embedding as base64 is the only reliable approach.
     */
    private function tenantLogoDataUri(?string $logoPath): ?string
    {
        if (! $logoPath) return null;

        try {
            $fullPath = Storage::path($logoPath);
            if (! file_exists($fullPath)) return null;

            $data     = base64_encode(file_get_contents($fullPath));
            $mimeType = mime_content_type($fullPath) ?: 'image/jpeg';

            return "data:{$mimeType};base64,{$data}";
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Reshape Arabic text so DomPDF renders connected glyphs correctly.
     */
    private function reshapeArabic(?string $text): string
    {
        if (empty($text)) return '';

        try {
            $arabic = new Arabic();
            $p      = $arabic->arIdentify($text);
            for ($i = count($p) - 1; $i >= 0; $i -= 2) {
                $arabic_text = substr($text, $p[$i - 1], $p[$i] - $p[$i - 1]);
                $text = substr_replace($text, $arabic->utf8Glyphs($arabic_text), $p[$i - 1], $p[$i] - $p[$i - 1]);
            }
        } catch (\Throwable) {
            // If reshaping fails, return raw text
        }

        return $text;
    }
}
