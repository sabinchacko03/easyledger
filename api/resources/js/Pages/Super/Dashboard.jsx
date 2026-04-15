import { Head } from '@inertiajs/react';
import { Building2, Users, Mail, Send } from 'lucide-react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function StatCard({ title, value, icon: Icon, description }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </CardContent>
        </Card>
    );
}

export default function SuperDashboard({ stats }) {
    return (
        <SuperAdminLayout title="Super Admin Dashboard">
            <Head title="Super Admin" />
            <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Tenants"       value={stats.tenants}             icon={Building2} description="Registered companies" />
                    <StatCard title="Total Users"         value={stats.users}               icon={Users}     description="Across all tenants" />
                    <StatCard title="Pending Invitations" value={stats.pending_invitations} icon={Mail}      description="Awaiting activation" />
                    <StatCard title="Total Invitations"   value={stats.total_invitations}   icon={Send}      description="All time" />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">
                            Use the sidebar to manage tenants, invitations, and app-wide settings.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}
