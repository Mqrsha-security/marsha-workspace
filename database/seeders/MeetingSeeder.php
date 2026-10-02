<?php

namespace Database\Seeders;

use App\Models\Meeting;
use App\Models\User;
use Illuminate\Database\Seeder;

class MeetingSeeder extends Seeder
{
    public function run(): void
    {
        $adit = User::where('email', 'marshaSec@adit.ta')->first();
        $risti = User::where('email', 'marshaSec@risti.ta')->first();

        Meeting::create([
            'title' => 'Thesis Advisory: Security Authentication Evaluation & Load Testing',
            'category' => 'Thesis Advisory',
            'meeting_date' => now()->addDays(1)->format('Y-m-d'),
            'start_time' => '09:30',
            'end_time' => '11:30',
            'location' => 'Cyber Security & Digital Forensics Lab Building B 3rd Floor',
            'status' => 'scheduled',
            'attendees' => ['Aditya Rahman', 'Fahristi Dewi Khadijah', 'Primary Thesis Advisor'],
            'points' => [
                'Alignment of penetration testing parameters and JWT token mitigation',
                'Validation of role-based access control (RBAC) across UI components',
                'Review of architecture evaluation benchmarking tables per thesis defense guidelines',
                'Confirmation of results seminar rehearsal schedule and supervisory paperwork',
            ],
            'action_items' => [
                ['task' => 'Update token mitigation sequence diagram in Chapter 4', 'assignee' => 'Aditya Rahman', 'completed' => false],
                ['task' => 'Compile benchmark dataset for PostgreSQL query latency', 'assignee' => 'Fahristi Dewi Khadijah', 'completed' => false],
            ],
            'reference_links' => [
                ['title' => 'Chapter 4 Document Draft (Google Docs)', 'url' => 'https://docs.google.com'],
                ['title' => 'Evaluation Test Log Dataset (Google Drive)', 'url' => 'https://drive.google.com'],
            ],
            'images' => [
                ['url' => '/images/marsha-security.png', 'caption' => 'Authentication Architecture Diagram'],
            ],
            'notes' => 'Key focus centered on PostgreSQL query latency benchmarks and brute-force mitigation on active user session lifecycles.',
            'created_by' => $adit?->id ?? 1,
        ]);

        Meeting::create([
            'title' => 'Security Architecture Review & RBAC Audit Logging',
            'category' => 'Security Architecture',
            'meeting_date' => now()->subDays(2)->format('Y-m-d'),
            'start_time' => '13:00',
            'end_time' => '15:00',
            'location' => 'https://meet.google.com/sec-audit-2026',
            'status' => 'completed',
            'attendees' => ['Aditya Rahman', 'Fahristi Dewi Khadijah'],
            'points' => [
                'Security perimeter assessment for Vercel serverless edge endpoints',
                'Privilege boundary verification between Security Architect and Project Manager accounts',
                'Real-time presence heartbeat implementation with CSRF bypass protection on unload beacons',
            ],
            'action_items' => [
                ['task' => 'Fine-tune presence inactive threshold to 25 seconds', 'assignee' => 'Aditya Rahman', 'completed' => true],
                ['task' => 'Synchronize external directory links in the Applications repository', 'assignee' => 'Fahristi Dewi Khadijah', 'completed' => true],
            ],
            'reference_links' => [
                ['title' => 'Marsha Workspace GitHub Repository', 'url' => 'https://github.com/Mqrsha-security/marsha-workspace'],
                ['title' => 'IEEE Xplore Literature Database', 'url' => 'https://ieeexplore.ieee.org'],
            ],
            'images' => [],
            'notes' => 'All security architecture specifications verified ready for final thesis defense testing.',
            'created_by' => $risti?->id ?? 2,
        ]);
    }
}
