<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check() ? redirect()->route('tasks.index') : redirect()->route('login');
});

Route::get('/debug-db', function () {
    $results = [];
    $host = env('DB_HOST');
    $user = env('DB_USERNAME', 'neondb_owner');
    $pass = env('DB_PASSWORD', 'npg_IUM4wa6SLfJF');
    $endpoint = explode('.', $host)[0] ?? 'ep-rapid-hat-b4bz5jm0-pooler';
    $endpointShort = str_replace('-pooler', '', $endpoint);

    $attempts = [
        'strategy_1_dbname_options_full' => "pgsql:host={$host};port=5432;dbname='neondb options=endpoint={$endpoint}';sslmode=require",
        'strategy_2_dbname_options_short' => "pgsql:host={$host};port=5432;dbname='neondb options=endpoint={$endpointShort}';sslmode=require",
        'strategy_3_raw_options_full' => "pgsql:host={$host};port=5432;dbname=neondb;options='endpoint={$endpoint}';sslmode=require",
        'strategy_4_raw_options_short' => "pgsql:host={$host};port=5432;dbname=neondb;options='endpoint={$endpointShort}';sslmode=require",
    ];

    foreach ($attempts as $name => $dsn) {
        try {
            $pdo = new \PDO($dsn, $user, $pass, [
                \PDO::ATTR_TIMEOUT => 5,
                \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
            ]);
            $stmt = $pdo->query('SELECT current_user, current_database()');
            $results[$name] = ['status' => 'SUCCESS', 'data' => $stmt->fetch(\PDO::FETCH_ASSOC)];
        } catch (\Throwable $e) {
            $results[$name] = ['status' => 'FAILED', 'error' => $e->getMessage()];
        }
    }

    return response()->json($results);
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
