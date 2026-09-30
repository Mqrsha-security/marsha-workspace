<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $scope = $request->query('scope', 'all'); // 'all', 'assigned_to_me', 'assigned_by_me'
        $status = $request->query('status');
        $priority = $request->query('priority');
        $category = $request->query('category');
        $search = $request->query('search');

        $query = Task::with([
            'creator:id,name,role,avatar_color,identifier',
            'assignee:id,name,role,avatar_color,identifier',
            'comments.user:id,name,avatar_color',
        ]);

        if ($scope === 'assigned_to_me') {
            $query->where('assigned_to', $user->id);
        } elseif ($scope === 'assigned_by_me') {
            $query->where('created_by', $user->id);
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($priority && $priority !== 'all') {
            $query->where('priority', $priority);
        }

        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $tasks = $query->orderByRaw("CASE status WHEN 'revisi' THEN 1 WHEN 'in_progress' THEN 2 WHEN 'todo' THEN 3 WHEN 'done' THEN 4 ELSE 5 END")
            ->orderBy('due_at', 'asc')
            ->get();

        // Calculate summary counters
        $counts = [
            'total' => Task::count(),
            'my_tasks' => Task::where('assigned_to', $user->id)->count(),
            'todo' => Task::where('status', 'todo')->count(),
            'in_progress' => Task::where('status', 'in_progress')->count(),
            'revisi' => Task::where('status', 'revisi')->count(),
            'done' => Task::where('status', 'done')->count(),
            'urgent' => Task::where('priority', 'urgent')->where('status', '!=', 'done')->count(),
        ];

        $users = User::select('id', 'name', 'role', 'identifier', 'avatar_color')->get();

        $categories = Task::distinct()
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->pluck('category')
            ->values();

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'counts' => $counts,
            'users' => $users,
            'categories' => $categories,
            'filters' => [
                'scope' => $scope,
                'status' => $status ?? 'all',
                'priority' => $priority ?? 'all',
                'category' => $category ?? 'all',
                'search' => $search ?? '',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'descriptions' => 'nullable|array',
            'descriptions.*' => 'nullable|string|max:2000',
            'link' => 'nullable|url|max:500',
            'links' => 'nullable|array',
            'links.*' => 'nullable|url|max:500',
            'tabs' => 'nullable|array',
            'tabs.*.id' => 'nullable|string',
            'tabs.*.name' => 'nullable|string|max:100',
            'tabs.*.items' => 'nullable|array',
            'tabs.*.items.*' => 'nullable|string|max:2000',
            'tabs.*.links' => 'nullable|array',
            'tabs.*.links.*' => 'nullable|url|max:500',
            'category' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'assigned_to' => 'required|exists:users,id',
            'due_at' => 'required|date',
            'status' => 'nullable|in:todo,in_progress,revisi,done',
            'revision_notes' => 'nullable|string',
        ]);

        $cleanTabs = null;
        if (!empty($validated['tabs']) && is_array($validated['tabs'])) {
            $cleanTabs = [];
            foreach ($validated['tabs'] as $idx => $t) {
                $name = trim($t['name'] ?? '');
                if ($name === '') $name = 'Tab ' . ($idx + 1);
                $items = array_values(array_filter(array_map('trim', (array) ($t['items'] ?? []))));
                $links = array_values(array_filter(array_map('trim', (array) ($t['links'] ?? []))));
                $cleanTabs[] = [
                    'id' => $t['id'] ?? ('tab-' . ($idx + 1)),
                    'name' => $name,
                    'items' => $items,
                    'links' => $links,
                ];
            }
        }

        $rawDescriptions = $validated['descriptions'] ?? [];
        if (!empty($validated['description']) && empty($rawDescriptions)) {
            $rawDescriptions = [$validated['description']];
        }
        $cleanDescriptions = array_values(array_filter(array_map('trim', (array) $rawDescriptions)));

        $rawLinks = $validated['links'] ?? [];
        if (!empty($validated['link']) && empty($rawLinks)) {
            $rawLinks = [$validated['link']];
        }
        $cleanLinks = array_values(array_filter(array_map('trim', (array) $rawLinks)));

        $task = Task::create([
            'title' => $validated['title'],
            'description' => $cleanDescriptions[0] ?? null,
            'descriptions' => $cleanDescriptions,
            'link' => $cleanLinks[0] ?? null,
            'links' => $cleanLinks,
            'tabs' => $cleanTabs,
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'created_by' => Auth::id(),
            'assigned_to' => $validated['assigned_to'],
            'due_at' => Carbon::parse($validated['due_at']),
            'status' => $validated['status'] ?? 'todo',
            'revision_notes' => $validated['revision_notes'] ?? null,
        ]);

        if ((int) $task->assigned_to !== (int) Auth::id()) {
            \App\Models\AppNotification::create([
                'user_id' => $task->assigned_to,
                'sender_id' => Auth::id(),
                'task_id' => $task->id,
                'type' => 'task_assigned',
                'title' => 'New Task Assigned',
                'message' => Auth::user()->name . ' assigned task: "' . $task->title . '"',
            ]);
        }

        return redirect()->back()->with('success', 'Task created successfully.');
    }

    public function update(Request $request, Task $task): RedirectResponse
    {
        if ($task->assigned_to !== Auth::id()) {
            abort(403, 'Only the assigned individual can edit this task.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'descriptions' => 'nullable|array',
            'descriptions.*' => 'nullable|string|max:2000',
            'link' => 'nullable|url|max:500',
            'links' => 'nullable|array',
            'links.*' => 'nullable|url|max:500',
            'tabs' => 'nullable|array',
            'tabs.*.id' => 'nullable|string',
            'tabs.*.name' => 'nullable|string|max:100',
            'tabs.*.items' => 'nullable|array',
            'tabs.*.items.*' => 'nullable|string|max:2000',
            'tabs.*.links' => 'nullable|array',
            'tabs.*.links.*' => 'nullable|url|max:500',
            'category' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'assigned_to' => 'required|exists:users,id',
            'due_at' => 'required|date',
            'status' => 'required|in:todo,in_progress,revisi,done',
            'revision_notes' => 'nullable|string',
        ]);

        $cleanTabs = null;
        if (!empty($validated['tabs']) && is_array($validated['tabs'])) {
            $cleanTabs = [];
            foreach ($validated['tabs'] as $idx => $t) {
                $name = trim($t['name'] ?? '');
                if ($name === '') $name = 'Tab ' . ($idx + 1);
                $items = array_values(array_filter(array_map('trim', (array) ($t['items'] ?? []))));
                $links = array_values(array_filter(array_map('trim', (array) ($t['links'] ?? []))));
                $cleanTabs[] = [
                    'id' => $t['id'] ?? ('tab-' . ($idx + 1)),
                    'name' => $name,
                    'items' => $items,
                    'links' => $links,
                ];
            }
        }

        $rawDescriptions = $validated['descriptions'] ?? [];
        if (!empty($validated['description']) && empty($rawDescriptions)) {
            $rawDescriptions = [$validated['description']];
        }
        $cleanDescriptions = array_values(array_filter(array_map('trim', (array) $rawDescriptions)));

        $rawLinks = $validated['links'] ?? [];
        if (!empty($validated['link']) && empty($rawLinks)) {
            $rawLinks = [$validated['link']];
        }
        $cleanLinks = array_values(array_filter(array_map('trim', (array) $rawLinks)));

        $task->fill([
            'title' => $validated['title'],
            'description' => $cleanDescriptions[0] ?? null,
            'descriptions' => $cleanDescriptions,
            'link' => $cleanLinks[0] ?? null,
            'links' => $cleanLinks,
            'tabs' => $cleanTabs,
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'assigned_to' => $validated['assigned_to'],
            'due_at' => Carbon::parse($validated['due_at']),
            'status' => $validated['status'],
            'revision_notes' => $validated['revision_notes'] ?? null,
        ]);

        if ($validated['status'] === 'done' && ! $task->completed_at) {
            $task->completed_at = now();
        } elseif ($validated['status'] !== 'done') {
            $task->completed_at = null;
        }

        $task->save();

        return redirect()->back()->with('success', 'Task updated successfully.');
    }

    public function updateStatus(Request $request, Task $task): RedirectResponse
    {
        if ($task->assigned_to !== Auth::id()) {
            abort(403, 'Only the assigned individual can update the status of this task.');
        }

        $validated = $request->validate([
            'status' => 'required|in:todo,in_progress,revisi,done',
            'revision_notes' => 'nullable|string',
        ]);

        $task->status = $validated['status'];
        if (isset($validated['revision_notes'])) {
            $task->revision_notes = $validated['revision_notes'];
        }

        if ($validated['status'] === 'done') {
            $task->completed_at = now();
        } else {
            $task->completed_at = null;
        }

        $task->save();

        return redirect()->back()->with('success', 'Status updated successfully.');
    }

    public function reassign(Request $request, Task $task): RedirectResponse
    {
        if ($task->assigned_to !== Auth::id()) {
            abort(403, 'Only the assigned individual can reassign this task.');
        }

        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $task->assigned_to = $validated['assigned_to'];
        $task->save();

        if ((int) $task->assigned_to !== (int) Auth::id()) {
            \App\Models\AppNotification::create([
                'user_id' => $task->assigned_to,
                'sender_id' => Auth::id(),
                'task_id' => $task->id,
                'type' => 'task_reassigned',
                'title' => 'Task Reassigned',
                'message' => Auth::user()->name . ' reassigned task to you: "' . $task->title . '"',
            ]);
        }

        return redirect()->back()->with('success', 'Task reassigned successfully.');
    }

    public function destroy(Task $task): RedirectResponse
    {
        if ($task->assigned_to !== Auth::id()) {
            abort(403, 'Only the assigned individual can delete this task.');
        }

        $task->delete();

        return redirect()->back()->with('success', 'Task deleted successfully.');
    }

    public function addComment(Request $request, Task $task): RedirectResponse
    {
        $validated = $request->validate([
            'comment' => 'required|string|max:1000',
        ]);

        TaskComment::create([
            'task_id' => $task->id,
            'user_id' => Auth::id(),
            'comment' => $validated['comment'],
        ]);

        $recipients = collect([(int) $task->assigned_to, (int) $task->created_by])
            ->filter()
            ->reject(fn ($id) => $id === (int) Auth::id())
            ->unique();

        foreach ($recipients as $recipientId) {
            \App\Models\AppNotification::create([
                'user_id' => $recipientId,
                'sender_id' => Auth::id(),
                'task_id' => $task->id,
                'type' => 'comment_added',
                'title' => 'New Feedback on Task',
                'message' => Auth::user()->name . ' commented on: "' . $task->title . '"',
            ]);
        }

        return redirect()->back()->with('success', 'Note added successfully.');
    }
}
