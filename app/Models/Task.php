<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'descriptions',
        'link',
        'links',
        'tabs',
        'category',
        'status',
        'priority',
        'created_by',
        'assigned_to',
        'due_at',
        'completed_at',
        'revision_notes',
    ];

    protected $appends = [
        'descriptions_list',
        'links_list',
        'tabs_list',
    ];

    protected function casts(): array
    {
        return [
            'descriptions' => 'array',
            'links' => 'array',
            'tabs' => 'array',
            'due_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function getTabsListAttribute(): array
    {
        if (!empty($this->tabs) && is_array($this->tabs)) {
            return array_values($this->tabs);
        }

        $items = $this->descriptions_list;
        $links = $this->links_list;

        if (!empty($items) || !empty($links)) {
            return [
                [
                    'id' => 'tab-1',
                    'name' => 'General',
                    'items' => $items,
                    'links' => $links,
                ]
            ];
        }

        return [
            [
                'id' => 'tab-1',
                'name' => 'UI/UX',
                'items' => [],
                'links' => [],
            ]
        ];
    }

    public function getDescriptionsListAttribute(): array
    {
        if (!empty($this->tabs) && is_array($this->tabs)) {
            $all = [];
            foreach ($this->tabs as $tab) {
                if (!empty($tab['items']) && is_array($tab['items'])) {
                    foreach ($tab['items'] as $item) {
                        $trimmed = trim((string) $item);
                        if ($trimmed !== '') {
                            $all[] = $trimmed;
                        }
                    }
                }
            }
            if (!empty($all)) {
                return $all;
            }
        }

        if (!empty($this->descriptions) && is_array($this->descriptions)) {
            return array_values(array_filter(array_map('trim', $this->descriptions)));
        }
        return !empty($this->description) ? [trim($this->description)] : [];
    }

    public function getLinksListAttribute(): array
    {
        if (!empty($this->tabs) && is_array($this->tabs)) {
            $all = [];
            foreach ($this->tabs as $tab) {
                if (!empty($tab['links']) && is_array($tab['links'])) {
                    foreach ($tab['links'] as $link) {
                        $trimmed = trim((string) $link);
                        if ($trimmed !== '') {
                            $all[] = $trimmed;
                        }
                    }
                }
            }
            if (!empty($all)) {
                return $all;
            }
        }

        if (!empty($this->links) && is_array($this->links)) {
            return array_values(array_filter(array_map('trim', $this->links)));
        }
        return !empty($this->link) ? [trim($this->link)] : [];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class)->latest();
    }
}
