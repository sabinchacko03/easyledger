import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, UserCheck, UserX } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SalespeopleIndex({ salespeople }) {
    const { flash } = usePage().props;

    function toggleStatus(salesperson) {
        router.patch(`/salespeople/${salesperson.id}/toggle`, {}, { preserveScroll: true });
    }

    return (
        <AppLayout title="Salespeople">
            <Head title="Salespeople" />

            {flash?.success && (
                <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
                    {flash.success}
                </div>
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{salespeople.length} salesperson{salespeople.length !== 1 ? 's' : ''}</p>
                    <Link href="/salespeople/create">
                        <Button size="sm">
                            <Plus className="h-4 w-4" />
                            Add Salesperson
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Employee ID</TableHead>
                                    <TableHead>Daily Limit</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salespeople.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            No salespeople yet. Add your first one.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    salespeople.map((sp) => (
                                        <TableRow key={sp.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/salespeople/${sp.id}`} className="hover:text-primary hover:underline">
                                                    {sp.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{sp.email}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {sp.salesperson_profile?.employee_id ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {sp.salesperson_profile?.daily_collection_limit
                                                    ? `AED ${Number(sp.salesperson_profile.daily_collection_limit).toLocaleString()}`
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                {sp.is_active
                                                    ? <Badge variant="success">Active</Badge>
                                                    : <Badge variant="destructive">Inactive</Badge>}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleStatus(sp)}
                                                    className={sp.is_active ? 'text-destructive hover:text-destructive' : 'text-green-600 hover:text-green-600'}
                                                >
                                                    {sp.is_active
                                                        ? <><UserX className="h-4 w-4" /> Deactivate</>
                                                        : <><UserCheck className="h-4 w-4" /> Activate</>}
                                                </Button>
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
