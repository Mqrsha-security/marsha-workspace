<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Wipe old tasks & comments
        TaskComment::query()->delete();
        Task::query()->delete();

        // 2. Keep strictly only the 2 requested users
        User::query()->delete();

        User::create([
            'name' => 'Aditya Rahman',
            'email' => 'marshaSec@adit.ta',
            'identifier' => null,
            'role' => 'Security Architect',
            'avatar_color' => 'blue',
            'password' => Hash::make('12345678'),
        ]);

        User::create([
            'name' => 'Fahristi Dewi Khadijah',
            'email' => 'marshaSec@risti.ta',
            'identifier' => null,
            'role' => 'Project Manager',
            'avatar_color' => 'purple',
            'password' => Hash::make('fdk321'),
        ]);
    }
}
