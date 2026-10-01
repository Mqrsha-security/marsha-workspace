<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\WorkspaceApp;
use Illuminate\Database\Seeder;

class WorkspaceAppSeeder extends Seeder
{
    public function run(): void
    {
        WorkspaceApp::query()->delete();

        $aditya = User::where('email', 'marshaSec@adit.ta')->first();
        $fahristi = User::where('email', 'marshaSec@risti.ta')->first();

        $apps = [
            [
                'title' => 'Final Project Manuscript & Research Chapters',
                'app_name' => 'Google Docs',
                'category' => 'Documentation',
                'icon_key' => 'gdocs',
                'description' => 'Primary academic thesis manuscript, methodology chapters, architecture writeups, and security evaluation deliverables.',
                'links' => [
                    ['title' => 'Thesis Manuscript Draft', 'url' => 'https://docs.google.com'],
                    ['title' => 'Security Evaluation & Test Notes', 'url' => 'https://docs.google.com'],
                ],
                'created_by' => $fahristi?->id ?? $aditya?->id,
            ],
            [
                'title' => 'Project Datasets, Evidence & Asset Archives',
                'app_name' => 'Google Drive',
                'category' => 'Cloud Storage',
                'icon_key' => 'gdrive',
                'description' => 'Central cloud repository for raw testing datasets, log audit captures, thesis presentation slides, and media archives.',
                'links' => [
                    ['title' => 'Shared Research Drive Folder', 'url' => 'https://drive.google.com'],
                    ['title' => 'Audit Evidence & Log Archives', 'url' => 'https://drive.google.com'],
                ],
                'created_by' => $aditya?->id,
            ],
            [
                'title' => 'Security Architecture & UI Design System',
                'app_name' => 'Figma',
                'category' => 'Design System',
                'icon_key' => 'figma',
                'description' => 'Interactive Kanban board wireframes, high fidelity UI components, dark mode color token definitions, and security user flows.',
                'links' => [
                    ['title' => 'Workspace Prototype & Components', 'url' => 'https://www.figma.com'],
                    ['title' => 'Design Tokens & UI Kit', 'url' => 'https://www.figma.com'],
                ],
                'created_by' => $fahristi?->id ?? $aditya?->id,
            ],
            [
                'title' => 'Cryptographic & RBAC Literature Review',
                'app_name' => 'Academic Journals',
                'category' => 'Research',
                'icon_key' => 'journal',
                'description' => 'Peer reviewed publications on zero-trust architectures, authentication security standards, and modern application threat modeling.',
                'links' => [
                    ['title' => 'IEEE Xplore Literature Database', 'url' => 'https://ieeexplore.ieee.org'],
                    ['title' => 'ScienceDirect Security Papers', 'url' => 'https://www.sciencedirect.com'],
                    ['title' => 'ACM Digital Library Access', 'url' => 'https://dl.acm.org'],
                ],
                'created_by' => $aditya?->id,
            ],
            [
                'title' => 'LaTeX Academic Manuscript Publishing',
                'app_name' => 'Overleaf',
                'category' => 'Research',
                'icon_key' => 'overleaf',
                'description' => 'Collaborative LaTeX thesis typesetting, IEEE conference camera-ready layout formatting, and automated BibTeX citation indexing.',
                'links' => [
                    ['title' => 'Main Thesis LaTeX Project', 'url' => 'https://www.overleaf.com'],
                ],
                'created_by' => $fahristi?->id ?? $aditya?->id,
            ],
            [
                'title' => 'Core Workspace Platform Repository',
                'app_name' => 'GitHub',
                'category' => 'Development',
                'icon_key' => 'github',
                'description' => 'Production repository hosting Laravel Inertia React codebase, automated CI/CD deployment pipelines, and git issue tracking.',
                'links' => [
                    ['title' => 'GitHub: Mqrsha-security/marsha-workspace', 'url' => 'https://github.com/Mqrsha-security/marsha-workspace'],
                ],
                'created_by' => $aditya?->id,
            ],
        ];

        foreach ($apps as $appData) {
            WorkspaceApp::create($appData);
        }
    }
}
