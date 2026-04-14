import { useForm, Link, Head } from '@inertiajs/react';
import { Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <>
            <Head title="Sign In" />
            <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
                <div className="w-full max-w-sm space-y-6">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                            <Receipt className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold">EasyLedger</h2>
                        <p className="text-sm text-muted-foreground">Supplier Portal</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sign in</CardTitle>
                            <CardDescription>Enter your account credentials to continue.</CardDescription>
                        </CardHeader>
                        <form onSubmit={submit}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="you@company.com"
                                        autoFocus
                                    />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col gap-3">
                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Signing in…' : 'Sign in'}
                                </Button>
                                <p className="text-sm text-muted-foreground">
                                    No account?{' '}
                                    <Link href="/register" className="text-primary hover:underline font-medium">
                                        Register your company
                                    </Link>
                                </p>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </>
    );
}
