<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meetings', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category')->default('Bimbingan Skripsi');
            $table->date('meeting_date');
            $table->string('start_time', 10)->nullable();
            $table->string('end_time', 10)->nullable();
            $table->string('location');
            $table->string('status', 50)->default('scheduled');
            $table->json('attendees')->nullable();
            $table->json('points')->nullable();
            $table->json('action_items')->nullable();
            $table->json('reference_links')->nullable();
            $table->json('images')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meetings');
    }
};
