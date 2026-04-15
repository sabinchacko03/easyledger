import { Link, usePage, router } from '@inertiajs/react';
import { LayoutDashboard, Building2, Mail, Settings, LogOut, Shield, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const navItems = [
    { href: '/super',             label: 'Dashboard',    icon: LayoutDashboard, exact: true },
    { href: '/super/tenants',     label: 'Tenants',      icon: Building2 },
    { href: '/super/invitations', label: 'Invitations',  icon: Mail },
    { href: '/super/settings',    label: 'App Settings', icon: Settings },
];

function NavItem({ href, label, icon: Icon, exact }) {
    const { url } = usePage();
    const isActive = exact ? url === href : url.startsWith(href);

    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
            )}
        >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
        </Link>
    );
}

export default function SuperAdminLayout({ children, title }) {
    const { auth } = usePage().props;

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="flex w-64 shrink-0 flex-col bg-sidebar-background">
                {/* Logo */}
                <div className="flex h-16 items-center gap-2 px-6">
                    <Shield className="h-6 w-6 text-sidebar-primary" />
                    <div>
                        <span className="text-lg font-semibold text-sidebar-foreground">EasyLedger</span>
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Super Admin</span>
                    </div>
                </div>

                <Separator className="bg-sidebar-border" />

                {/* Nav */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navItems.map((item) => (
                        <NavItem key={item.href} {...item} />
                    ))}
                </nav>

                <Separator className="bg-sidebar-border" />

                {/* User */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-semibold">
                            {auth.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-sidebar-foreground truncate">{auth.user?.name}</p>
                            <p className="text-xs text-sidebar-foreground/60 truncate">{auth.user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.post('/super/logout')}
                        className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
                        title="Sign out"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {title && (
                    <header className="flex h-16 shrink-0 items-center border-b bg-background px-6">
                        <h1 className="text-lg font-semibold">{title}</h1>
                    </header>
                )}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
