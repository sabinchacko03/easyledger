import { useForm, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditCustomer({ customer }) {
    const { data, setData, put, processing, errors } = useForm({
        name: customer.name ?? '',
        trn: customer.trn ?? '',
        phone: customer.phone ?? '',
        email: customer.email ?? '',
        address: customer.address ?? '',
        current_balance: customer.current_balance ?? '',
    });

    function submit(e) {
        e.preventDefault();
        put(`/customers/${customer.id}`);
    }

    return (
        <AppLayout title="Edit Customer">
            <Head title="Edit Customer" />

            <div className="max-w-2xl space-y-4">
                <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back to Customers
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle>Edit Customer</CardTitle>
                        <CardDescription>Update details for {customer.name}.</CardDescription>
                    </CardHeader>
                    <form onSubmit={submit}>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="name">Company Name</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="trn">TRN</Label>
                                    <Input id="trn" value={data.trn} onChange={(e) => setData('trn', e.target.value)} maxLength={15} />
                                    {errors.trn && <p className="text-sm text-destructive">{errors.trn}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="current_balance">Balance (AED)</Label>
                                    <Input id="current_balance" type="number" step="0.01" value={data.current_balance} onChange={(e) => setData('current_balance', e.target.value)} />
                                    {errors.current_balance && <p className="text-sm text-destructive">{errors.current_balance}</p>}
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                                    {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>{processing ? 'Saving…' : 'Save Changes'}</Button>
                                <Link href="/customers"><Button type="button" variant="outline">Cancel</Button></Link>
                            </div>
                        </CardContent>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
