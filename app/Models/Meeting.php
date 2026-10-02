<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Meeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'category',
        'meeting_date',
        'start_time',
        'end_time',
        'location',
        'status',
        'attendees',
        'points',
        'action_items',
        'reference_links',
        'images',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'meeting_date' => 'date',
        'attendees' => 'array',
        'points' => 'array',
        'action_items' => 'array',
        'reference_links' => 'array',
        'images' => 'array',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
