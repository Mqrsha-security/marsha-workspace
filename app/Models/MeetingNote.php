<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeetingNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'meeting_id',
        'title',
        'content',
        'key_takeaways',
        'action_items',
        'created_by',
    ];

    protected $casts = [
        'key_takeaways' => 'array',
        'action_items' => 'array',
    ];

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class, 'meeting_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
