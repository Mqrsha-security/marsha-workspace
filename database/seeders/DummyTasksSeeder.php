<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DummyTasksSeeder extends Seeder
{
    public function run(): void
    {
        $aditya = User::where('email', 'marshaSec@adit.ta')->first();
        $fahristi = User::where('email', 'marshaSec@risti.ta')->first();

        if (!$aditya || !$fahristi) {
            return;
        }

        // Wipe old placeholder tasks
        Task::query()->delete();

        $defaultTabs = [
            [
                'id' => 'tab-1',
                'name' => 'UI/UX',
                'items' => ['Wireframe flow review', 'Design system token verification'],
                'links' => ['https://www.figma.com'],
            ],
            [
                'id' => 'tab-2',
                'name' => 'Coding',
                'items' => ['Implement RBAC middleware', 'Setup automated test suite'],
                'links' => ['https://github.com/Mqrsha-security/marsha-workspace'],
            ],
            [
                'id' => 'tab-3',
                'name' => 'Design System',
                'items' => ['Dark mode palette audit'],
                'links' => [],
            ],
        ];

        Task::create([
            'title' => 'Security Architecture & RBAC Hardening',
            'description' => 'Implement role based access control policies, JWT session revocation, and security audit logging across all backend endpoints.',
            'category' => 'Umum',
            'status' => 'in_progress',
            'priority' => 'urgent',
            'created_by' => $fahristi->id,
            'assigned_to' => $aditya->id,
            'due_at' => Carbon::now()->addDays(2),
            'tabs' => $defaultTabs,
        ]);

        Task::create([
            'title' => 'Thesis Methodology Chapter Draft',
            'description' => 'Draft Chapter 3 on threat modeling methodologies, STRIDE vulnerability scoring, and zero trust evaluation metrics.',
            'category' => 'Bab 3',
            'status' => 'in_progress',
            'priority' => 'high',
            'created_by' => $aditya->id,
            'assigned_to' => $fahristi->id,
            'due_at' => Carbon::now()->addDays(3),
            'tabs' => $defaultTabs,
        ]);

        Task::create([
            'title' => 'Penetration Testing & Vulnerability Audit',
            'description' => 'Conduct OWASP Top 10 penetration testing and document mitigation evidence for committee review.',
            'category' => 'Revisi',
            'status' => 'revisi',
            'priority' => 'urgent',
            'revision_notes' => 'Please append raw burp suite scan exports and remediate session cookie flags.',
            'created_by' => $fahristi->id,
            'assigned_to' => $aditya->id,
            'due_at' => Carbon::now()->addDays(1),
            'tabs' => $defaultTabs,
        ]);

        Task::create([
            'title' => 'External Applications Hub Integration',
            'description' => 'Connect Google Docs, Google Drive, Figma, and IEEE journal links into unified workspace hub.',
            'category' => 'Umum',
            'status' => 'todo',
            'priority' => 'medium',
            'created_by' => $aditya->id,
            'assigned_to' => $fahristi->id,
            'due_at' => Carbon::now()->addDays(5),
            'tabs' => $defaultTabs,
        ]);

        Task::create([
            'title' => 'Zero Trust Architecture Wireframes',
            'description' => 'Design vector components and interactive prototype mockups for threat modeling dashboards.',
            'category' => 'Bab 2',
            'status' => 'todo',
            'priority' => 'high',
            'created_by' => $aditya->id,
            'assigned_to' => $fahristi->id,
            'due_at' => Carbon::now()->addDays(4),
            'tabs' => $defaultTabs,
        ]);
    }
}
