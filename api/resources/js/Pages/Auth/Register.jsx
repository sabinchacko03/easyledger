import { useForm, Link, Head } from '@inertiajs/react';
import { Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const EMIRATES = [
    { value: 'AUH', label: 'Abu Dhabi' },
    { value: 'DXB', label: 'Dubai' },
    { value: 'SHJ', label: 'Sharjah' },
    { value: 'AJM', label: 'Ajman' },
    { value: 'UAQ', label: 'Umm Al Quwain' },
    { value: 'RAK', label: 'Ras Al Khaimah' },
    { value: 'FUJ', label: 'Fujairah' },
];

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        company_name: '',
        trn: '',
        tin: '',
        emirate: '',
        city: '',
        address: '',
        company_email: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/register');
    }

    return (
        <>
            <Head title="Register" />
            <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
                <div className="w-full max-w-2xl space-y-6">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                            <Receipt className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold">Receipt App</h2>
                        <p className="text-sm text-muted-foreground">Create your supplier account</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Company Registration</CardTitle>
                            <CardDescription>Set up your supplier account and company profile.</CardDescription>
                        </CardHeader>
                        <form onSubmit={submit}>
                            <CardContent className="space-y-6">
                                {/* Admin Account */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Your Account</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Ahmed Al Mansouri" />
                                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="you@company.com" />
                                            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password</Label>
                                            <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Min. 8 characters" />
                                            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                                            <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} placeholder="Repeat password" />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Company Info */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Company Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="company_name">Company Name</Label>
                                            <Input id="company_name" value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} placeholder="Al Mansouri Trading LLC" />
                                            {errors.company_name && <p className="text-sm text-destructive">{errors.company_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company_email">Company Email</Label>
                                            <Input id="company_email" type="email" value={data.company_email} onChange={(e) => setData('company_email', e.target.value)} placeholder="info@company.com" />
                                            {errors.company_email && <p className="text-sm text-destructive">{errors.company_email}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="emirate">Emirate</Label>
                                            <select
                                                id="emirate"
                                                value={data.emirate}
                                                onChange={(e) => setData('emirate', e.target.value)}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            >
                                                <option value="">Select emirate…</option>
                                                {EMIRATES.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
                                            </select>
                                            {errors.emirate && <p className="text-sm text-destructive">{errors.emirate}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} placeholder="Dubai" />
                                            {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="trn">TRN <span className="text-muted-foreground font-normal">(optional)</span></Label>
                                            <Input id="trn" value={data.trn} onChange={(e) => setData('trn', e.target.value)} placeholder="15-digit Tax Reg. No." maxLength={15} />
                                            {errors.trn && <p className="text-sm text-destructive">{errors.trn}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="tin">TIN <span className="text-muted-foreground font-normal">(optional)</span></Label>
                                            <Input id="tin" value={data.tin} onChange={(e) => setData('tin', e.target.value)} placeholder="10-digit Tax ID No." maxLength={10} />
                                            {errors.tin && <p className="text-sm text-destructive">{errors.tin}</p>}
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="address">Address</Label>
                                            <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} placeholder="Office / building address" />
                                            {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Creating account…' : 'Create account'}
                                </Button>

                                <p className="text-center text-sm text-muted-foreground">
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
                                </p>
                            </CardContent>
                        </form>
                    </Card>
                </div>
            </div>
        </>
    );
}
