<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendReceiptEmail;
use App\Models\Document;
use App\Services\DocNumberService;
use App\Services\TafqeetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function __construct(
        private readonly DocNumberService $docNumberService,
        private readonly TafqeetService $tafqeetService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $documents = Document::with(['customer', 'salesperson'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($documents);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'type' => ['required', 'in:380,381'],
            'parent_id' => ['required_if:type,381', 'nullable', 'integer', 'exists:documents,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string'],
            'payment_mode' => ['nullable', 'in:Cash,Cheque,Bank Transfer'],
            'gps_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'gps_long' => ['nullable', 'numeric', 'between:-180,180'],
            'evidence_image' => ['nullable', 'file', 'image', 'max:5120'],
        ]);

        $user = $request->user();
        $tenantId = $user->tenant_id;

        $docNumber = $this->docNumberService->generate($tenantId, $request->type);
        $amountWordsEn = $this->tafqeetService->toEnglish($request->amount);
        $amountWordsAr = $this->tafqeetService->toArabic($request->amount);

        $imagePath = null;
        if ($request->hasFile('evidence_image')) {
            $imagePath = $request->file('evidence_image')->store("evidence/{$tenantId}", 'public');
        }

        $document = Document::create([
            'tenant_id' => $tenantId,
            'customer_id' => $request->customer_id,
            'salesperson_id' => $user->id,
            'type' => $request->type,
            'doc_number' => $docNumber,
            'parent_id' => $request->parent_id,
            'amount' => $request->amount,
            'currency' => 'AED',
            'description' => $request->description,
            'payment_mode' => $request->payment_mode,
            'evidence_image_path' => $imagePath,
            'gps_lat' => $request->gps_lat,
            'gps_long' => $request->gps_long,
            'amount_words_en' => $amountWordsEn,
            'amount_words_ar' => $amountWordsAr,
            'status' => 'synced',
        ]);

        SendReceiptEmail::dispatch($document)->onQueue('emails');

        return response()->json($document->load('customer', 'salesperson'), 201);
    }

    public function show(Document $document): JsonResponse
    {
        return response()->json($document->load('customer', 'salesperson', 'parent', 'creditNotes'));
    }

    /**
     * Bulk sync from offline queue — accepts an array of draft receipts.
     */
    public function sync(Request $request): JsonResponse
    {
        $request->validate([
            'documents' => ['required', 'array', 'min:1'],
            'documents.*.uuid' => ['required', 'uuid'],
            'documents.*.customer_id' => ['required', 'integer', 'exists:customers,id'],
            'documents.*.type' => ['required', 'in:380,381'],
            'documents.*.amount' => ['required', 'numeric', 'min:0.01'],
            'documents.*.payment_mode' => ['nullable', 'in:Cash,Cheque,Bank Transfer'],
            'documents.*.description' => ['nullable', 'string'],
            'documents.*.gps_lat' => ['nullable', 'numeric'],
            'documents.*.gps_long' => ['nullable', 'numeric'],
            'documents.*.created_at_local' => ['nullable', 'date'],
        ]);

        $user = $request->user();
        $synced = [];
        $skipped = [];

        foreach ($request->documents as $draft) {
            // Skip already synced UUIDs
            if (Document::where('uuid', $draft['uuid'])->exists()) {
                $skipped[] = $draft['uuid'];
                continue;
            }

            $docNumber = $this->docNumberService->generate($user->tenant_id, $draft['type']);

            $doc = Document::create([
                'uuid' => $draft['uuid'],
                'tenant_id' => $user->tenant_id,
                'customer_id' => $draft['customer_id'],
                'salesperson_id' => $user->id,
                'type' => $draft['type'],
                'doc_number' => $docNumber,
                'parent_id' => $draft['parent_id'] ?? null,
                'amount' => $draft['amount'],
                'currency' => 'AED',
                'description' => $draft['description'] ?? null,
                'payment_mode' => $draft['payment_mode'] ?? null,
                'gps_lat' => $draft['gps_lat'] ?? null,
                'gps_long' => $draft['gps_long'] ?? null,
                'amount_words_en' => $this->tafqeetService->toEnglish($draft['amount']),
                'amount_words_ar' => $this->tafqeetService->toArabic($draft['amount']),
                'status' => 'synced',
            ]);

            $synced[] = $doc->uuid;

            SendReceiptEmail::dispatch($doc)->onQueue('emails');
        }

        return response()->json([
            'synced' => $synced,
            'skipped' => $skipped,
        ]);
    }
}
