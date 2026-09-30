<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_tasks(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/tasks');

        $response->assertStatus(200);
    }

    public function test_user_can_assign_task_to_another_individual(): void
    {
        $dosen = User::factory()->create(['role' => 'dosen_pembimbing']);
        $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);

        $response = $this->actingAs($dosen)->post('/tasks', [
            'title' => 'Revisi Metodologi Penelitian Bab 3',
            'description' => 'Perbaiki diagram alir sistem dan penjelasan sampling.',
            'category' => 'Bab 3 - Metodologi Penelitian',
            'priority' => 'high',
            'assigned_to' => $mahasiswa->id,
            'due_at' => Carbon::now()->addDays(3)->toDateTimeString(),
            'status' => 'revisi',
            'revision_notes' => 'Diagram UML belum lengkap.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', [
            'title' => 'Revisi Metodologi Penelitian Bab 3',
            'created_by' => $dosen->id,
            'assigned_to' => $mahasiswa->id,
            'status' => 'revisi',
        ]);
    }

    public function test_user_can_update_task_status_to_done_or_revisi(): void
    {
        $user = User::factory()->create();
        $task = Task::create([
            'title' => 'Cek Plagiasi Turnitin Bab 1',
            'category' => 'Bab 1 - Pendahuluan',
            'priority' => 'medium',
            'created_by' => $user->id,
            'assigned_to' => $user->id,
            'due_at' => Carbon::now()->addDay(),
            'status' => 'todo',
        ]);

        $response = $this->actingAs($user)->patch("/tasks/{$task->id}/status", [
            'status' => 'done',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'status' => 'done',
        ]);
        $this->assertNotNull($task->fresh()->completed_at);
    }

    public function test_user_can_reassign_existing_task(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $task = Task::create([
            'title' => 'Review Literature',
            'category' => 'Chapter 2',
            'priority' => 'medium',
            'created_by' => $user1->id,
            'assigned_to' => $user1->id,
            'due_at' => Carbon::now()->addDays(2),
            'status' => 'todo',
        ]);

        $response = $this->actingAs($user1)->patch("/tasks/{$task->id}/assign", [
            'assigned_to' => $user2->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'assigned_to' => $user2->id,
        ]);
    }

    public function test_user_cannot_update_or_delete_peer_task(): void
    {
        $adit = User::factory()->create(['name' => 'Aditya Rahman']);
        $risti = User::factory()->create(['name' => 'Fahristi Dewi Khadijah']);

        $task = Task::create([
            'title' => 'Risti Task - Chapter 4 Analysis',
            'category' => 'Chapter 4',
            'priority' => 'high',
            'created_by' => $risti->id,
            'assigned_to' => $risti->id,
            'due_at' => Carbon::now()->addDays(2),
            'status' => 'in_progress',
        ]);

        // Adit attempts to update status of Risti's task -> should be forbidden (403)
        $statusResponse = $this->actingAs($adit)->patch("/tasks/{$task->id}/status", [
            'status' => 'done',
        ]);
        $statusResponse->assertStatus(403);

        // Adit attempts to delete Risti's task -> should be forbidden (403)
        $deleteResponse = $this->actingAs($adit)->delete("/tasks/{$task->id}");
        $deleteResponse->assertStatus(403);

        // Adit attempts to edit Risti's task -> should be forbidden (403)
        $editResponse = $this->actingAs($adit)->put("/tasks/{$task->id}", [
            'title' => 'Tampered Title',
            'category' => 'Chapter 4',
            'priority' => 'high',
            'assigned_to' => $adit->id,
            'due_at' => Carbon::now()->addDays(2)->toDateTimeString(),
            'status' => 'in_progress',
        ]);
        $editResponse->assertStatus(403);
    }

    public function test_user_can_comment_on_peer_task(): void
    {
        $adit = User::factory()->create(['name' => 'Aditya Rahman']);
        $risti = User::factory()->create(['name' => 'Fahristi Dewi Khadijah']);

        $task = Task::create([
            'title' => 'Risti Task - Chapter 4 Analysis',
            'category' => 'Chapter 4',
            'priority' => 'high',
            'created_by' => $risti->id,
            'assigned_to' => $risti->id,
            'due_at' => Carbon::now()->addDays(2),
            'status' => 'in_progress',
        ]);

        // Adit comments on Risti's task
        $commentResponse = $this->actingAs($adit)->post("/tasks/{$task->id}/comments", [
            'comment' => 'Please verify table 4.2 data source before submitting.',
        ]);

        $commentResponse->assertRedirect();
        $this->assertDatabaseHas('task_comments', [
            'task_id' => $task->id,
            'user_id' => $adit->id,
            'comment' => 'Please verify table 4.2 data source before submitting.',
        ]);
    }

    public function test_assigning_task_generates_notification(): void
    {
        $adit = User::factory()->create(['name' => 'Aditya Rahman']);
        $risti = User::factory()->create(['name' => 'Fahristi Dewi Khadijah']);

        $response = $this->actingAs($adit)->post('/tasks', [
            'title' => 'Implement Auth Middleware',
            'category' => 'Security',
            'priority' => 'high',
            'assigned_to' => $risti->id,
            'due_at' => Carbon::now()->addDays(2)->toDateTimeString(),
            'status' => 'todo',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $risti->id,
            'sender_id' => $adit->id,
            'type' => 'task_assigned',
            'is_read' => false,
        ]);
    }

    public function test_commenting_on_task_generates_notification_for_assignee(): void
    {
        $adit = User::factory()->create(['name' => 'Aditya Rahman']);
        $risti = User::factory()->create(['name' => 'Fahristi Dewi Khadijah']);

        $task = Task::create([
            'title' => 'Adit Task - Dataset Prep',
            'category' => 'Data',
            'priority' => 'medium',
            'created_by' => $adit->id,
            'assigned_to' => $adit->id,
            'due_at' => Carbon::now()->addDays(2),
            'status' => 'in_progress',
        ]);

        // Risti comments on Adit's task
        $response = $this->actingAs($risti)->post("/tasks/{$task->id}/comments", [
            'comment' => 'Dataset looks ready for normalization.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $adit->id,
            'sender_id' => $risti->id,
            'type' => 'comment_added',
            'is_read' => false,
        ]);
    }

    public function test_user_can_mark_notifications_as_read(): void
    {
        $user = User::factory()->create();
        $notification = \App\Models\AppNotification::create([
            'user_id' => $user->id,
            'sender_id' => null,
            'type' => 'task_assigned',
            'title' => 'Test',
            'message' => 'Test message',
            'is_read' => false,
        ]);

        $response = $this->actingAs($user)->post("/notifications/{$notification->id}/read");
        $response->assertRedirect();
        $this->assertTrue($notification->fresh()->is_read);

        $responseAll = $this->actingAs($user)->post('/notifications/read-all');
        $responseAll->assertRedirect();
    }

    public function test_user_can_create_and_update_task_with_multiple_descriptions_and_links(): void
    {
        $user = User::factory()->create();

        $createResponse = $this->actingAs($user)->post('/tasks', [
            'title' => 'Deep Learning Experimentation',
            'descriptions' => [
                'Download CIFAR-100 dataset',
                'Train ResNet-50 baseline model',
                'Evaluate confusion matrix and precision score',
            ],
            'links' => [
                'https://github.com/marsha-security/thesis-core',
                'https://drive.google.com/drive/folders/test123',
            ],
            'category' => 'Experimentation',
            'priority' => 'high',
            'assigned_to' => $user->id,
            'due_at' => Carbon::now()->addDays(5)->toDateTimeString(),
            'status' => 'todo',
        ]);

        $createResponse->assertRedirect();
        $task = Task::where('title', 'Deep Learning Experimentation')->first();
        $this->assertNotNull($task);
        $this->assertCount(3, $task->descriptions_list);
        $this->assertCount(2, $task->links_list);

        // Update task: reduce descriptions and add another link
        $updateResponse = $this->actingAs($user)->put("/tasks/{$task->id}", [
            'title' => 'Deep Learning Experimentation - Phase 1',
            'descriptions' => [
                'Download CIFAR-100 dataset',
                'Train ResNet-50 baseline model',
            ],
            'links' => [
                'https://github.com/marsha-security/thesis-core',
                'https://drive.google.com/drive/folders/test123',
                'https://overleaf.com/project/xyz',
            ],
            'category' => 'Experimentation',
            'priority' => 'urgent',
            'assigned_to' => $user->id,
            'due_at' => Carbon::now()->addDays(5)->toDateTimeString(),
            'status' => 'in_progress',
        ]);

        $updateResponse->assertRedirect();
        $task->refresh();
        $this->assertEquals('Deep Learning Experimentation - Phase 1', $task->title);
        $this->assertCount(2, $task->descriptions_list);
        $this->assertCount(3, $task->links_list);
    }

    public function test_user_can_create_and_update_task_with_dynamic_tabs(): void
    {
        $user = User::factory()->create();

        $createResponse = $this->actingAs($user)->post('/tasks', [
            'title' => 'Cross-Platform Redesign',
            'category' => 'Engineering',
            'priority' => 'high',
            'assigned_to' => $user->id,
            'due_at' => Carbon::now()->addDays(4)->toDateTimeString(),
            'status' => 'todo',
            'tabs' => [
                [
                    'id' => 'tab-ui',
                    'name' => 'UI/UX',
                    'items' => ['Figma High-Fidelity Mockup', 'Accessibility Contrast Check'],
                    'links' => ['https://figma.com/file/123'],
                ],
                [
                    'id' => 'tab-code',
                    'name' => 'Coding',
                    'items' => ['Implement Lucide icons', 'Refactor navigation state'],
                    'links' => ['https://github.com/marsha-sec/ui'],
                ],
                [
                    'id' => 'tab-ds',
                    'name' => 'Design System',
                    'items' => ['Sync Tailwind color palette'],
                    'links' => [],
                ],
            ],
        ]);

        $createResponse->assertRedirect();
        $task = Task::where('title', 'Cross-Platform Redesign')->first();
        $this->assertNotNull($task);
        $this->assertCount(3, $task->tabs);
        $this->assertEquals('UI/UX', $task->tabs[0]['name']);
        $this->assertCount(2, $task->tabs[0]['items']);
        $this->assertCount(5, $task->descriptions_list);

        // Update task tabs: remove a tab, add a new tab
        $updateResponse = $this->actingAs($user)->put("/tasks/{$task->id}", [
            'title' => 'Cross-Platform Redesign - Iteration 2',
            'category' => 'Engineering',
            'priority' => 'urgent',
            'assigned_to' => $user->id,
            'due_at' => Carbon::now()->addDays(3)->toDateTimeString(),
            'status' => 'in_progress',
            'tabs' => [
                [
                    'id' => 'tab-ui',
                    'name' => 'UI/UX Final',
                    'items' => ['Handover to Engineering'],
                    'links' => ['https://figma.com/file/123-final'],
                ],
                [
                    'id' => 'tab-qa',
                    'name' => 'QA Testing',
                    'items' => ['Smoke test login', 'Verify permissions'],
                    'links' => [],
                ],
            ],
        ]);

        $updateResponse->assertRedirect();
        $task->refresh();
        $this->assertEquals('Cross-Platform Redesign - Iteration 2', $task->title);
        $this->assertCount(2, $task->tabs);
        $this->assertEquals('UI/UX Final', $task->tabs[0]['name']);
        $this->assertEquals('QA Testing', $task->tabs[1]['name']);
        $this->assertCount(3, $task->descriptions_list);
    }

    public function test_database_seeder_assigns_correct_roles_to_aditya_and_fahristi(): void
    {
        $this->seed(\Database\Seeders\DatabaseSeeder::class);

        $aditya = User::where('email', 'marshaSec@adit.ta')->first();
        $this->assertNotNull($aditya);
        $this->assertEquals('Security Architect', $aditya->role);

        $fahristi = User::where('email', 'marshaSec@risti.ta')->first();
        $this->assertNotNull($fahristi);
        $this->assertEquals('Project Manager', $fahristi->role);
    }
}
