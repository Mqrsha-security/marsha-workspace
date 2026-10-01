<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        if ($user) {
            $user->updateQuietly(['last_seen_at' => now()]);
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'notifications' => $user
                    ? \App\Models\AppNotification::with('sender:id,name,avatar_color')
                        ->where('user_id', $user->id)
                        ->latest()
                        ->take(15)
                        ->get()
                    : [],
                'unread_notifications_count' => $user
                    ? \App\Models\AppNotification::where('user_id', $user->id)
                        ->where('is_read', false)
                        ->count()
                    : 0,
            ],
            'active_tasks' => $user
                ? \App\Models\Task::select('id', 'title', 'status', 'priority', 'assigned_to', 'created_by')
                    ->whereIn('status', ['todo', 'in_progress', 'revisi'])
                    ->latest('updated_at')
                    ->take(8)
                    ->get()
                : [],
            'team_presence' => $user
                ? \App\Models\User::select('id', 'name', 'email', 'role', 'last_seen_at')
                    ->get()
                    ->map(fn ($u) => [
                        'id' => $u->id,
                        'name' => $u->name,
                        'email' => $u->email,
                        'role' => $u->role,
                        'is_active' => $u->is_active,
                        'last_seen_formatted' => $u->last_seen_formatted,
                        'photo_url' => $u->photo_url,
                    ])
                : [],
        ];
    }
}
