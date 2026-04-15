import { Head, useForm, usePage } from '@inertiajs/react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SettingRow({ setting }) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        value: setting.value ?? '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        put(`/super/settings/${setting.key}`);
    }

    return (
        <div className="py-4 border-b last:border-0">
            <form onSubmit={handleSubmit} className="flex items-end gap-4">
                <div className="flex-1">
                    <Label htmlFor={setting.key} className="font-mono text-sm font-semibold">
                        {setting.key}
                    </Label>
                    {setting.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 mb-1">{setting.description}</p>
                    )}
                    <Input
                        id={setting.key}
                        value={data.value}
                        onChange={(e) => setData('value', e.target.value)}
                        className="mt-1 font-mono"
                        placeholder="Value"
                    />
                    {errors.value && <p className="text-sm text-destructive mt-1">{errors.value}</p>}
                </div>
                <div className="flex items-center gap-2 pb-0.5">
                    <Button type="submit" size="sm" disabled={processing}>
                        {processing ? 'Saving…' : 'Save'}
                    </Button>
                    {recentlySuccessful && (
                        <span className="text-xs text-green-600 font-medium">Saved</span>
                    )}
                </div>
            </form>
        </div>
    );
}

export default function SuperSettings({ settings }) {
    const { flash } = usePage().props;

    return (
        <SuperAdminLayout title="App Settings">
            <Head title="App Settings — Super Admin" />
            <div className="max-w-2xl space-y-6">
                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Application Settings</CardTitle>
                        <CardDescription>
                            These values control app-wide behaviour. Changes take effect immediately.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {settings.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4">No settings found.</p>
                        ) : (
                            settings.map((s) => <SettingRow key={s.key} setting={s} />)
                        )}
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}
