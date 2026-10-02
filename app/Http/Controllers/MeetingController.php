<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\Task;
use App\Models\WorkspaceApp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MeetingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $search = $request->query('search');
        $status = $request->query('status');
        $category = $request->query('category');

        $query = Meeting::with('creator:id,name,role')->latest('meeting_date')->latest('id');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        $meetings = $query->get();

        $counts = [
            'total' => Task::count(),
            'my_tasks' => Task::where('assigned_to', $user?->id)->count(),
            'todo' => Task::where('status', 'todo')->count(),
            'in_progress' => Task::where('status', 'in_progress')->count(),
            'revisi' => Task::where('status', 'revisi')->count(),
            'done' => Task::where('status', 'done')->count(),
            'urgent' => Task::where('priority', 'urgent')->where('status', '!=', 'done')->count(),
            'apps_count' => WorkspaceApp::count(),
            'meetings_count' => Meeting::count(),
            'scheduled_meetings' => Meeting::where('status', 'scheduled')->count(),
            'completed_meetings' => Meeting::where('status', 'completed')->count(),
        ];

        $categories = Meeting::distinct()->pluck('category')->filter()->values();
        if ($categories->isEmpty()) {
            $categories = collect([
                'Thesis Advisory',
                'Security Architecture',
                'Progress Review',
                'Seminar & Defense',
                'Code Review',
            ]);
        }

        return Inertia::render('Meetings/Index', [
            'meetings' => $meetings,
            'counts' => $counts,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? 'all',
                'category' => $category ?? 'all',
            ],
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'meeting_date' => 'required|date',
            'start_time' => 'nullable|string|max:20',
            'end_time' => 'nullable|string|max:20',
            'location' => 'required|string|max:255',
            'status' => 'required|string|in:scheduled,ongoing,completed,cancelled',
            'attendees' => 'nullable|array',
            'points' => 'nullable|array',
            'points.*' => 'nullable|string|max:1000',
            'action_items' => 'nullable|array',
            'action_items.*.task' => 'required_with:action_items|string|max:255',
            'action_items.*.assignee' => 'nullable|string|max:100',
            'action_items.*.completed' => 'nullable|boolean',
            'reference_links' => 'nullable|array',
            'reference_links.*.title' => 'required_with:reference_links|string|max:255',
            'reference_links.*.url' => 'required_with:reference_links|string|max:2000',
            'images' => 'nullable|array',
            'images.*.url' => 'required_with:images|string',
            'images.*.caption' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:5000',
        ]);

        Meeting::create([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'meeting_date' => $validated['meeting_date'],
            'start_time' => $validated['start_time'] ?? null,
            'end_time' => $validated['end_time'] ?? null,
            'location' => $validated['location'],
            'status' => $validated['status'] ?? 'scheduled',
            'attendees' => $validated['attendees'] ?? [],
            'points' => array_values(array_filter($validated['points'] ?? [])),
            'action_items' => $validated['action_items'] ?? [],
            'reference_links' => $validated['reference_links'] ?? [],
            'images' => $validated['images'] ?? [],
            'notes' => $validated['notes'] ?? null,
            'created_by' => Auth::id(),
        ]);

        return redirect()->back();
    }

    public function update(Request $request, Meeting $meeting): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'meeting_date' => 'required|date',
            'start_time' => 'nullable|string|max:20',
            'end_time' => 'nullable|string|max:20',
            'location' => 'required|string|max:255',
            'status' => 'required|string|in:scheduled,ongoing,completed,cancelled',
            'attendees' => 'nullable|array',
            'points' => 'nullable|array',
            'points.*' => 'nullable|string|max:1000',
            'action_items' => 'nullable|array',
            'action_items.*.task' => 'required_with:action_items|string|max:255',
            'action_items.*.assignee' => 'nullable|string|max:100',
            'action_items.*.completed' => 'nullable|boolean',
            'reference_links' => 'nullable|array',
            'reference_links.*.title' => 'required_with:reference_links|string|max:255',
            'reference_links.*.url' => 'required_with:reference_links|string|max:2000',
            'images' => 'nullable|array',
            'images.*.url' => 'required_with:images|string',
            'images.*.caption' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:5000',
        ]);

        $meeting->update([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'meeting_date' => $validated['meeting_date'],
            'start_time' => $validated['start_time'] ?? null,
            'end_time' => $validated['end_time'] ?? null,
            'location' => $validated['location'],
            'status' => $validated['status'] ?? 'scheduled',
            'attendees' => $validated['attendees'] ?? [],
            'points' => array_values(array_filter($validated['points'] ?? [])),
            'action_items' => $validated['action_items'] ?? [],
            'reference_links' => $validated['reference_links'] ?? [],
            'images' => $validated['images'] ?? [],
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back();
    }

    public function destroy(Meeting $meeting): RedirectResponse
    {
        $meeting->delete();

        return redirect()->back();
    }
}
