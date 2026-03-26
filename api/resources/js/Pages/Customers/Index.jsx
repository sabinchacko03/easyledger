import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';

export default function CustomersIndex({ customers }) {
    const { flash } = usePage().props;
    const [deletingId, setDeletingId] = useState(null);

    function handleDelete(id) {
        router.delete(`/customers/${id}`, {
            onSuccess: () => setDeletingId(null),
            preserveScroll: true,
        });
    }

    return (
        <AppLayout title="Customers">
            <Head title="Customers" />

            {flash?.success && (
                <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
                    {flash.success}
                </div>
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{customers.length} customer{customers.length !== 1 ? 's' : ''}</p>
                    <Link href="/customers/create">
                        <Button size="sm">
                            <Plus className="h-4 w-4" />
                            Add Customer
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>TRN</TableHead>
                                    <TableHead className="text-right">Balance (AED)</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            No customers yet. Add your first one.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    customers.map((c) => (
                                        <TableRow key={c.id}>
                                            <TableCell className="font-medium">{c.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{c.phone ?? '—'}</TableCell>
                                            <TableCell className="text-muted-foreground">{c.email ?? '—'}</TableCell>
                                            <TableCell className="text-muted-foreground font-mono text-sm">{c.trn ?? '—'}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {Number(c.current_balance).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Link href={`/customers/${c.id}/edit`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Dialog open={deletingId === c.id} onOpenChange={(open) => !open && setDeletingId(null)}>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeletingId(c.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Remove Customer</DialogTitle>
                                                                <DialogDescription>
                                                                    Are you sure you want to remove <strong>{c.name}</strong>? This cannot be undone.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter>
                                                                <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
                                                                <Button variant="destructive" onClick={() => handleDelete(c.id)}>Remove</Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
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
