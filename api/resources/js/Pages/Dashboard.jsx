import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Users, Building2, FileText, DollarSign } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function StatCard({ title, value, icon: Icon, description }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </CardContent>
        </Card>
    );
}

function docTypeBadge(type) {
    return type === '380'
        ? <Badge variant="success">Receipt</Badge>
        : <Badge variant="outline">Credit Note</Badge>;
}

function statusBadge(status) {
    const map = {
        synced:   <Badge variant="success">Synced</Badge>,
        draft:    <Badge variant="warning">Draft</Badge>,
        archived: <Badge variant="secondary">Archived</Badge>,
    };
    return map[status] ?? <Badge variant="outline">{status}</Badge>;
}

export default function Dashboard({ stats, recentDocuments }) {
    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Active Salespeople" value={stats.salespeople} icon={Users} />
                    <StatCard title="Customers" value={stats.customers} icon={Building2} />
                    <StatCard title="Receipts This Month" value={stats.receipts_month} icon={FileText} />
                    <StatCard
                        title="Collected This Month"
                        value={`AED ${Number(stats.collected_month).toLocaleString('en-AE', { minimumFractionDigits: 2 })}`}
                        icon={DollarSign}
                    />
                </div>

                {/* Recent Documents */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Recent Documents</CardTitle>
                        <Link href="/documents" className="text-sm text-primary hover:underline">View all</Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Doc #</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Salesperson</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentDocuments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            No documents yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentDocuments.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell className="font-mono text-sm">
                                                <Link href={`/documents/${doc.id}`} className="text-primary hover:underline">
                                                    {doc.doc_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{docTypeBadge(doc.type)}</TableCell>
                                            <TableCell>{doc.customer?.name ?? '—'}</TableCell>
                                            <TableCell>{doc.salesperson?.name ?? '—'}</TableCell>
                                            <TableCell className="font-medium">
                                                AED {Number(doc.amount).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell>{statusBadge(doc.status)}</TableCell>
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
