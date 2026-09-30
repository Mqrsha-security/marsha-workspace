<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check() ? redirect()->route('tasks.index') : redirect()->route('login');
});

Route::get('/debug-db', function () {
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $users = \Illuminate\Support\Facades\DB::table('users')->select('id', 'name', 'email', 'role')->get();
        return response()->json([
            'status' => 'connected',
            'driver' => \Illuminate\Support\Facades\DB::connection()->getDriverName(),
            'users' => $users,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'class' => get_class($e),
            'line' => $e->getLine(),
            'file' => $e->getFile(),
        ], 500);
    }
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return redirect()->route('tasks.index');
    })->name('dashboard');

    Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::put('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.status');
    Route::patch('/tasks/{task}/assign', [TaskController::class, 'reassign'])->name('tasks.assign');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::post('/tasks/{task}/comments', [TaskController::class, 'addComment'])->name('tasks.comments');

    Route::post('/notifications/{notification}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.readAll');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
