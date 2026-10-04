<?php

namespace Tests\Feature;

use App\Models\Meeting;
use App\Models\MeetingNote;
use App\Models\Task;
use App\Models\User;
use App\Models\WorkspaceApp;
use App\Services\GoogleDriveBackupService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BackupTest extends TestCase
{
    use RefreshDatabase;

    public function test_backup_status_requires_authentication(): void
    {
        $response = $this->get('/backup/status');
        $response->assertRedirect('/login');
    }

    public function test_backup_status_returns_data_for_authenticated_user(): void
    {
        $user = User::factory()->create();
        Task::create([
            'title' => 'Test Task 1',
            'category' => 'Testing',
            'priority' => 'medium',
            'created_by' => $user->id,
            'assigned_to' => $user->id,
            'status' => 'todo',
            'due_at' => Carbon::now()->addDays(2),
        ]);
        Task::create([
            'title' => 'Test Task 2',
            'category' => 'Testing',
            'priority' => 'high',
            'created_by' => $user->id,
            'assigned_to' => $user->id,
            'status' => 'done',
            'due_at' => Carbon::now()->addDays(3),
        ]);

        $response = $this->actingAs($user)->get('/backup/status');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'configured',
            'counts' => ['tasks', 'meetings', 'notes', 'apps', 'users'],
            'default_share_email',
        ]);
        $response->assertJson([
            'counts' => [
                'tasks' => 2,
            ],
        ]);
    }

    public function test_backup_download_generates_valid_zip_archive(): void
    {
        $user = User::factory()->create();
        Task::create([
            'title' => 'Test Task for Backup',
            'category' => 'General',
            'priority' => 'low',
            'created_by' => $user->id,
            'assigned_to' => $user->id,
            'status' => 'in_progress',
            'due_at' => Carbon::now()->addDays(1),
        ]);

        $response = $this->actingAs($user)->get('/backup/download');

        $response->assertStatus(200);
        $this->assertTrue(str_contains($response->headers->get('content-disposition'), 'marsha_workspace_backup_'));
        $this->assertEquals('application/zip', $response->headers->get('content-type'));
    }

    public function test_backup_google_drive_fails_cleanly_when_not_configured(): void
    {
        config(['services.google.service_account_json' => null]);
        config(['services.google.service_account_email' => null]);
        config(['services.google.private_key' => null]);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/backup/google-drive');

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'needs_config' => true,
        ]);
    }

    public function test_backup_google_drive_executes_successfully_when_mocked(): void
    {
        $user = User::factory()->create();

        $mockService = $this->mock(GoogleDriveBackupService::class);
        $mockService->shouldReceive('isConfigured')->once()->andReturn(true);
        $mockService->shouldReceive('executeBackup')->once()->with($user->email, null)->andReturn([
            'success' => true,
            'folder_id' => 'mock_folder_123',
            'folder_name' => 'Marsha Security Backup - 2026-10-04 13:00',
            'folder_url' => 'https://drive.google.com/drive/folders/mock_folder_123',
            'docs' => [
                ['name' => '0. Workspace Executive Summary', 'url' => 'https://docs.google.com/document/d/mock1/edit'],
                ['name' => '1. Tasks & Workstreams Master', 'url' => 'https://docs.google.com/document/d/mock2/edit'],
            ],
        ]);

        $response = $this->actingAs($user)->postJson('/backup/google-drive', [
            'share_email' => $user->email,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'folder_id' => 'mock_folder_123',
        ]);
    }
}
