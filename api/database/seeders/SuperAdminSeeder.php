<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'superadmin@receiptapp.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('superadmin123'),
                'role' => 'admin',
                'is_super_admin' => true,
                'is_active' => true,
            ]
        );

        if (! $user->hasRole('super_admin')) {
            $user->assignRole('super_admin');
        }
    }
}
