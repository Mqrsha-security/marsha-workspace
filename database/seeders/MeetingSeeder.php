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
            'title' => 'Bimbingan Bab 4: Evaluasi Keamanan Otentikasi & Pengujian Beban',
            'category' => 'Bimbingan Skripsi',
            'meeting_date' => now()->addDays(1)->format('Y-m-d'),
            'start_time' => '09:30',
            'end_time' => '11:30',
            'location' => 'Lab Cyber Security & Forensik Gedung B Lt. 3',
            'status' => 'scheduled',
            'attendees' => ['Aditya Rahman', 'Fahristi Dewi Khadijah', 'Dosen Pembimbing Utama'],
            'points' => [
                'Penyelarasan parameter pengujian penetrasi dan mitigasi token JWT',
                'Validasi skema role-based access control (RBAC) pada antarmuka pengguna',
                'Review format penulisan tabel evaluasi arsitektur sesuai pedoman sidang',
                'Konfirmasi jadwal gladi seminar hasil dan berkas administrasi bimbingan',
            ],
            'action_items' => [
                ['task' => 'Perbarui diagram alur mitigasi token pada bab 4', 'assignee' => 'Aditya Rahman', 'completed' => false],
                ['task' => 'Lengkapi data rekapitulasi pengujian latensi basis data', 'assignee' => 'Fahristi Dewi Khadijah', 'completed' => false],
            ],
            'reference_links' => [
                ['title' => 'Draf Dokumen Bab 4 (Google Docs)', 'url' => 'https://docs.google.com'],
                ['title' => 'Dataset Log Pengujian (Google Drive)', 'url' => 'https://drive.google.com'],
            ],
            'images' => [
                ['url' => '/images/marsha-security.png', 'caption' => 'Bagan Arsitektur Otentikasi'],
            ],
            'notes' => 'Fokus utama pada validasi hasil benchmark respon kueri PostgreSQL dan mitigasi brute-force sesi pengguna.',
            'created_by' => $adit?->id ?? 1,
        ]);

        Meeting::create([
            'title' => 'Review Arsitektur Keamanan & Audit Log RBAC',
            'category' => 'Security Architecture',
            'meeting_date' => now()->subDays(2)->format('Y-m-d'),
            'start_time' => '13:00',
            'end_time' => '15:00',
            'location' => 'https://meet.google.com/sec-audit-2026',
            'status' => 'completed',
            'attendees' => ['Aditya Rahman', 'Fahristi Dewi Khadijah'],
            'points' => [
                'Analisis perimeter keamanan endpoint Vercel serverless',
                'Verifikasi isolasi privilege antara akun Security Architect dan Project Manager',
                'Penerapan real-time heartbeat dan proteksi CSRF pada rute presence',
            ],
            'action_items' => [
                ['task' => 'Optimasi ambang batas offline presence menjadi 25 detik', 'assignee' => 'Aditya Rahman', 'completed' => true],
                ['task' => 'Sinkronisasi direktori tautan eksternal pada tab Applications', 'assignee' => 'Fahristi Dewi Khadijah', 'completed' => true],
            ],
            'reference_links' => [
                ['title' => 'Repositori GitHub Marsha Workspace', 'url' => 'https://github.com/Mqrsha-security/marsha-workspace'],
                ['title' => 'IEEE Xplore Literature Database', 'url' => 'https://ieeexplore.ieee.org'],
            ],
            'images' => [],
            'notes' => 'Seluruh evaluasi arsitektur dinyatakan siap untuk tahapan pengujian akhir tugas akhir.',
            'created_by' => $risti?->id ?? 2,
        ]);
    }
}
