<?php

namespace Tests\Feature;

use App\Models\Meeting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MeetingTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_meetings_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('meetings.index'));

        $response->assertStatus(200);
    }

    public function test_unauthenticated_user_cannot_access_meetings(): void
    {
        $response = $this->get(route('meetings.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_user_can_create_meeting_with_points_and_references(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('meetings.store'), [
            'title' => 'Thesis Advisory Chapter 4: Security Architecture',
            'category' => 'Thesis Advisory',
            'meeting_date' => '2026-10-05',
            'start_time' => '09:00',
            'end_time' => '11:00',
            'location' => 'Cyber Security Lab Building B 3rd Fl',
            'status' => 'scheduled',
            'attendees' => ['Aditya Rahman', 'Fahristi Dewi Khadijah'],
            'points' => [
                'Alignment of penetration testing parameters',
                'Evaluation of JWT authentication architecture',
            ],
            'action_items' => [
                ['task' => 'Revise Chapter 4 Section 4.2', 'assignee' => 'Aditya Rahman', 'completed' => false],
            ],
            'reference_links' => [
                ['title' => 'Chapter 4 Draft', 'url' => 'https://docs.google.com/bab4'],
            ],
            'images' => [
                ['url' => 'data:image/png;base64,sample', 'caption' => 'Architecture Diagram'],
            ],
            'notes' => 'Key evaluation and discussion notes.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('meetings', [
            'title' => 'Thesis Advisory Chapter 4: Security Architecture',
            'location' => 'Cyber Security Lab Building B 3rd Fl',
            'notes' => 'Key evaluation and discussion notes.',
        ]);
    }

    public function test_user_can_update_meeting(): void
    {
        $user = User::factory()->create();
        $meeting = Meeting::create([
            'title' => 'Initial Meeting',
            'category' => 'Progress Review',
            'meeting_date' => '2026-10-05',
            'start_time' => '10:00',
            'end_time' => '11:00',
            'location' => 'Google Meet',
            'status' => 'scheduled',
            'notes' => 'Initial notes',
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)->put(route('meetings.update', $meeting->id), [
            'title' => 'Updated Meeting Title',
            'category' => 'Progress Review',
            'meeting_date' => '2026-10-05',
            'start_time' => '10:00',
            'end_time' => '11:00',
            'location' => 'Google Meet',
            'status' => 'completed',
            'points' => ['Discussion concluded'],
            'notes' => 'Updated discussion notes.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('meetings', [
            'id' => $meeting->id,
            'title' => 'Updated Meeting Title',
            'status' => 'completed',
            'notes' => 'Updated discussion notes.',
        ]);
    }

    public function test_user_can_delete_meeting(): void
    {
        $user = User::factory()->create();
        $meeting = Meeting::create([
            'title' => 'Meeting to delete',
            'category' => 'Code Review',
            'meeting_date' => '2026-10-05',
            'location' => 'Lab',
            'status' => 'scheduled',
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)->delete(route('meetings.destroy', $meeting->id));

        $response->assertRedirect();
        $this->assertDatabaseMissing('meetings', [
            'id' => $meeting->id,
        ]);
    }
}
