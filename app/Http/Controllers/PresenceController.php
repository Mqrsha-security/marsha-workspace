<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PresenceController extends Controller
{
    public function ping(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user && ($userId = $request->input('user_id') ?? $request->query('user_id'))) {
            $user = User::find($userId);
        }

        if ($user) {
            $user->updateQuietly(['last_seen_at' => now()]);
        }

        $users = User::select('id', 'name', 'email', 'role', 'last_seen_at')
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'is_active' => $u->is_active,
                'last_seen_formatted' => $u->last_seen_formatted,
                'photo_url' => $u->photo_url,
            ]);

        return response()->json([
            'status' => 'online',
            'users' => $users,
        ]);
    }

    public function offline(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user && ($userId = $request->input('user_id') ?? $request->query('user_id'))) {
            $user = User::find($userId);
        }

        if ($user) {
            $user->updateQuietly(['last_seen_at' => now()->subMinutes(5)]);
        }

        return response()->json([
            'status' => 'offline',
        ]);
    }

    public function users(): JsonResponse
    {
        $users = User::select('id', 'name', 'email', 'role', 'last_seen_at')
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'is_active' => $u->is_active,
                'last_seen_formatted' => $u->last_seen_formatted,
                'photo_url' => $u->photo_url,
            ]);

        return response()->json([
            'users' => $users,
        ]);
    }
}
