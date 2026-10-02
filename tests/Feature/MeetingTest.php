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
            'title' => 'Bimbingan Bab 4: Arsitektur Keamanan',
            'category' => 'Bimbingan Skripsi',
            'meeting_date' => '2026-10-05',
            'start_time' => '09:00',
            'end_time' => '11:00',
            'location' => 'Lab Cyber Security Gedung B Lt. 3',
            'status' => 'scheduled',
            'attendees' => ['Aditya Rahman', 'Fahristi Dewi Khadijah'],
            'points' => [
                'Penyelarasan parameter pengujian penetrasi',
                'Evaluasi arsitektur token JWT',
            ],
            'action_items' => [
                ['task' => 'Revisi bab 4 subbab 4.2', 'assignee' => 'Aditya Rahman', 'completed' => false],
            ],
            'reference_links' => [
                ['title' => 'Draf Bab 4', 'url' => 'https://docs.google.com/bab4'],
            ],
            'images' => [
                ['url' => 'data:image/png;base64,sample', 'caption' => 'Bagan Arsitektur'],
            ],
            'notes' => 'Catatan penting hasil evaluasi.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('meetings', [
            'title' => 'Bimbingan Bab 4: Arsitektur Keamanan',
            'location' => 'Lab Cyber Security Gedung B Lt. 3',
            'notes' => 'Catatan penting hasil evaluasi.',
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
            'points' => ['Pembahasan selesai'],
            'notes' => 'Catatan pembahasan yang diperbarui.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('meetings', [
            'id' => $meeting->id,
            'title' => 'Updated Meeting Title',
            'status' => 'completed',
            'notes' => 'Catatan pembahasan yang diperbarui.',
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
