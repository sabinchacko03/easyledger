<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use Illuminate\Database\Seeder;

class AppSettingsSeeder extends Seeder
{
    public function run(): void
    {
        AppSetting::firstOrCreate(['key' => 'max_free_receipts'], [
            'value' => '50',
            'type' => 'integer',
            'description' => 'Maximum receipts an easy-mode salesperson can create before the upgrade prompt is shown.',
        ]);
    }
}
