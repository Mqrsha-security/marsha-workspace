<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check() ? redirect()->route('tasks.index') : redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return redirect()->route('tasks.index');
    })->name('dashboard');

    Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::get('/tasks/assigned', [TaskController::class, 'assigned'])->name('tasks.assigned');
    Route::get('/tasks/created', [TaskController::class, 'created'])->name('tasks.created');
    Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::put('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.status');
    Route::patch('/tasks/{task}/assign', [TaskController::class, 'reassign'])->name('tasks.assign');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::post('/tasks/{task}/comments', [TaskController::class, 'addComment'])->name('tasks.comments');

    Route::post('/notifications/{notification}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.readAll');

    Route::get('/teams', [\App\Http\Controllers\TeamController::class, 'index'])->name('teams.index');
    Route::get('/applications', [\App\Http\Controllers\WorkspaceAppController::class, 'index'])->name('applications.index');
    Route::post('/applications', [\App\Http\Controllers\WorkspaceAppController::class, 'store'])->name('applications.store');
    Route::put('/applications/{application}', [\App\Http\Controllers\WorkspaceAppController::class, 'update'])->name('applications.update');
    Route::delete('/applications/{application}', [\App\Http\Controllers\WorkspaceAppController::class, 'destroy'])->name('applications.destroy');

    Route::post('/presence/ping', [\App\Http\Controllers\PresenceController::class, 'ping'])->name('presence.ping');
    Route::post('/presence/offline', [\App\Http\Controllers\PresenceController::class, 'offline'])->name('presence.offline');
    Route::get('/presence/users', [\App\Http\Controllers\PresenceController::class, 'users'])->name('presence.users');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
