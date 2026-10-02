<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->index(['status', 'priority'], 'tasks_status_priority_idx');
            $table->index(['assigned_to', 'status'], 'tasks_assigned_to_status_idx');
            $table->index('due_at', 'tasks_due_at_idx');
        });

        Schema::table('meetings', function (Blueprint $table) {
            $table->index(['status', 'meeting_date'], 'meetings_status_date_idx');
            $table->index('category', 'meetings_category_idx');
        });

        Schema::table('meeting_notes', function (Blueprint $table) {
            $table->index('meeting_id', 'meeting_notes_meeting_id_idx');
        });

        Schema::table('app_notifications', function (Blueprint $table) {
            $table->index(['user_id', 'is_read'], 'app_notifs_user_read_idx');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('last_seen_at', 'users_last_seen_at_idx');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex('tasks_status_priority_idx');
            $table->dropIndex('tasks_assigned_to_status_idx');
            $table->dropIndex('tasks_due_at_idx');
        });

        Schema::table('meetings', function (Blueprint $table) {
            $table->dropIndex('meetings_status_date_idx');
            $table->dropIndex('meetings_category_idx');
        });

        Schema::table('meeting_notes', function (Blueprint $table) {
            $table->dropIndex('meeting_notes_meeting_id_idx');
        });

        Schema::table('app_notifications', function (Blueprint $table) {
            $table->dropIndex('app_notifs_user_read_idx');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_last_seen_at_idx');
        });
    }
};
