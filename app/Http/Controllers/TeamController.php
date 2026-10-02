<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $counts = \App\Services\WorkspaceMetricsService::getCounts($user->id);

        $members = User::withCount([
            'assignedTasks as total_tasks_count',
            'assignedTasks as completed_tasks_count' => function ($query) {
                $query->where('status', 'done');
            },
            'assignedTasks as active_tasks_count' => function ($query) {
                $query->whereIn('status', ['todo', 'in_progress', 'revisi']);
            },
        ])->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'avatar_color' => $u->avatar_color,
                'photo_url' => $u->photo_url,
                'is_active' => $u->is_active,
                'last_seen_formatted' => $u->last_seen_formatted,
                'last_seen_at' => $u->last_seen_at,
                'total_tasks_count' => $u->total_tasks_count,
                'completed_tasks_count' => $u->completed_tasks_count,
                'active_tasks_count' => $u->active_tasks_count,
            ];
        });

        return Inertia::render('Teams/Index', [
            'members' => $members,
            'counts' => $counts,
        ]);
    }
}
