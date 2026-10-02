<?php

namespace Tests\Feature;

use App\Models\Meeting;
use App\Models\MeetingNote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MeetingNoteTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_notes_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('notes.index'));

        $response->assertStatus(200);
    }

    public function test_unauthenticated_user_cannot_access_notes(): void
    {
        $response = $this->get(route('notes.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_user_can_create_note_referencing_a_meeting(): void
    {
        $user = User::factory()->create();
        $meeting = Meeting::create([
            'title' => 'Security Architecture Advisory',
            'category' => 'Thesis Advisory',
            'meeting_date' => '2026-10-06',
            'location' => 'Cyber Security Lab',
            'status' => 'scheduled',
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)->post(route('notes.store'), [
            'meeting_id' => $meeting->id,
            'title' => 'Discussion Minutes: Architecture Evaluation & Neon DB Pooler',
            'content' => 'Discussed PostgreSQL serverless pooler response times and RBAC permission caching.',
            'key_takeaways' => [
                'Keepalive pings maintain warm pooler instances',
                'Authentication token validation benchmarks meet requirements',
            ],
            'action_items' => [
                ['task' => 'Update benchmark chart in Chapter 4', 'assignee' => 'Aditya Rahman', 'completed' => false],
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('meeting_notes', [
            'meeting_id' => $meeting->id,
            'title' => 'Discussion Minutes: Architecture Evaluation & Neon DB Pooler',
            'created_by' => $user->id,
        ]);
    }

    public function test_user_can_filter_notes_by_meeting_id(): void
    {
        $user = User::factory()->create();
        $meetingA = Meeting::create([
            'title' => 'Meeting Alpha',
            'category' => 'Progress Review',
            'meeting_date' => '2026-10-07',
            'location' => 'Room 301',
            'status' => 'scheduled',
            'created_by' => $user->id,
        ]);

        $meetingB = Meeting::create([
            'title' => 'Meeting Beta',
            'category' => 'Thesis Advisory',
            'meeting_date' => '2026-10-08',
            'location' => 'Room 302',
            'status' => 'scheduled',
            'created_by' => $user->id,
        ]);

        MeetingNote::create([
            'meeting_id' => $meetingA->id,
            'title' => 'Note for Alpha',
            'content' => 'Alpha discussion details.',
            'created_by' => $user->id,
        ]);

        MeetingNote::create([
            'meeting_id' => $meetingB->id,
            'title' => 'Note for Beta',
            'content' => 'Beta discussion details.',
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)->get(route('notes.index', ['meeting_id' => $meetingA->id]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Notes/Index')
            ->has('notes', 1)
            ->where('notes.0.title', 'Note for Alpha')
        );
    }

    public function test_user_can_update_meeting_note(): void
    {
        $user = User::factory()->create();
        $meeting = Meeting::create([
            'title' => 'Thesis Advisory',
            'category' => 'Thesis Advisory',
            'meeting_date' => '2026-10-09',
            'location' => 'Office',
            'status' => 'scheduled',
            'created_by' => $user->id,
        ]);

        $note = MeetingNote::create([
            'meeting_id' => $meeting->id,
            'title' => 'Original Note Title',
            'content' => 'Initial content',
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)->put(route('notes.update', $note->id), [
            'meeting_id' => $meeting->id,
            'title' => 'Updated Note Title',
            'content' => 'Updated discussion minutes with new technical points.',
            'key_takeaways' => ['Key takeaway revised.'],
            'action_items' => [['task' => 'Refactor auth controller', 'assignee' => 'Aditya', 'completed' => true]],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('meeting_notes', [
            'id' => $note->id,
            'title' => 'Updated Note Title',
            'content' => 'Updated discussion minutes with new technical points.',
        ]);
    }

    public function test_user_can_delete_meeting_note(): void
    {
        $user = User::factory()->create();
        $note = MeetingNote::create([
            'title' => 'Note to be deleted',
            'content' => 'Temporary notes.',
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)->delete(route('notes.destroy', $note->id));

        $response->assertRedirect();
        $this->assertDatabaseMissing('meeting_notes', [
            'id' => $note->id,
        ]);
    }
}
