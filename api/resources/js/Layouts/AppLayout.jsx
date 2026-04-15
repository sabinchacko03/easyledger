import { Link, usePage, router } from '@inertiajs/react';
import { LayoutDashboard, Users, Building2, FileText, LogOut, Receipt, ChevronRight, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
    { href: '/',             label: 'Dashboard',   icon: LayoutDashboard },
    { href: '/salespeople',  label: 'Salespeople', icon: Users },
    { href: '/customers',    label: 'Customers',   icon: Building2 },
    { href: '/documents',    label: 'Documents',   icon: FileText },
    { href: '/settings',     label: 'Settings',    icon: Settings },
];

function NavItem({ href, label, icon: Icon }) {
    const { url } = usePage();
    const isActive = href === '/' ? url === '/' : url.startsWith(href);

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

export default function AppLayout({ children, title }) {
    const { auth } = usePage().props;

    function handleLogout() {
        router.post('/logout');
    }

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="flex w-64 shrink-0 flex-col bg-sidebar-background">
                {/* Logo */}
                <div className="flex h-16 items-center gap-2 px-6">
                    <Receipt className="h-6 w-6 text-sidebar-primary" />
                    <span className="text-lg font-semibold text-sidebar-foreground">EasyLedger</span>
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
                <div className="p-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                                    {auth.user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-medium text-sidebar-foreground truncate">{auth.user?.name}</p>
                                    <p className="text-xs truncate">{auth.user?.email}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 shrink-0" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="end" className="w-48">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                                <LogOut className="h-4 w-4" />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                {title && (
                    <header className="flex h-16 shrink-0 items-center border-b bg-background px-6">
                        <h1 className="text-lg font-semibold">{title}</h1>
                    </header>
                )}

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
