import { useForm, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateCustomer() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        trn: '',
        tin: '',
        phone: '',
        email: '',
        address: '',
        current_balance: '',
        trade_license: null,
    });

    function submit(e) {
        e.preventDefault();
        post('/customers', { forceFormData: true });
    }

    return (
        <AppLayout title="Add Customer">
            <Head title="Add Customer" />

            <div className="max-w-2xl space-y-4">
                <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back to Customers
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle>New Customer</CardTitle>
                        <CardDescription>Add a collection point / customer company.</CardDescription>
                    </CardHeader>
                    <form onSubmit={submit}>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="name">Company Name</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="ABC Trading LLC" autoFocus />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="+971 50 000 0000" />
                                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="accounts@abc.com" />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="trn">TRN</Label>
                                    <Input id="trn" value={data.trn} onChange={(e) => setData('trn', e.target.value)} placeholder="15-digit TRN" maxLength={15} required />
                                    {errors.trn && <p className="text-sm text-destructive">{errors.trn}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tin">TIN</Label>
                                    <Input id="tin" value={data.tin} onChange={(e) => setData('tin', e.target.value)} placeholder="10-digit TIN" maxLength={10} required />
                                    {errors.tin && <p className="text-sm text-destructive">{errors.tin}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="current_balance">Opening Balance (AED)</Label>
                                    <Input id="current_balance" type="number" step="0.01" value={data.current_balance} onChange={(e) => setData('current_balance', e.target.value)} placeholder="0.00" />
                                    {errors.current_balance && <p className="text-sm text-destructive">{errors.current_balance}</p>}
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} placeholder="Building, street, area" />
                                    {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="trade_license">Trade License (PDF, max 2MB)</Label>
                                    <Input id="trade_license" type="file" accept=".pdf" onChange={(e) => setData('trade_license', e.target.files[0])} required />
                                    {errors.trade_license && <p className="text-sm text-destructive">{errors.trade_license}</p>}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>{processing ? 'Saving…' : 'Add Customer'}</Button>
                                <Link href="/customers"><Button type="button" variant="outline">Cancel</Button></Link>
                            </div>
                        </CardContent>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
