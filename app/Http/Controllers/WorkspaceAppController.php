<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\WorkspaceApp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceAppController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $search = $request->query('search');
        $category = $request->query('category');

        $query = WorkspaceApp::with('creator:id,name,role')->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('app_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        $apps = $query->get();

        $counts = [
            'total' => Task::count(),
            'my_tasks' => Task::where('assigned_to', $user->id)->count(),
            'todo' => Task::where('status', 'todo')->count(),
            'in_progress' => Task::where('status', 'in_progress')->count(),
            'revisi' => Task::where('status', 'revisi')->count(),
            'done' => Task::where('status', 'done')->count(),
            'urgent' => Task::where('priority', 'urgent')->where('status', '!=', 'done')->count(),
            'apps_count' => WorkspaceApp::count(),
            'meetings_count' => rescue(fn () => \App\Models\Meeting::count(), fn () => 0),
        ];

        $categories = WorkspaceApp::distinct()->pluck('category')->filter()->values();

        return Inertia::render('Applications/Index', [
            'apps' => $apps,
            'counts' => $counts,
            'filters' => [
                'search' => $search ?? '',
                'category' => $category ?? 'all',
            ],
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'app_name' => 'required|string|max:100',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'icon_key' => 'nullable|string|max:50',
            'links' => 'required|array|min:1',
            'links.*.title' => 'required|string|max:255',
            'links.*.url' => 'required|string|max:1000',
        ]);

        WorkspaceApp::create([
            'title' => $validated['title'],
            'app_name' => $validated['app_name'],
            'category' => $validated['category'],
            'description' => $validated['description'] ?? null,
            'icon_key' => $validated['icon_key'] ?? 'link',
            'links' => $validated['links'],
            'created_by' => Auth::id(),
        ]);

        return redirect()->back();
    }

    public function update(Request $request, WorkspaceApp $application): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'app_name' => 'required|string|max:100',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'icon_key' => 'nullable|string|max:50',
            'links' => 'required|array|min:1',
            'links.*.title' => 'required|string|max:255',
            'links.*.url' => 'required|string|max:1000',
        ]);

        $application->update([
            'title' => $validated['title'],
            'app_name' => $validated['app_name'],
            'category' => $validated['category'],
            'description' => $validated['description'] ?? null,
            'icon_key' => $validated['icon_key'] ?? 'link',
            'links' => $validated['links'],
        ]);

        return redirect()->back();
    }

    public function destroy(WorkspaceApp $application): RedirectResponse
    {
        $application->delete();

        return redirect()->back();
    }
}
