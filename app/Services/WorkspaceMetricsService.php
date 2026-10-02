<?php

namespace App\Services;

use App\Models\Meeting;
use App\Models\MeetingNote;
use App\Models\Task;
use App\Models\WorkspaceApp;
use Illuminate\Support\Facades\Cache;

class WorkspaceMetricsService
{
    /**
     * Get aggregate sidebar counters with unified single-query task aggregation and short-lived caching.
     *
     * @param int|null $userId
     * @return array<string, int>
     */
    public static function getCounts(?int $userId = null): array
    {
        $cacheKey = 'ws_metrics_' . ($userId ?? 'guest');

        try {
            return Cache::remember($cacheKey, 6, function () use ($userId) {
                return self::queryCounts($userId);
            });
        } catch (\Throwable) {
            return self::queryCounts($userId);
        }
    }

    /**
     * Direct query computation with full fallback resilience.
     *
     * @param int|null $userId
     * @return array<string, int>
     */
    public static function queryCounts(?int $userId = null): array
    {
        try {
            $taskAgg = Task::query()
                ->selectRaw("
                    COUNT(*) as total,
                    SUM(CASE WHEN assigned_to = ? THEN 1 ELSE 0 END) as my_tasks,
                    SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
                    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN status = 'revisi' THEN 1 ELSE 0 END) as revisi,
                    SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done,
                    SUM(CASE WHEN priority = 'urgent' AND status != 'done' THEN 1 ELSE 0 END) as urgent
                ", [$userId ?? 0])
                ->first();

            return [
                'total' => (int) ($taskAgg->total ?? 0),
                'my_tasks' => (int) ($taskAgg->my_tasks ?? 0),
                'todo' => (int) ($taskAgg->todo ?? 0),
                'in_progress' => (int) ($taskAgg->in_progress ?? 0),
                'revisi' => (int) ($taskAgg->revisi ?? 0),
                'done' => (int) ($taskAgg->done ?? 0),
                'urgent' => (int) ($taskAgg->urgent ?? 0),
                'apps_count' => (int) rescue(fn () => WorkspaceApp::count(), fn () => 0),
                'meetings_count' => (int) rescue(fn () => Meeting::count(), fn () => 0),
                'notes_count' => (int) rescue(fn () => MeetingNote::count(), fn () => 0),
                'scheduled_meetings' => (int) rescue(fn () => Meeting::where('status', 'scheduled')->count(), fn () => 0),
                'completed_meetings' => (int) rescue(fn () => Meeting::where('status', 'completed')->count(), fn () => 0),
            ];
        } catch (\Throwable) {
            return [
                'total' => (int) rescue(fn () => Task::count(), fn () => 0),
                'my_tasks' => (int) rescue(fn () => Task::where('assigned_to', $userId)->count(), fn () => 0),
                'todo' => (int) rescue(fn () => Task::where('status', 'todo')->count(), fn () => 0),
                'in_progress' => (int) rescue(fn () => Task::where('status', 'in_progress')->count(), fn () => 0),
                'revisi' => (int) rescue(fn () => Task::where('status', 'revisi')->count(), fn () => 0),
                'done' => (int) rescue(fn () => Task::where('status', 'done')->count(), fn () => 0),
                'urgent' => (int) rescue(fn () => Task::where('priority', 'urgent')->where('status', '!=', 'done')->count(), fn () => 0),
                'apps_count' => (int) rescue(fn () => WorkspaceApp::count(), fn () => 0),
                'meetings_count' => (int) rescue(fn () => Meeting::count(), fn () => 0),
                'notes_count' => (int) rescue(fn () => MeetingNote::count(), fn () => 0),
                'scheduled_meetings' => (int) rescue(fn () => Meeting::where('status', 'scheduled')->count(), fn () => 0),
                'completed_meetings' => (int) rescue(fn () => Meeting::where('status', 'completed')->count(), fn () => 0),
            ];
        }
    }

    /**
     * Clear metrics cache after mutations.
     */
    public static function clear(?int $userId = null): void
    {
        try {
            if ($userId) {
                Cache::forget('ws_metrics_' . $userId);
            }
            Cache::forget('ws_metrics_guest');
        } catch (\Throwable) {
        }
    }
}
