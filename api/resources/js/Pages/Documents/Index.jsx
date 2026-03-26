import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

export default function DocumentsIndex({ documents, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilters(overrides = {}) {
        router.get('/documents', { ...filters, search, ...overrides }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout title="Documents">
            <Head title="Documents" />

            <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Search by doc# or customer…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                        />
                    </div>
                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={filters.type ?? ''}
                        onChange={(e) => applyFilters({ type: e.target.value })}
                    >
                        <option value="">All Types</option>
                        <option value="380">Receipt</option>
                        <option value="381">Credit Note</option>
                    </select>
                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilters({ status: e.target.value })}
                    >
                        <option value="">All Statuses</option>
                        <option value="synced">Synced</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                    </select>
                    {(filters.search || filters.type || filters.status) && (
                        <Button variant="ghost" size="sm" onClick={() => { setSearch(''); applyFilters({ search: '', type: '', status: '' }); }}>
                            Clear filters
                        </Button>
                    )}
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Doc #</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Salesperson</TableHead>
                                    <TableHead className="text-right">Amount (AED)</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            No documents found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    documents.data.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell className="font-mono text-sm">
                                                <Link href={`/documents/${doc.id}`} className="text-primary hover:underline">
                                                    {doc.doc_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{docTypeBadge(doc.type)}</TableCell>
                                            <TableCell>{doc.customer?.name ?? '—'}</TableCell>
                                            <TableCell className="text-muted-foreground">{doc.salesperson?.name ?? '—'}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {Number(doc.amount).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell>{statusBadge(doc.status)}</TableCell>
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

                {/* Pagination */}
                {documents.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Showing {documents.from}–{documents.to} of {documents.total}</span>
                        <div className="flex gap-1">
                            {documents.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={`px-3 py-1 rounded border text-xs ${link.active ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
