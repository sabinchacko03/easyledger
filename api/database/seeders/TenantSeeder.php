<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\SalespersonProfile;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password');

        $tenants = [
            [
                'name' => 'Al Noor Trading LLC',
                'trn' => '100234567890001',
                'tin' => '1002345678',
                'address' => 'Shop 12, Al Wahda Mall, Abu Dhabi',
                'city' => 'Abu Dhabi',
                'emirate' => 'AUH',
                'email' => 'info@alnoor.ae',
                'admin' => ['name' => 'Mohammed Al Noor', 'email' => 'admin@alnoor.ae'],
                'salespersons' => [
                    ['name' => 'Ahmed Hassan', 'email' => 'ahmed@alnoor.ae', 'employee_id' => 'SP-001'],
                    ['name' => 'Fatima Al Zaabi', 'email' => 'fatima@alnoor.ae', 'employee_id' => 'SP-002'],
                    ['name' => 'Omar Khalid', 'email' => 'omar@alnoor.ae', 'employee_id' => 'SP-003'],
                ],
                'customer_count' => 35,
            ],
            [
                'name' => 'Gulf Star Supplies',
                'trn' => '100987654321002',
                'tin' => '1009876543',
                'address' => 'Unit 7, JAFZA, Dubai',
                'city' => 'Dubai',
                'emirate' => 'DXB',
                'email' => 'contact@gulfstar.ae',
                'admin' => ['name' => 'Sara Al Maktoum', 'email' => 'admin@gulfstar.ae'],
                'salespersons' => [
                    ['name' => 'Khalid Mansoor', 'email' => 'khalid@gulfstar.ae', 'employee_id' => 'GS-001'],
                    ['name' => 'Noura Al Rashid', 'email' => 'noura@gulfstar.ae', 'employee_id' => 'GS-002'],
                ],
                'customer_count' => 52,
            ],
            [
                'name' => 'Sharjah Tech Distributors',
                'trn' => '100111222333003',
                'tin' => '1001112223',
                'address' => 'Industrial Area 7, Sharjah',
                'city' => 'Sharjah',
                'emirate' => 'SHJ',
                'email' => 'sales@sharjahtech.ae',
                'admin' => ['name' => 'Tariq Al Qasimi', 'email' => 'admin@sharjahtech.ae'],
                'salespersons' => [
                    ['name' => 'Layla Ibrahim', 'email' => 'layla@sharjahtech.ae', 'employee_id' => 'ST-001'],
                    ['name' => 'Hassan Yusuf', 'email' => 'hassan@sharjahtech.ae', 'employee_id' => 'ST-002'],
                    ['name' => 'Mariam Saeed', 'email' => 'mariam@sharjahtech.ae', 'employee_id' => 'ST-003'],
                    ['name' => 'Bilal Nasser', 'email' => 'bilal@sharjahtech.ae', 'employee_id' => 'ST-004'],
                ],
                'customer_count' => 68,
            ],
        ];

        foreach ($tenants as $tenantData) {
            // Create admin user first (owner)
            $admin = User::create([
                'name' => $tenantData['admin']['name'],
                'email' => $tenantData['admin']['email'],
                'password' => $password,
                'is_active' => true,
            ]);
            $admin->assignRole('admin');

            // Create tenant with owner
            $tenant = Tenant::create([
                'name' => $tenantData['name'],
                'trn' => $tenantData['trn'],
                'tin' => $tenantData['tin'],
                'address' => $tenantData['address'],
                'city' => $tenantData['city'],
                'emirate' => $tenantData['emirate'],
                'email' => $tenantData['email'],
                'owner_id' => $admin->id,
            ]);

            // Link admin to tenant
            $admin->update(['tenant_id' => $tenant->id]);

            // Create salespersons
            foreach ($tenantData['salespersons'] as $spData) {
                $sp = User::create([
                    'name' => $spData['name'],
                    'email' => $spData['email'],
                    'password' => $password,
                    'tenant_id' => $tenant->id,
                    'is_active' => true,
                ]);
                $sp->assignRole('salesperson');

                SalespersonProfile::create([
                    'user_id' => $sp->id,
                    'employee_id' => $spData['employee_id'],
                    'daily_collection_limit' => fake()->randomElement([5000, 10000, 15000, 20000]),
                ]);
            }

            // Create customers for the tenant
            $emirates = ['AUH', 'DXB', 'SHJ', 'AJM', 'UAQ', 'RAK', 'FUJ'];
            for ($i = 1; $i <= $tenantData['customer_count']; $i++) {
                Customer::create([
                    'tenant_id' => $tenant->id,
                    'name' => fake()->company() . ' ' . fake()->randomElement(['LLC', 'Trading', 'Co', 'Group', 'Est']),
                    'trn' => fake()->numerify('1##############'),
                    'phone' => '+971' . fake()->numerify('5########'),
                    'email' => fake()->unique()->companyEmail(),
                    'address' => fake()->streetAddress() . ', ' . fake()->city(),
                    'current_balance' => fake()->randomFloat(2, 0, 50000),
                ]);
            }
        }
    }
}
