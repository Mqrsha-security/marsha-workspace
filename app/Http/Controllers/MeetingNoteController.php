<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\MeetingNote;
use App\Models\Task;
use App\Models\WorkspaceApp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MeetingNoteController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $search = $request->query('search');
        $meetingId = $request->query('meeting_id');

        $query = MeetingNote::with([
            'meeting:id,title,category,meeting_date,location,status',
            'creator:id,name,role,avatar_color',
        ])->latest('id');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($meetingId && $meetingId !== 'all') {
            $query->where('meeting_id', $meetingId);
        }

        $notes = $query->get();

        $meetings = Meeting::select('id', 'title', 'category', 'meeting_date', 'location', 'status')
            ->latest('meeting_date')
            ->get();

        $counts = \App\Services\WorkspaceMetricsService::getCounts($user?->id);

        return Inertia::render('Notes/Index', [
            'notes' => $notes,
            'meetings' => $meetings,
            'counts' => $counts,
            'filters' => [
                'search' => $search ?? '',
                'meeting_id' => $meetingId ?? 'all',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'meeting_id' => 'nullable|exists:meetings,id',
            'content' => 'nullable|string|max:10000',
            'key_takeaways' => 'nullable|array',
            'key_takeaways.*' => 'nullable|string|max:500',
            'action_items' => 'nullable|array',
            'action_items.*.task' => 'required_with:action_items|string|max:255',
            'action_items.*.assignee' => 'nullable|string|max:100',
            'action_items.*.completed' => 'nullable|boolean',
        ]);

        MeetingNote::create([
            'title' => $validated['title'],
            'meeting_id' => $validated['meeting_id'] ?? null,
            'content' => $validated['content'] ?? null,
            'key_takeaways' => array_values(array_filter($validated['key_takeaways'] ?? [])),
            'action_items' => $validated['action_items'] ?? [],
            'created_by' => Auth::id(),
        ]);

        \App\Services\WorkspaceMetricsService::clear();

        return redirect()->back();
    }

    public function update(Request $request, MeetingNote $note): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'meeting_id' => 'nullable|exists:meetings,id',
            'content' => 'nullable|string|max:10000',
            'key_takeaways' => 'nullable|array',
            'key_takeaways.*' => 'nullable|string|max:500',
            'action_items' => 'nullable|array',
            'action_items.*.task' => 'required_with:action_items|string|max:255',
            'action_items.*.assignee' => 'nullable|string|max:100',
            'action_items.*.completed' => 'nullable|boolean',
        ]);

        $note->update([
            'title' => $validated['title'],
            'meeting_id' => $validated['meeting_id'] ?? null,
            'content' => $validated['content'] ?? null,
            'key_takeaways' => array_values(array_filter($validated['key_takeaways'] ?? [])),
            'action_items' => $validated['action_items'] ?? [],
        ]);

        \App\Services\WorkspaceMetricsService::clear();

        return redirect()->back();
    }

    public function destroy(MeetingNote $note): RedirectResponse
    {
        $note->delete();

        \App\Services\WorkspaceMetricsService::clear();

        return redirect()->back();
    }
}
