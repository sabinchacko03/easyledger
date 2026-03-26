import { useForm, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function CreateSalesperson() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        employee_id: '',
        daily_collection_limit: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/salespeople');
    }

    return (
        <AppLayout title="Add Salesperson">
            <Head title="Add Salesperson" />

            <div className="max-w-2xl space-y-4">
                <Link href="/salespeople" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back to Salespeople
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle>New Salesperson</CardTitle>
                        <CardDescription>
                            Create login credentials for a field salesperson. They will use these to sign in on the mobile app.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={submit}>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Login Credentials</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Mohammed Al Rashid"
                                            autoFocus
                                        />
                                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="salesperson@company.com"
                                        />
                                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Temporary Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Min. 8 characters"
                                        />
                                        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Repeat password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Profile (Optional)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="employee_id">Employee ID</Label>
                                        <Input
                                            id="employee_id"
                                            value={data.employee_id}
                                            onChange={(e) => setData('employee_id', e.target.value)}
                                            placeholder="EMP-001"
                                        />
                                        {errors.employee_id && <p className="text-sm text-destructive">{errors.employee_id}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="daily_collection_limit">Daily Collection Limit (AED)</Label>
                                        <Input
                                            id="daily_collection_limit"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.daily_collection_limit}
                                            onChange={(e) => setData('daily_collection_limit', e.target.value)}
                                            placeholder="e.g. 10000"
                                        />
                                        {errors.daily_collection_limit && <p className="text-sm text-destructive">{errors.daily_collection_limit}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating…' : 'Create Salesperson'}
                                </Button>
                                <Link href="/salespeople">
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
