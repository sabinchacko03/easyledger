import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, UserCheck, UserX } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ShowSalesperson({ salesperson, documents }) {
    function toggleStatus() {
        router.patch(`/salespeople/${salesperson.id}/toggle`, {}, { preserveScroll: true });
    }

    return (
        <AppLayout title={salesperson.name}>
            <Head title={salesperson.name} />

            <div className="max-w-4xl space-y-6">
                <Link href="/salespeople" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back to Salespeople
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">{salesperson.name}</h2>
                        <p className="text-muted-foreground">{salesperson.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {salesperson.is_active
                            ? <Badge variant="success">Active</Badge>
                            : <Badge variant="destructive">Inactive</Badge>}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleStatus}
                            className={salesperson.is_active ? 'text-destructive' : 'text-green-600'}
                        >
                            {salesperson.is_active
                                ? <><UserX className="h-4 w-4" /> Deactivate</>
                                : <><UserCheck className="h-4 w-4" /> Activate</>}
                        </Button>
                    </div>
                </div>

                {salesperson.salesperson_profile && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {salesperson.salesperson_profile.employee_id && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">Employee ID</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium">{salesperson.salesperson_profile.employee_id}</p>
                                </CardContent>
                            </Card>
                        )}
                        {salesperson.salesperson_profile.daily_collection_limit && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">Daily Limit</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium">
                                        AED {Number(salesperson.salesperson_profile.daily_collection_limit).toLocaleString()}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Recent Receipts</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Doc #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                            No documents yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    documents.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell className="font-mono text-sm">
                                                <Link href={`/documents/${doc.id}`} className="text-primary hover:underline">
                                                    {doc.doc_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{doc.customer?.name ?? '—'}</TableCell>
                                            <TableCell>AED {Number(doc.amount).toLocaleString('en-AE', { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell>
                                                <Badge variant={doc.status === 'synced' ? 'success' : 'warning'}>{doc.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(doc.created_at).toLocaleDateString('en-AE')}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
