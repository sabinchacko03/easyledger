<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PdfController extends Controller
{
    public function download(Request $request, Document $document, PdfService $pdfService): StreamedResponse
    {
        // Regenerate if not yet generated
        if (! $document->pdf_path || ! Storage::exists($document->pdf_path)) {
            $pdfService->generate($document);
            $document->refresh();
        }

        return Storage::download(
            $document->pdf_path,
            "{$document->doc_number}.pdf",
            ['Content-Type' => 'application/pdf']
        );
    }
}
