<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\WorkspaceApp;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkspaceAppTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_applications_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('applications.index'));

        $response->assertStatus(200);
    }

    public function test_user_can_create_application_with_multiple_links(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('applications.store'), [
            'title' => 'Security Audit Docs',
            'app_name' => 'Google Docs',
            'category' => 'Documentation',
            'icon_key' => 'gdocs',
            'description' => 'Security audit deliverables and methodology writeup',
            'links' => [
                ['title' => 'Audit Report', 'url' => 'https://docs.google.com/audit'],
                ['title' => 'Test Matrix', 'url' => 'https://docs.google.com/matrix'],
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('workspace_apps', [
            'title' => 'Security Audit Docs',
            'app_name' => 'Google Docs',
        ]);
    }
}
