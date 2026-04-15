import { Head, router } from '@inertiajs/react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SuperTenants({ tenants }) {
    return (
        <SuperAdminLayout title="Tenants">
            <Head title="Tenants — Super Admin" />
            <div className="space-y-4">
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>TRN</TableHead>
                                    <TableHead>Emirate</TableHead>
                                    <TableHead className="text-right">Users</TableHead>
                                    <TableHead className="text-right">Documents</TableHead>
                                    <TableHead>Created</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tenants.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            No tenants yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tenants.data.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-medium">{t.name}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{t.email ?? '—'}</TableCell>
                                            <TableCell className="font-mono text-xs">{t.trn ?? '—'}</TableCell>
                                            <TableCell className="text-sm">{t.emirate ?? '—'}</TableCell>
                                            <TableCell className="text-right">{t.users_count}</TableCell>
                                            <TableCell className="text-right">{t.documents_count}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(t.created_at).toLocaleDateString('en-AE', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {tenants.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {tenants.links.map((link, i) => (
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
