import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, MapPin, Camera } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function Field({ label, value }) {
    if (!value) return null;
    return (
        <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
            <p className="text-sm font-medium">{value}</p>
        </div>
    );
}

export default function ShowDocument({ document }) {
    const isReceipt = document.type === '380';

    return (
        <AppLayout title={document.doc_number}>
            <Head title={document.doc_number} />

            <div className="max-w-3xl space-y-6">
                <div className="flex items-center justify-between">
                    <Link href="/documents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" /> Back to Documents
                    </Link>
                    <a href={`/documents/${document.id}/pdf`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                            Download PDF
                        </Button>
                    </a>
                </div>

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold font-mono">{document.doc_number}</h2>
                        <p className="text-muted-foreground text-sm">{new Date(document.created_at).toLocaleString('en-AE')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={isReceipt ? 'success' : 'outline'}>{isReceipt ? 'Receipt' : 'Credit Note'}</Badge>
                        <Badge variant={document.status === 'synced' ? 'success' : 'warning'}>{document.status}</Badge>
                    </div>
                </div>

                {/* Amount */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="text-4xl font-bold mt-1">
                                AED {Number(document.amount).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                            </p>
                            {document.amount_words_en && (
                                <p className="text-sm text-muted-foreground mt-2 italic">{document.amount_words_en}</p>
                            )}
                            {document.amount_words_ar && (
                                <p className="text-sm text-muted-foreground mt-1" dir="rtl">{document.amount_words_ar}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Details */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <Field label="Customer" value={document.customer?.name} />
                        <Field label="Salesperson" value={document.salesperson?.name} />
                        <Field label="Payment Mode" value={document.payment_mode} />
                        <Field label="Currency" value={document.currency} />
                        {!isReceipt && document.parent && (
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Parent Receipt</p>
                                <Link href={`/documents/${document.parent.id}`} className="text-sm font-medium text-primary hover:underline font-mono">
                                    {document.parent.doc_number}
                                </Link>
                            </div>
                        )}
                    </CardContent>
                    {document.description && (
                        <>
                            <Separator />
                            <CardContent className="pt-4">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                                <p className="text-sm">{document.description}</p>
                            </CardContent>
                        </>
                    )}
                </Card>

                {/* Cheque Details */}
                {document.payment_mode === 'Cheque' && Array.isArray(document.cheque_details) && document.cheque_details.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle className="text-base">Cheque Details</CardTitle></CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-xs text-muted-foreground uppercase tracking-wide">
                                        <th className="text-left py-2 pr-4">#</th>
                                        <th className="text-left py-2 pr-4">Cheque No.</th>
                                        <th className="text-right py-2">Amount (AED)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {document.cheque_details.map((c, i) => (
                                        <tr key={i} className="border-b last:border-0">
                                            <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                                            <td className="py-2 pr-4 font-mono">{c.chequeNo || '—'}</td>
                                            <td className="py-2 text-right font-medium">{Number(c.amount || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {/* Location / Evidence */}
                {(document.gps_lat || document.evidence_image_path) && (
                    <Card>
                        <CardHeader><CardTitle className="text-base">Field Data</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {document.gps_lat && document.gps_long && (
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-mono">{document.gps_lat}, {document.gps_long}</span>
                                    <a
                                        href={`https://maps.google.com/?q=${document.gps_lat},${document.gps_long}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline text-xs"
                                    >
                                        View on map
                                    </a>
                                </div>
                            )}
                            {document.evidence_image_path && (
                                <div>
                                    <p className="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wide mb-2">
                                        <Camera className="h-3 w-3" /> Evidence Photo
                                    </p>
                                    <img
                                        src={`/storage/${document.evidence_image_path}`}
                                        alt="Evidence"
                                        className="max-w-sm rounded-md border"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
