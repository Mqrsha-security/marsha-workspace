<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'identifier', 'role', 'avatar_color', 'last_seen_at'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $appends = ['photo_url', 'is_active', 'last_seen_formatted'];

    public function getPhotoUrlAttribute(): ?string
    {
        if (str_contains($this->email, 'adit')) {
            return '/images/team/aditya.jpg';
        }
        if (str_contains($this->email, 'risti')) {
            return '/images/team/fahristi.jpg';
        }
        return null;
    }

    public function getIsActiveAttribute(): bool
    {
        if (!$this->last_seen_at) {
            return false;
        }
        return $this->last_seen_at->greaterThanOrEqualTo(now()->subSeconds(25));
    }

    public function getLastSeenFormattedAttribute(): string
    {
        if (!$this->last_seen_at) {
            return 'Offline';
        }
        if ($this->is_active) {
            return 'Online now';
        }
        return $this->last_seen_at->diffForHumans();
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_seen_at' => 'datetime',
        ];
    }

    public function assignedTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function createdTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'created_by');
    }
}
