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
            try {
                $user->updateQuietly(['last_seen_at' => now()]);
            } catch (\Throwable) {
                // Silently skip if column is missing or DB temporarily unavailable
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'notifications' => $user
                    ? rescue(fn () => \App\Models\AppNotification::with('sender:id,name,avatar_color')
                        ->where('user_id', $user->id)
                        ->latest()
                        ->take(15)
                        ->get(), fn () => [])
                    : [],
                'unread_notifications_count' => $user
                    ? rescue(fn () => \App\Models\AppNotification::where('user_id', $user->id)
                        ->where('is_read', false)
                        ->count(), fn () => 0)
                    : 0,
            ],
            'active_tasks' => $user
                ? rescue(fn () => \App\Models\Task::select('id', 'title', 'status', 'priority', 'assigned_to', 'created_by')
                    ->whereIn('status', ['todo', 'in_progress', 'revisi'])
                    ->latest('updated_at')
                    ->take(8)
                    ->get(), fn () => [])
                : [],
            'team_presence' => $user
                ? rescue(fn () => \App\Models\User::select('id', 'name', 'email', 'role', 'last_seen_at')
                    ->get()
                    ->map(fn ($u) => [
                        'id' => $u->id,
                        'name' => $u->name,
                        'email' => $u->email,
                        'role' => $u->role,
                        'is_active' => $u->is_active,
                        'last_seen_formatted' => $u->last_seen_formatted,
                        'photo_url' => $u->photo_url,
                    ]), fn () => [])
                : [],
        ];
    }
}
