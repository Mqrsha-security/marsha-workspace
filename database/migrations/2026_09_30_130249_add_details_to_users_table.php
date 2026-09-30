<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('identifier')->nullable()->after('email'); // NIM atau NIP
            $table->string('role')->default('mahasiswa')->after('identifier'); // mahasiswa, dosen_pembimbing
            $table->string('avatar_color')->default('blue')->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['identifier', 'role', 'avatar_color']);
        });
    }
};
