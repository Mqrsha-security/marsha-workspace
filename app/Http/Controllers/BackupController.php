<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\MeetingNote;
use App\Models\Task;
use App\Models\User;
use App\Models\WorkspaceApp;
use App\Services\GoogleDriveBackupService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use ZipArchive;

class BackupController extends Controller
{
    /**
     * Get backup status and data counts.
     */
    public function status(GoogleDriveBackupService $service): JsonResponse
    {
        return response()->json([
            'configured' => $service->isConfigured(),
            'counts' => [
                'tasks' => Task::count(),
                'meetings' => Meeting::count(),
                'notes' => MeetingNote::count(),
                'apps' => WorkspaceApp::count(),
                'users' => User::count(),
            ],
            'default_share_email' => config('services.google.share_email', 'adit.rwet@gmail.com'),
        ]);
    }

    /**
     * Trigger automated backup to Google Drive & Google Docs.
     */
    public function execute(Request $request, GoogleDriveBackupService $service): JsonResponse
    {
        if (!$service->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Google Service Account credentials are not yet configured in environment variables (GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY).',
                'needs_config' => true,
            ], 422);
        }

        try {
            $shareEmail = $request->input('share_email') ?: auth()->user()->email;
            $result = $service->executeBackup($shareEmail);

            return response()->json($result);
        } catch (\Throwable $e) {
            Log::error('Backup to Google Drive failed', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Backup failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download backup package directly as a ZIP archive (Google Docs compatible HTML files + JSON).
     */
    public function download(): BinaryFileResponse|JsonResponse
    {
        $timestamp = Carbon::now('Asia/Jakarta')->format('Y-m-d_His');
        $zipFileName = "marsha_workspace_backup_{$timestamp}.zip";
        $tempDir = storage_path('app/temp_backup');

        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $zipPath = "{$tempDir}/{$zipFileName}";
        $zip = new ZipArchive();

        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return response()->json(['message' => 'Unable to create zip file.'], 500);
        }

        $users = User::select('id', 'name', 'email', 'role', 'identifier')->get();
        $tasks = Task::with(['creator:id,name', 'assignee:id,name'])->get();
        $meetings = Meeting::with('creator:id,name')->get();
        $notes = MeetingNote::with(['creator:id,name', 'meeting:id,title,meeting_date'])->get();
        $apps = WorkspaceApp::with('creator:id,name')->get();

        // Add raw JSON exports
        $zip->addFromString('data/tasks.json', json_encode($tasks, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $zip->addFromString('data/meetings.json', json_encode($meetings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $zip->addFromString('data/meeting_notes.json', json_encode($notes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $zip->addFromString('data/workspace_apps.json', json_encode($apps, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $zip->addFromString('data/team_users.json', json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        // Use GoogleDriveBackupService helper methods to build docs HTML
        $service = app(GoogleDriveBackupService::class);
        $reflection = new \ReflectionClass($service);

        $buildSummary = $reflection->getMethod('buildSummaryHtml');
        $buildSummary->setAccessible(true);
        $zip->addFromString('docs/0_Workspace_Summary.html', $buildSummary->invoke($service, $timestamp, $users, $tasks, $meetings, $notes, $apps));

        $buildTasks = $reflection->getMethod('buildTasksHtml');
        $buildTasks->setAccessible(true);
        $zip->addFromString('docs/1_Tasks_and_Workstreams.html', $buildTasks->invoke($service, $timestamp, $tasks));

        $buildMeetings = $reflection->getMethod('buildMeetingsHtml');
        $buildMeetings->setAccessible(true);
        $zip->addFromString('docs/2_Meeting_Agendas_and_Minutes.html', $buildMeetings->invoke($service, $timestamp, $meetings));

        $buildNotes = $reflection->getMethod('buildNotesHtml');
        $buildNotes->setAccessible(true);
        $zip->addFromString('docs/3_Meeting_Notes_and_Decisions.html', $buildNotes->invoke($service, $timestamp, $notes));

        $buildApps = $reflection->getMethod('buildAppsHtml');
        $buildApps->setAccessible(true);
        $zip->addFromString('docs/4_Workspace_Tools_Directory.html', $buildApps->invoke($service, $timestamp, $apps));

        $zip->close();

        return response()->download($zipPath, $zipFileName)->deleteFileAfterSend(true);
    }
}
