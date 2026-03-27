<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = Document::with(['customer:id,name', 'salesperson:id,name'])
            ->where('tenant_id', auth()->user()->tenant_id);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('doc_number', 'like', "%{$request->search}%")
                  ->orWhereHas('customer', fn($q) => $q->where('name', 'like', "%{$request->search}%"));
            });
        }

        $documents = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Documents/Index', [
            'documents' => $documents,
            'filters'   => $request->only('type', 'status', 'search'),
        ]);
    }

    public function show(Document $document)
    {
        abort_if($document->tenant_id !== auth()->user()->tenant_id, 403);

        $document->load(['customer', 'salesperson', 'parent']);

        return Inertia::render('Documents/Show', [
            'document' => $document,
        ]);
    }

    public function pdf(Document $document)
    {
        abort_if($document->tenant_id !== auth()->user()->tenant_id, 403);

        $path = app(PdfService::class)->generate($document);

        return response(Storage::get($path), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => "inline; filename=\"{$document->doc_number}.pdf\"",
        ]);
    }
}
