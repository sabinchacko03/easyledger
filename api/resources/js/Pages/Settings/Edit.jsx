import { Head, useForm, router } from '@inertiajs/react';
import { Trash2, Upload } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRef } from 'react';

const EMIRATES = [
    { value: 'AUH', label: 'Abu Dhabi' },
    { value: 'DXB', label: 'Dubai' },
    { value: 'SHJ', label: 'Sharjah' },
    { value: 'AJM', label: 'Ajman' },
    { value: 'UAQ', label: 'Umm Al Quwain' },
    { value: 'RAK', label: 'Ras Al Khaimah' },
    { value: 'FUJ', label: 'Fujairah' },
];

export default function SettingsEdit({ tenant }) {
    const fileRef = useRef(null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name:    tenant.name    ?? '',
        email:   tenant.email   ?? '',
        address: tenant.address ?? '',
        city:    tenant.city    ?? '',
        emirate: tenant.emirate ?? '',
        trn:     tenant.trn     ?? '',
        tin:     tenant.tin     ?? '',
        logo:    null,
    });

    function handleSubmit(e) {
        e.preventDefault();
        post('/settings', { forceFormData: true });
    }

    function handleLogoDelete() {
        if (!confirm('Remove the company logo?')) return;
        router.delete('/settings/logo');
    }

    const logoUrl = tenant.logo
        ? `/storage/${tenant.logo}`
        : null;

    return (
        <AppLayout title="Company Settings">
            <Head title="Settings" />

            <div className="max-w-2xl space-y-6">
                {recentlySuccessful && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        Settings saved successfully.
                    </div>
                )}

                <form onSubmit={handleSubmit} encType="multipart/form-data">

                    {/* Company Logo */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-base">Company Logo</CardTitle>
                            <CardDescription>Shown on PDF receipts. Recommended: square image, max 2 MB.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {logoUrl && (
                                <div className="flex items-center gap-4">
                                    <img
                                        src={logoUrl}
                                        alt="Company logo"
                                        className="h-16 w-16 rounded-lg object-contain border border-gray-200 bg-gray-50 p-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleLogoDelete}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                                    </Button>
                                </div>
                            )}
                            <div>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => setData('logo', e.target.files[0] ?? null)}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileRef.current?.click()}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {data.logo ? data.logo.name : (logoUrl ? 'Replace Logo' : 'Upload Logo')}
                                </Button>
                                {errors.logo && <p className="text-sm text-destructive mt-1">{errors.logo}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Company Details */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-base">Company Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="name">Company Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1"
                                />
                                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="email">Company Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1"
                                />
                                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <Label htmlFor="address">Address</Label>
                                <textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    rows={2}
                                    className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                                />
                                {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="emirate">Emirate</Label>
                                    <select
                                        id="emirate"
                                        value={data.emirate}
                                        onChange={(e) => setData('emirate', e.target.value)}
                                        className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="">Select emirate</option>
                                        {EMIRATES.map((e) => (
                                            <option key={e.value} value={e.value}>{e.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tax Details */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-base">Tax Registration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="trn">TRN (Tax Registration Number)</Label>
                                <Input
                                    id="trn"
                                    value={data.trn}
                                    onChange={(e) => setData('trn', e.target.value)}
                                    placeholder="15 digits"
                                    className="mt-1 font-mono"
                                    maxLength={15}
                                />
                                {errors.trn && <p className="text-sm text-destructive mt-1">{errors.trn}</p>}
                            </div>
                            <div>
                                <Label htmlFor="tin">TIN (Tax Identification Number)</Label>
                                <Input
                                    id="tin"
                                    value={data.tin}
                                    onChange={(e) => setData('tin', e.target.value)}
                                    placeholder="10 digits"
                                    className="mt-1 font-mono"
                                    maxLength={10}
                                />
                                {errors.tin && <p className="text-sm text-destructive mt-1">{errors.tin}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Saving…' : 'Save Changes'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
