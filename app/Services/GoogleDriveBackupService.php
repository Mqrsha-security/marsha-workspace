<?php

namespace App\Services;

use App\Models\Meeting;
use App\Models\MeetingNote;
use App\Models\Task;
use App\Models\User;
use App\Models\WorkspaceApp;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleDriveBackupService
{
    /**
     * Check if Google Service Account credentials are fully configured.
     */
    public function isConfigured(): bool
    {
        $json = config('services.google.service_account_json');
        if (!empty($json)) {
            $data = is_array($json) ? $json : json_decode($json, true);
            return !empty($data['client_email']) && !empty($data['private_key']);
        }

        $email = config('services.google.service_account_email');
        $key = config('services.google.private_key');

        return !empty($email) && !empty($key);
    }

    /**
     * Extract service account credentials.
     */
    protected function getCredentials(): array
    {
        $json = config('services.google.service_account_json');
        if (!empty($json)) {
            $data = is_array($json) ? $json : json_decode($json, true);
            if (!empty($data['client_email']) && !empty($data['private_key'])) {
                return [
                    'client_email' => $data['client_email'],
                    'private_key' => $data['private_key'],
                ];
            }
        }

        return [
            'client_email' => config('services.google.service_account_email'),
            'private_key' => str_replace('\n', "\n", (string) config('services.google.private_key')),
        ];
    }

    /**
     * Generate an OAuth2 Access Token using RS256 signed JWT (RFC 7523).
     */
    public function getAccessToken(): string
    {
        $creds = $this->getCredentials();
        $clientEmail = $creds['client_email'];
        $privateKey = $creds['private_key'];

        if (empty($clientEmail) || empty($privateKey)) {
            throw new \RuntimeException('Google Service Account credentials are not configured.');
        }

        $now = time();
        $jwtHeader = ['alg' => 'RS256', 'typ' => 'JWT'];
        $jwtPayload = [
            'iss' => $clientEmail,
            'scope' => 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/documents',
            'aud' => 'https://oauth2.googleapis.com/token',
            'exp' => $now + 3600,
            'iat' => $now,
        ];

        $encodedHeader = $this->base64UrlEncode(json_encode($jwtHeader));
        $encodedPayload = $this->base64UrlEncode(json_encode($jwtPayload));
        $signingInput = "{$encodedHeader}.{$encodedPayload}";

        $signature = '';
        $binaryKey = openssl_pkey_get_private($privateKey);
        if (!$binaryKey) {
            throw new \RuntimeException('Invalid Google Service Account private key.');
        }

        if (!openssl_sign($signingInput, $signature, $binaryKey, OPENSSL_ALGO_SHA256)) {
            throw new \RuntimeException('Failed to sign JWT with Google private key.');
        }

        $signedJwt = "{$signingInput}." . $this->base64UrlEncode($signature);

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $signedJwt,
        ]);

        if (!$response->successful()) {
            Log::error('Google OAuth token request failed', ['body' => $response->body()]);
            throw new \RuntimeException('Failed to obtain Google access token: ' . $response->body());
        }

        $data = $response->json();
        return $data['access_token'];
    }

    /**
     * Create a folder in Google Drive.
     */
    public function createFolder(string $accessToken, string $folderName, ?string $parentId = null): array
    {
        $metadata = [
            'name' => $folderName,
            'mimeType' => 'application/vnd.google-apps.folder',
        ];

        if ($parentId) {
            $metadata['parents'] = [$parentId];
        }

        $response = Http::withToken($accessToken)
            ->post('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', $metadata);

        if (!$response->successful()) {
            throw new \RuntimeException('Failed to create Google Drive folder: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Upload an HTML string and convert it into a native Google Docs document inside a folder.
     */
    public function uploadHtmlAsGoogleDoc(string $accessToken, string $folderId, string $title, string $htmlContent): array
    {
        $boundary = '-------MarshaWorkspaceBackupBoundary' . md5(uniqid());

        $metadata = json_encode([
            'name' => $title,
            'mimeType' => 'application/vnd.google-apps.document',
            'parents' => [$folderId],
        ]);

        $body = "--{$boundary}\r\n" .
            "Content-Type: application/json; charset=UTF-8\r\n\r\n" .
            $metadata . "\r\n" .
            "--{$boundary}\r\n" .
            "Content-Type: text/html; charset=UTF-8\r\n\r\n" .
            $htmlContent . "\r\n" .
            "--{$boundary}--";

        $response = Http::withToken($accessToken)
            ->withHeaders([
                'Content-Type' => "multipart/related; boundary={$boundary}",
                'Content-Length' => (string) strlen($body),
            ])
            ->send('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', [
                'body' => $body,
            ]);

        if (!$response->successful()) {
            Log::error('Failed to upload Google Doc', ['title' => $title, 'body' => $response->body()]);
            throw new \RuntimeException("Failed to upload Google Doc ({$title}): " . $response->body());
        }

        return $response->json();
    }

    /**
     * Share folder with a user email so it appears directly in their Google Drive.
     */
    public function shareFolder(string $accessToken, string $folderId, string $userEmail): bool
    {
        if (empty($userEmail)) {
            return false;
        }

        $response = Http::withToken($accessToken)
            ->post("https://www.googleapis.com/drive/v3/files/{$folderId}/permissions?sendNotificationEmail=false", [
                'role' => 'writer',
                'type' => 'user',
                'emailAddress' => $userEmail,
            ]);

        return $response->successful();
    }

    /**
     * Execute full workspace backup to Google Drive.
     */
    public function executeBackup(?string $shareEmail = null, ?string $userAccessToken = null): array
    {
        $accessToken = $userAccessToken ?: $this->getAccessToken();
        $parentFolderId = config('services.google.drive_folder_id');

        $timestamp = Carbon::now('Asia/Jakarta')->format('Y-m-d H:i');
        $folderName = "Marsha Security Backup - {$timestamp}";

        $folder = $this->createFolder($accessToken, $folderName, $parentFolderId ?: null);
        $folderId = $folder['id'];
        $folderUrl = $folder['webViewLink'] ?? "https://drive.google.com/drive/folders/{$folderId}";

        // Collect all data
        $users = User::select('id', 'name', 'email', 'role', 'identifier')->get();
        $tasks = Task::with(['creator:id,name', 'assignee:id,name'])->orderBy('id', 'desc')->get();
        $meetings = Meeting::with('creator:id,name')->orderBy('meeting_date', 'desc')->get();
        $notes = MeetingNote::with(['creator:id,name', 'meeting:id,title,meeting_date'])->orderBy('id', 'desc')->get();
        $apps = WorkspaceApp::with('creator:id,name')->orderBy('id', 'asc')->get();

        $docsCreated = [];

        // 1. Executive Summary & Manifest
        $summaryHtml = $this->buildSummaryHtml($timestamp, $users, $tasks, $meetings, $notes, $apps);
        $doc1 = $this->uploadHtmlAsGoogleDoc($accessToken, $folderId, '0. Workspace Executive Summary', $summaryHtml);
        $docsCreated[] = ['name' => '0. Workspace Executive Summary', 'id' => $doc1['id'], 'url' => $doc1['webViewLink'] ?? ''];

        // 2. Tasks & Workstreams
        $tasksHtml = $this->buildTasksHtml($timestamp, $tasks);
        $doc2 = $this->uploadHtmlAsGoogleDoc($accessToken, $folderId, '1. Tasks & Workstreams Master', $tasksHtml);
        $docsCreated[] = ['name' => '1. Tasks & Workstreams Master', 'id' => $doc2['id'], 'url' => $doc2['webViewLink'] ?? ''];

        // 3. Meetings & Agendas
        $meetingsHtml = $this->buildMeetingsHtml($timestamp, $meetings);
        $doc3 = $this->uploadHtmlAsGoogleDoc($accessToken, $folderId, '2. Meeting Agendas & Minutes', $meetingsHtml);
        $docsCreated[] = ['name' => '2. Meeting Agendas & Minutes', 'id' => $doc3['id'], 'url' => $doc3['webViewLink'] ?? ''];

        // 4. Meeting Notes & Key Takeaways
        $notesHtml = $this->buildNotesHtml($timestamp, $notes);
        $doc4 = $this->uploadHtmlAsGoogleDoc($accessToken, $folderId, '3. Meeting Notes & Action Items', $notesHtml);
        $docsCreated[] = ['name' => '3. Meeting Notes & Action Items', 'id' => $doc4['id'], 'url' => $doc4['webViewLink'] ?? ''];

        // 5. Workspace Apps & Tools
        $appsHtml = $this->buildAppsHtml($timestamp, $apps);
        $doc5 = $this->uploadHtmlAsGoogleDoc($accessToken, $folderId, '4. Workspace Tools & Directory', $appsHtml);
        $docsCreated[] = ['name' => '4. Workspace Tools & Directory', 'id' => $doc5['id'], 'url' => $doc5['webViewLink'] ?? ''];

        // Share folder if email provided or default team emails
        $emailsToShare = array_filter(array_unique([
            $shareEmail,
            config('services.google.share_email'),
            'adit.rwet@gmail.com',
        ]));

        foreach ($emailsToShare as $email) {
            $this->shareFolder($accessToken, $folderId, $email);
        }

        return [
            'success' => true,
            'folder_id' => $folderId,
            'folder_name' => $folderName,
            'folder_url' => $folderUrl,
            'docs' => $docsCreated,
            'counts' => [
                'tasks' => $tasks->count(),
                'meetings' => $meetings->count(),
                'notes' => $notes->count(),
                'apps' => $apps->count(),
                'users' => $users->count(),
            ],
            'timestamp' => $timestamp,
        ];
    }

    /**
     * Base64Url encoding helper.
     */
    protected function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Stylesheet for converted Google Docs.
     */
    protected function getBaseCss(): string
    {
        return '
            body { font-family: "Arial", sans-serif; color: #1e293b; line-height: 1.6; margin: 30px; }
            h1 { color: #0f172a; font-size: 24pt; border-bottom: 2pt solid #0284c7; padding-bottom: 6pt; margin-bottom: 12pt; }
            h2 { color: #0369a1; font-size: 16pt; margin-top: 20pt; margin-bottom: 8pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 4pt; }
            h3 { color: #334155; font-size: 12pt; margin-top: 12pt; margin-bottom: 4pt; }
            table { width: 100%; border-collapse: collapse; margin-top: 10pt; margin-bottom: 15pt; }
            th { background-color: #f1f5f9; color: #0f172a; text-align: left; padding: 8pt; border: 1px solid #cbd5e1; font-weight: bold; }
            td { padding: 8pt; border: 1px solid #cbd5e1; vertical-align: top; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .badge { display: inline-block; padding: 2pt 6pt; border-radius: 4pt; font-size: 9pt; font-weight: bold; }
            .badge-done { background-color: #dcfce7; color: #166534; }
            .badge-progress { background-color: #e0f2fe; color: #075985; }
            .badge-todo { background-color: #f1f5f9; color: #475569; }
            .badge-revisi { background-color: #fef3c7; color: #92400e; }
            .badge-urgent { background-color: #fee2e2; color: #991b1b; }
            .badge-high { background-color: #ffedd5; color: #9a3412; }
            .meta { color: #64748b; font-size: 10pt; margin-bottom: 15pt; }
            ul { margin-top: 4pt; margin-bottom: 6pt; padding-left: 20pt; }
            li { margin-bottom: 3pt; }
            .card { border: 1px solid #e2e8f0; border-radius: 6pt; padding: 12pt; margin-bottom: 14pt; background-color: #ffffff; }
        ';
    }

    /**
     * Build HTML for Executive Summary Document.
     */
    protected function buildSummaryHtml(string $time, $users, $tasks, $meetings, $notes, $apps): string
    {
        $userRows = '';
        foreach ($users as $u) {
            $userRows .= "<tr><td><strong>{$u->name}</strong></td><td>{$u->email}</td><td>{$u->role}</td><td>{$u->identifier}</td></tr>";
        }

        $doneCount = $tasks->where('status', 'done')->count();
        $inProgressCount = $tasks->where('status', 'in_progress')->count();
        $todoCount = $tasks->where('status', 'todo')->count();
        $revisiCount = $tasks->where('status', 'revisi')->count();

        return "<!DOCTYPE html><html><head><meta charset='UTF-8'><style>{$this->getBaseCss()}</style></head><body>
            <h1>Marsha Security Workspace — Executive Summary</h1>
            <p class='meta'>Generated on: {$time} WIB | Platform: marsha-workspace</p>
            
            <h2>1. Workspace Metrics Snapshot</h2>
            <table>
                <tr><th>Category</th><th>Total Records</th><th>Key Breakdown</th></tr>
                <tr><td><strong>Tasks & Workstreams</strong></td><td>{$tasks->count()}</td><td>Done: {$doneCount} | In Progress: {$inProgressCount} | Revisi: {$revisiCount} | Todo: {$todoCount}</td></tr>
                <tr><td><strong>Meetings & Sessions</strong></td><td>{$meetings->count()}</td><td>Scheduled, Ongoing & Completed Agendas</td></tr>
                <tr><td><strong>Meeting Notes</strong></td><td>{$notes->count()}</td><td>Documented Decisions & Action Items</td></tr>
                <tr><td><strong>Workspace Apps</strong></td><td>{$apps->count()}</td><td>Integrated Tools & Research Platforms</td></tr>
            </table>

            <h2>2. Project Team Members</h2>
            <table>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Identifier / NIM</th></tr>
                {$userRows}
            </table>

            <h2>3. Backup Architecture & Structure</h2>
            <p>This automated backup archive was generated directly into Google Drive with dedicated Google Docs for each module:</p>
            <ul>
                <li><strong>1. Tasks & Workstreams Master:</strong> Complete sprint records, sub-descriptions, tabs, and deadlines.</li>
                <li><strong>2. Meeting Agendas & Minutes:</strong> Meeting records, discussion points, attendees, locations, and references.</li>
                <li><strong>3. Meeting Notes & Action Items:</strong> Notes referencing specific meeting sessions with key takeaways and actions.</li>
                <li><strong>4. Workspace Tools & Directory:</strong> Cataloged apps, documentation, links, and design references.</li>
            </ul>
        </body></html>";
    }

    /**
     * Build HTML for Tasks Document.
     */
    protected function buildTasksHtml(string $time, $tasks): string
    {
        $rows = '';
        foreach ($tasks as $task) {
            $statusClass = 'badge-todo';
            if ($task->status === 'done') $statusClass = 'badge-done';
            elseif ($task->status === 'in_progress') $statusClass = 'badge-progress';
            elseif ($task->status === 'revisi') $statusClass = 'badge-revisi';

            $priorityClass = 'badge-todo';
            if ($task->priority === 'urgent') $priorityClass = 'badge-urgent';
            elseif ($task->priority === 'high') $priorityClass = 'badge-high';

            $assigneeName = $task->assignee ? $task->assignee->name : 'Unassigned';
            $dueDate = $task->due_at ? Carbon::parse($task->due_at)->format('Y-m-d H:i') : '-';

            $descDetails = '';
            if (!empty($task->description)) {
                $descDetails .= "<p>" . nl2br(e($task->description)) . "</p>";
            }

            if (!empty($task->descriptions) && is_array($task->descriptions)) {
                $descDetails .= "<ul>";
                foreach ($task->descriptions as $item) {
                    $descDetails .= "<li>" . e(is_array($item) ? ($item['text'] ?? json_encode($item)) : $item) . "</li>";
                }
                $descDetails .= "</ul>";
            }

            if (!empty($task->revision_notes)) {
                $descDetails .= "<p style='color:#92400e; background-color:#fef3c7; padding:4pt; border-radius:4pt;'><strong>Revision Notes:</strong> " . e($task->revision_notes) . "</p>";
            }

            $rows .= "<tr>
                <td><strong>#{$task->id}</strong></td>
                <td><strong>" . e($task->title) . "</strong><br><small style='color:#64748b;'>Category: " . e($task->category ?? 'General') . "</small><br>{$descDetails}</td>
                <td><span class='badge {$statusClass}'>" . strtoupper($task->status) . "</span></td>
                <td><span class='badge {$priorityClass}'>" . strtoupper($task->priority) . "</span></td>
                <td>" . e($assigneeName) . "</td>
                <td>{$dueDate}</td>
            </tr>";
        }

        return "<!DOCTYPE html><html><head><meta charset='UTF-8'><style>{$this->getBaseCss()}</style></head><body>
            <h1>Tasks & Workstreams Master Document</h1>
            <p class='meta'>Archive Date: {$time} WIB | Total Tasks: {$tasks->count()}</p>
            <table>
                <tr>
                    <th style='width:5%;'>ID</th>
                    <th style='width:45%;'>Task Title & Details</th>
                    <th style='width:12%;'>Status</th>
                    <th style='width:10%;'>Priority</th>
                    <th style='width:13%;'>Assignee</th>
                    <th style='width:15%;'>Deadline</th>
                </tr>
                {$rows}
            </table>
        </body></html>";
    }

    /**
     * Build HTML for Meetings Document.
     */
    protected function buildMeetingsHtml(string $time, $meetings): string
    {
        $cards = '';
        foreach ($meetings as $m) {
            $date = $m->meeting_date ? Carbon::parse($m->meeting_date)->format('l, d F Y') : '-';
            $timeRange = ($m->start_time ?: '-') . ' - ' . ($m->end_time ?: '-');

            $attendeesList = '';
            if (!empty($m->attendees) && is_array($m->attendees)) {
                $attendeesList = implode(', ', array_map('e', $m->attendees));
            }

            $pointsList = '';
            if (!empty($m->points) && is_array($m->points)) {
                $pointsList .= "<ul>";
                foreach ($m->points as $pt) {
                    $pointsList .= "<li>" . e(is_array($pt) ? ($pt['text'] ?? json_encode($pt)) : $pt) . "</li>";
                }
                $pointsList .= "</ul>";
            }

            $actionList = '';
            if (!empty($m->action_items) && is_array($m->action_items)) {
                $actionList .= "<ul>";
                foreach ($m->action_items as $act) {
                    $actionList .= "<li>" . e(is_array($act) ? ($act['task'] ?? json_encode($act)) : $act) . "</li>";
                }
                $actionList .= "</ul>";
            }

            $linksList = '';
            if (!empty($m->reference_links) && is_array($m->reference_links)) {
                $linksList .= "<ul>";
                foreach ($m->reference_links as $lnk) {
                    $title = $lnk['title'] ?? 'Reference';
                    $url = $lnk['url'] ?? '#';
                    $linksList .= "<li><a href='" . e($url) . "'>" . e($title) . "</a> (" . e($url) . ")</li>";
                }
                $linksList .= "</ul>";
            }

            $cards .= "<div class='card'>
                <h2 style='margin-top:0;'>" . e($m->title) . "</h2>
                <p class='meta'>
                    <strong>Date:</strong> {$date} | <strong>Time:</strong> {$timeRange} | 
                    <strong>Location:</strong> " . e($m->location ?? 'Online / Workspace') . " | 
                    <strong>Category:</strong> " . e($m->category ?? 'General') . " | 
                    <strong>Status:</strong> " . strtoupper($m->status ?? 'scheduled') . "
                </p>
                <p><strong>Attendees:</strong> " . ($attendeesList ?: 'Team') . "</p>
                " . ($pointsList ? "<h3>Discussion Points:</h3>{$pointsList}" : "") . "
                " . ($actionList ? "<h3>Action Items:</h3>{$actionList}" : "") . "
                " . ($linksList ? "<h3>References & Links:</h3>{$linksList}" : "") . "
                " . (!empty($m->notes) ? "<h3>Session Notes:</h3><p>" . nl2br(e($m->notes)) . "</p>" : "") . "
            </div>";
        }

        return "<!DOCTYPE html><html><head><meta charset='UTF-8'><style>{$this->getBaseCss()}</style></head><body>
            <h1>Meeting Agendas & Minutes Master Document</h1>
            <p class='meta'>Archive Date: {$time} WIB | Total Meetings: {$meetings->count()}</p>
            {$cards}
        </body></html>";
    }

    /**
     * Build HTML for Meeting Notes Document.
     */
    protected function buildNotesHtml(string $time, $notes): string
    {
        $cards = '';
        foreach ($notes as $note) {
            $meetingRef = $note->meeting ? ($note->meeting->title . ' (' . $note->meeting->meeting_date . ')') : 'General Note (No Linked Meeting)';

            $takeaways = '';
            if (!empty($note->key_takeaways) && is_array($note->key_takeaways)) {
                $takeaways .= "<ul>";
                foreach ($note->key_takeaways as $kt) {
                    $takeaways .= "<li>" . e(is_array($kt) ? ($kt['text'] ?? json_encode($kt)) : $kt) . "</li>";
                }
                $takeaways .= "</ul>";
            }

            $actions = '';
            if (!empty($note->action_items) && is_array($note->action_items)) {
                $actions .= "<ul>";
                foreach ($note->action_items as $ai) {
                    $actions .= "<li>" . e(is_array($ai) ? ($ai['task'] ?? json_encode($ai)) : $ai) . "</li>";
                }
                $actions .= "</ul>";
            }

            $cards .= "<div class='card'>
                <h2 style='margin-top:0;'>" . e($note->title) . "</h2>
                <p class='meta'>
                    <strong>Referenced Meeting:</strong> " . e($meetingRef) . " | 
                    <strong>Author:</strong> " . e($note->creator->name ?? 'Team Member') . " | 
                    <strong>Recorded At:</strong> " . $note->created_at->format('Y-m-d H:i') . "
                </p>
                <h3>Content & Detailed Discussion:</h3>
                <p>" . nl2br(e($note->content)) . "</p>
                " . ($takeaways ? "<h3>Key Takeaways & Conclusions:</h3>{$takeaways}" : "") . "
                " . ($actions ? "<h3>Immediate Action Items:</h3>{$actions}" : "") . "
            </div>";
        }

        return "<!DOCTYPE html><html><head><meta charset='UTF-8'><style>{$this->getBaseCss()}</style></head><body>
            <h1>Meeting Notes & Decisions Master Document</h1>
            <p class='meta'>Archive Date: {$time} WIB | Total Notes: {$notes->count()}</p>
            {$cards}
        </body></html>";
    }

    /**
     * Build HTML for Workspace Apps Document.
     */
    protected function buildAppsHtml(string $time, $apps): string
    {
        $rows = '';
        foreach ($apps as $app) {
            $linksList = '';
            if (!empty($app->links) && is_array($app->links)) {
                $linksList .= "<ul>";
                foreach ($app->links as $lnk) {
                    $linksList .= "<li><a href='" . e($lnk['url'] ?? '#') . "'>" . e($lnk['title'] ?? 'Link') . "</a></li>";
                }
                $linksList .= "</ul>";
            }

            $rows .= "<tr>
                <td><strong>" . e($app->title) . "</strong><br><small style='color:#64748b;'>" . e($app->app_name) . "</small></td>
                <td><span class='badge badge-progress'>" . e($app->category) . "</span></td>
                <td>" . nl2br(e($app->description ?? '-')) . "</td>
                <td>{$linksList}</td>
            </tr>";
        }

        return "<!DOCTYPE html><html><head><meta charset='UTF-8'><style>{$this->getBaseCss()}</style></head><body>
            <h1>Workspace Applications & Tools Directory</h1>
            <p class='meta'>Archive Date: {$time} WIB | Total Apps: {$apps->count()}</p>
            <table>
                <tr>
                    <th style='width:25%;'>Application</th>
                    <th style='width:15%;'>Category</th>
                    <th style='width:35%;'>Description</th>
                    <th style='width:25%;'>Resource Links</th>
                </tr>
                {$rows}
            </table>
        </body></html>";
    }
}
