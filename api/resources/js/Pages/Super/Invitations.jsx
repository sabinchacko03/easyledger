import { Head, router, usePage, Link } from '@inertiajs/react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const STATUS_BADGE = {
    pending:    <Badge variant="warning">Pending</Badge>,
    registered: <Badge variant="success">Registered</Badge>,
    expired:    <Badge variant="secondary">Expired</Badge>,
};

export default function SuperInvitations({ invitations, filter }) {
    const { flash } = usePage().props;

    function handleResend(id) {
        router.post(`/super/invitations/${id}/resend`);
    }

    function applyFilter(status) {
        router.get('/super/invitations', status ? { status } : {}, { preserveState: true });
    }

    return (
        <SuperAdminLayout title="Invitations">
            <Head title="Invitations — Super Admin" />
            <div className="space-y-4">
                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {flash.error}
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-2">
                    {['', 'pending', 'registered', 'expired'].map((s) => (
                        <Button
                            key={s}
                            size="sm"
                            variant={filter.status === s || (!filter.status && s === '') ? 'default' : 'outline'}
                            onClick={() => applyFilter(s)}
                        >
                            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </Button>
                    ))}
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>TRN</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invitations.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            No invitations found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    invitations.data.map((inv) => (
                                        <TableRow key={inv.id}>
                                            <TableCell className="font-medium">{inv.name}</TableCell>
                                            <TableCell className="text-sm">{inv.email}</TableCell>
                                            <TableCell className="text-sm">{inv.company_name}</TableCell>
                                            <TableCell className="font-mono text-xs">{inv.trn}</TableCell>
                                            <TableCell>{STATUS_BADGE[inv.status] ?? inv.status}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(inv.token_expires_at).toLocaleDateString('en-AE', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                {inv.status !== 'registered' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleResend(inv.id)}
                                                    >
                                                        Resend
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {invitations.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {invitations.links.map((link, i) => (
                            <Button
                                key={i}
                                size="sm"
                                variant={link.active ? 'default' : 'outline'}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </SuperAdminLayout>
    );
}
