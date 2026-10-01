<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkspaceApp extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'app_name',
        'category',
        'description',
        'links',
        'icon_key',
        'created_by',
    ];

    protected $casts = [
        'links' => 'array',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
