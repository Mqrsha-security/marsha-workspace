<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workspace_apps', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('app_name');
            $table->string('category')->default('General');
            $table->text('description')->nullable();
            $table->json('links')->nullable();
            $table->string('icon_key')->default('link');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workspace_apps');
    }
};
