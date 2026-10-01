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
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'notifications' => $request->user()
                    ? \App\Models\AppNotification::with('sender:id,name,avatar_color')
                        ->where('user_id', $request->user()->id)
                        ->latest()
                        ->take(15)
                        ->get()
                    : [],
                'unread_notifications_count' => $request->user()
                    ? \App\Models\AppNotification::where('user_id', $request->user()->id)
                        ->where('is_read', false)
                        ->count()
                    : 0,
            ],
            'active_tasks' => $request->user()
                ? \App\Models\Task::select('id', 'title', 'status', 'priority', 'assigned_to', 'created_by')
                    ->whereIn('status', ['todo', 'in_progress', 'revisi'])
                    ->latest('updated_at')
                    ->take(8)
                    ->get()
                : [],
        ];
    }
}
