import { useState, useMemo, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    FileText,
    CalendarDays,
    Clock,
    MapPin,
    Plus,
    Search,
    Trash2,
    Edit2,
    ExternalLink,
    CheckCircle2,
    Circle,
    Copy,
    Check,
    X,
    Users,
    ListChecks,
    BookOpen,
    Eye,
    AlertTriangle,
    Share2,
    ArrowUpRight,
} from 'lucide-react';

export default function NotesIndex({ notes = [], meetings = [], counts = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [meetingFilter, setMeetingFilter] = useState(filters.meeting_id ? String(filters.meeting_id) : 'all');
    const [selectedNote, setSelectedNote] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedNoteId, setCopiedNoteId] = useState(null);

    const [formData, setFormData] = useState({
        meeting_id: '',
        title: '',
        content: '',
        key_takeaways: [''],
        action_items: [{ task: '', assignee: '', completed: false }],
    });

    // Check query params on mount for auto-opening create modal with specific meeting_id
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const autoCreate = urlParams.get('create');
        const meetingIdParam = urlParams.get('meeting_id');

        if (autoCreate === '1' || autoCreate === 'true') {
            openCreateModal(meetingIdParam || '');
        }
    }, []);

    // Filter notes client-side for instantaneous search
    const filteredNotes = useMemo(() => {
        return notes.filter((n) => {
            const matchesSearch =
                search === '' ||
                n.title.toLowerCase().includes(search.toLowerCase()) ||
                (n.content && n.content.toLowerCase().includes(search.toLowerCase())) ||
                (n.meeting?.title && n.meeting.title.toLowerCase().includes(search.toLowerCase())) ||
                (Array.isArray(n.key_takeaways) &&
                    n.key_takeaways.some((t) => t && t.toLowerCase().includes(search.toLowerCase())));

            const matchesMeeting =
                meetingFilter === 'all' ||
                (meetingFilter === 'none' && !n.meeting_id) ||
                String(n.meeting_id) === String(meetingFilter);

            return matchesSearch && matchesMeeting;
        });
    }, [notes, search, meetingFilter]);

    const openCreateModal = (defaultMeetingId = '') => {
        setEditingNote(null);
        setFormData({
            meeting_id: defaultMeetingId || (meetingFilter !== 'all' && meetingFilter !== 'none' ? meetingFilter : ''),
            title: '',
            content: '',
            key_takeaways: [''],
            action_items: [{ task: '', assignee: '', completed: false }],
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (note) => {
        setEditingNote(note);
        setFormData({
            meeting_id: note.meeting_id ? String(note.meeting_id) : '',
            title: note.title || '',
            content: note.content || '',
            key_takeaways: Array.isArray(note.key_takeaways) && note.key_takeaways.length > 0 ? note.key_takeaways : [''],
            action_items: Array.isArray(note.action_items) && note.action_items.length > 0
                ? note.action_items
                : [{ task: '', assignee: '', completed: false }],
        });
        setIsCreateModalOpen(true);
    };

    const openDetailModal = (note) => {
        setSelectedNote(note);
        setIsDetailModalOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const cleanTakeaways = (formData.key_takeaways || []).map((t) => (typeof t === 'string' ? t.trim() : '')).filter(Boolean);
        const cleanActionItems = (formData.action_items || []).filter((item) => item.task && item.task.trim() !== '');

        const payload = {
            title: formData.title.trim(),
            meeting_id: formData.meeting_id ? parseInt(formData.meeting_id, 10) : null,
            content: formData.content ? formData.content.trim() : null,
            key_takeaways: cleanTakeaways,
            action_items: cleanActionItems,
        };

        if (editingNote) {
            router.put(route('notes.update', editingNote.id), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    setIsSubmitting(false);
                    if (selectedNote?.id === editingNote.id) {
                        setSelectedNote({ ...selectedNote, ...payload, meeting: meetings.find((m) => m.id === payload.meeting_id) });
                    }
                },
                onError: () => setIsSubmitting(false),
            });
        } else {
            router.post(route('notes.store'), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: () => setIsSubmitting(false),
            });
        }
    };

    const confirmDelete = () => {
        if (!noteToDelete) return;
        setIsDeleting(true);
        router.delete(route('notes.destroy', noteToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                if (selectedNote?.id === noteToDelete.id) {
                    setIsDetailModalOpen(false);
                    setSelectedNote(null);
                }
                setNoteToDelete(null);
            },
            onError: () => setIsDeleting(false),
        });
    };

    const copyMinutesMarkdown = (note) => {
        const lines = [
            `# ${note.title}`,
            '',
            note.meeting
                ? `**Referenced Meeting:** ${note.meeting.title}\n**Date:** ${formatDate(note.meeting.meeting_date)}\n**Location:** ${note.meeting.location}`
                : '**Meeting Reference:** Standalone / Scratch Note',
            '',
        ];

        if (Array.isArray(note.key_takeaways) && note.key_takeaways.length > 0) {
            lines.push('## Key Takeaways');
            note.key_takeaways.forEach((t) => lines.push(`- ${t}`));
            lines.push('');
        }

        if (note.content) {
            lines.push('## Discussion Details');
            lines.push(note.content);
            lines.push('');
        }

        if (Array.isArray(note.action_items) && note.action_items.length > 0) {
            lines.push('## Action Items');
            note.action_items.forEach((item) => {
                const check = item.completed ? '[x]' : '[ ]';
                const assignee = item.assignee ? ` (@${item.assignee})` : '';
                lines.push(`- ${check} ${item.task}${assignee}`);
            });
            lines.push('');
        }

        navigator.clipboard.writeText(lines.join('\n'));
        setCopiedNoteId(note.id);
        setTimeout(() => setCopiedNoteId(null), 2500);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date not specified';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    // Helper to get referenced meeting object from state
    const referencedMeeting = useMemo(() => {
        if (!formData.meeting_id) return null;
        return meetings.find((m) => String(m.id) === String(formData.meeting_id)) || null;
    }, [formData.meeting_id, meetings]);

    return (
        <AppLayout counts={counts} currentNav="notes">
            <Head title="Meeting Notes & Minutes - Marsha Workspace" />

            <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                    Meeting Notes & Minutes
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    Structured discussion notes and actionable minutes referencing workspace meeting sessions.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => openCreateModal()}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-3.5 gap-1.5 shadow-xs shrink-0"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Take Note
                        </Button>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex flex-1 flex-col sm:flex-row gap-2.5">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Search note title, content, or meeting reference..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-9 text-xs"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Meeting Filter Dropdown */}
                        <div className="sm:w-72">
                            <select
                                value={meetingFilter}
                                onChange={(e) => setMeetingFilter(e.target.value)}
                                className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Meetings ({notes.length})</option>
                                <option value="none">Standalone Notes (Unlinked)</option>
                                <optgroup label="Select Specific Meeting">
                                    {meetings.map((m) => {
                                        const noteCountForMeeting = notes.filter((n) => n.meeting_id === m.id).length;
                                        return (
                                            <option key={m.id} value={String(m.id)}>
                                                {m.title} ({noteCountForMeeting} notes)
                                            </option>
                                        );
                                    })}
                                </optgroup>
                            </select>
                        </div>
                    </div>

                    {/* Stats Pill */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0 self-end md:self-center">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                            Showing <strong className="text-slate-900 dark:text-slate-100">{filteredNotes.length}</strong> of {notes.length} notes
                        </span>
                    </div>
                </div>

                {/* Notes List / Grid */}
                {filteredNotes.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                        <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            No Notes Found
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            {search || meetingFilter !== 'all'
                                ? 'No meeting notes matched your current search or filter criteria. Try resetting the filters.'
                                : 'No notes have been recorded yet. Click "Take Note" to document your first meeting discussion or academic advisory session.'}
                        </p>
                        <div className="pt-2">
                            {search || meetingFilter !== 'all' ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearch('');
                                        setMeetingFilter('all');
                                    }}
                                    className="text-xs h-8"
                                >
                                    Reset Filters
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={() => openCreateModal()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 gap-1.5"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Take First Note
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredNotes.map((note) => (
                            <Card
                                key={note.id}
                                className="flex flex-col bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition-all rounded-lg overflow-hidden group"
                            >
                                {/* Card Header with Meeting Reference */}
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        {/* Meeting reference badge */}
                                        {note.meeting ? (
                                            <div
                                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 max-w-[85%] truncate"
                                                title={`Referenced Meeting: ${note.meeting.title}`}
                                            >
                                                <CalendarDays className="h-3 w-3 shrink-0 text-blue-600 dark:text-blue-400" />
                                                <span className="truncate">Meeting: {note.meeting.title}</span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                <span>Standalone Note</span>
                                            </div>
                                        )}

                                        {/* Quick Actions */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => copyMinutesMarkdown(note)}
                                                className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                title="Copy Note Markdown"
                                            >
                                                {copiedNoteId === note.id ? (
                                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                ) : (
                                                    <Copy className="h-3.5 w-3.5" />
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(note)}
                                                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                title="Edit Note"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNoteToDelete(note)}
                                                className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                title="Delete Note"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Meeting Meta Subline (if linked) */}
                                    {note.meeting && (
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-2.5 w-2.5" />
                                                {formatDate(note.meeting.meeting_date)}
                                            </span>
                                            {note.meeting.location && (
                                                <span className="flex items-center gap-1 truncate max-w-[150px]">
                                                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                                                    <span className="truncate">{note.meeting.location}</span>
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Note Title */}
                                    <h2
                                        onClick={() => openDetailModal(note)}
                                        className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors leading-snug"
                                    >
                                        {note.title}
                                    </h2>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 flex-1 space-y-3.5 text-xs">
                                    {/* Key Takeaways */}
                                    {Array.isArray(note.key_takeaways) && note.key_takeaways.length > 0 && (
                                        <div className="space-y-1.5">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                                <ListChecks className="h-3 w-3 text-blue-500" />
                                                Key Takeaways ({note.key_takeaways.length})
                                            </div>
                                            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                                                {note.key_takeaways.slice(0, 3).map((takeaway, idx) => (
                                                    <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                                                        <span className="line-clamp-2">{takeaway}</span>
                                                    </li>
                                                ))}
                                                {note.key_takeaways.length > 3 && (
                                                    <li className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                                                        +{note.key_takeaways.length - 3} more takeaways
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Content Excerpt */}
                                    {note.content && (
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                Discussion Summary
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                                                {note.content}
                                            </p>
                                        </div>
                                    )}

                                    {/* Action Items Count */}
                                    {Array.isArray(note.action_items) && note.action_items.length > 0 && (
                                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                <span>{note.action_items.length} Action Items Assigned</span>
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                                                {note.action_items.filter((i) => i.completed).length}/{note.action_items.length} Done
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer */}
                                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 flex items-center justify-between gap-2 mt-auto">
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                        <Avatar className="h-5 w-5 border border-slate-200 dark:border-slate-700">
                                            <AvatarFallback className="bg-slate-900 text-white text-[9px] font-bold">
                                                {getInitials(note.creator?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="truncate max-w-[120px] font-medium text-slate-700 dark:text-slate-300">
                                            {note.creator?.name || 'Workspace Member'}
                                        </span>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openDetailModal(note)}
                                        className="text-xs h-7 px-2 gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                                    >
                                        <Eye className="h-3 w-3" />
                                        <span>View Details</span>
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* View Full Note Details Modal */}
            {selectedNote && (
                <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                    <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                        {/* Header */}
                        <DialogHeader className="p-5 border-b border-slate-100 dark:border-slate-800 pr-10 sm:pr-12 bg-slate-50/50 dark:bg-slate-950/40">
                            <div className="space-y-2">
                                {/* Referenced Meeting Box */}
                                {selectedNote.meeting ? (
                                    <div className="flex items-center justify-between p-2.5 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                            <div className="min-w-0">
                                                <div className="font-semibold text-blue-900 dark:text-blue-200 truncate">
                                                    Referenced Meeting: {selectedNote.meeting.title}
                                                </div>
                                                <div className="text-[11px] text-blue-700 dark:text-blue-400 flex items-center gap-2 mt-0.5">
                                                    <span>{formatDate(selectedNote.meeting.meeting_date)}</span>
                                                    {selectedNote.meeting.location && (
                                                        <span>• {selectedNote.meeting.location}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            href={route('meetings.index')}
                                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 shrink-0 ml-2"
                                        >
                                            <span>Open Meeting</span>
                                            <ArrowUpRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                ) : (
                                    <Badge variant="outline" className="text-slate-500 border-slate-300 text-xs">
                                        Standalone Discussion Note
                                    </Badge>
                                )}

                                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                                    {selectedNote.title}
                                </DialogTitle>

                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>Recorded by <strong>{selectedNote.creator?.name || 'Workspace Member'}</strong></span>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Scrollable Content */}
                        <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs sm:text-sm">
                            {/* Key Takeaways */}
                            {Array.isArray(selectedNote.key_takeaways) && selectedNote.key_takeaways.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                        <ListChecks className="h-3.5 w-3.5 text-blue-500" />
                                        Key Takeaways & Decisions
                                    </h4>
                                    <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 space-y-2">
                                        {selectedNote.key_takeaways.map((takeaway, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                                                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                                <span>{takeaway}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Discussion Details */}
                            {selectedNote.content && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Discussion Minutes & Notes
                                    </h4>
                                    <div className="p-4 rounded-lg bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                                        {selectedNote.content}
                                    </div>
                                </div>
                            )}

                            {/* Action Items Checklist */}
                            {Array.isArray(selectedNote.action_items) && selectedNote.action_items.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                        Action Items ({selectedNote.action_items.length})
                                    </h4>
                                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                                        {selectedNote.action_items.map((item, idx) => (
                                            <div key={idx} className="p-2.5 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 text-xs">
                                                <div className="flex items-center gap-2">
                                                    {item.completed ? (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <Circle className="h-4 w-4 text-slate-400 shrink-0" />
                                                    )}
                                                    <span className={item.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200 font-medium'}>
                                                        {item.task}
                                                    </span>
                                                </div>
                                                {item.assignee && (
                                                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                                                        @{item.assignee}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <DialogFooter className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => copyMinutesMarkdown(selectedNote)}
                                className="text-xs h-8 gap-1.5"
                            >
                                {copiedNoteId === selectedNote.id ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                                <span>Copy Markdown</span>
                            </Button>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsDetailModalOpen(false);
                                        openEditModal(selectedNote);
                                    }}
                                    className="text-xs h-8 gap-1.5"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                    <span>Edit</span>
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs h-8"
                                >
                                    Done
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Create & Edit Note Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                    <DialogHeader className="p-5 border-b border-slate-100 dark:border-slate-800 pr-10 sm:pr-12 bg-slate-50/50 dark:bg-slate-950/40">
                        <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                            {editingNote ? 'Edit Meeting Note' : 'Create Meeting Note'}
                        </DialogTitle>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Document detailed discussion minutes and action items referencing your meeting session.
                        </p>
                    </DialogHeader>

                    <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
                            {/* Associated Meeting Selector */}
                            <div className="space-y-1.5 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60">
                                <label className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        Referenced Meeting Session
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-normal">Optional association</span>
                                </label>
                                <select
                                    value={formData.meeting_id}
                                    onChange={(e) => setFormData({ ...formData, meeting_id: e.target.value })}
                                    className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">[ None - Standalone General Note ]</option>
                                    {meetings.map((m) => (
                                        <option key={m.id} value={String(m.id)}>
                                            {m.title} ({formatDate(m.meeting_date)} - {m.category})
                                        </option>
                                    ))}
                                </select>

                                {referencedMeeting && (
                                    <div className="pt-1.5 flex items-center gap-3 text-[11px] text-blue-800 dark:text-blue-300">
                                        <span className="font-semibold">Category: {referencedMeeting.category}</span>
                                        <span>•</span>
                                        <span>Location: {referencedMeeting.location}</span>
                                    </div>
                                )}
                            </div>

                            {/* Note Title */}
                            <div className="space-y-1.5">
                                <label className="font-semibold text-slate-900 dark:text-slate-100">
                                    Note Title <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    required
                                    type="text"
                                    placeholder="e.g. Chapter 4 Authentication & Performance Benchmark Minutes"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="h-9 text-xs"
                                />
                            </div>

                            {/* Key Takeaways & Decisions */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                        <ListChecks className="h-3.5 w-3.5 text-blue-500" />
                                        Key Takeaways & Decisions
                                    </label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFormData({ ...formData, key_takeaways: [...formData.key_takeaways, ''] })}
                                        className="text-[11px] h-6 px-2 gap-1"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Add Point
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {formData.key_takeaways.map((takeaway, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <Input
                                                type="text"
                                                placeholder={`Takeaway #${idx + 1}, e.g. Validated PostgreSQL query latency benchmarks`}
                                                value={takeaway}
                                                onChange={(e) => {
                                                    const updated = [...formData.key_takeaways];
                                                    updated[idx] = e.target.value;
                                                    setFormData({ ...formData, key_takeaways: updated });
                                                }}
                                                className="h-8 text-xs flex-1"
                                            />
                                            {formData.key_takeaways.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = formData.key_takeaways.filter((_, i) => i !== idx);
                                                        setFormData({ ...formData, key_takeaways: updated });
                                                    }}
                                                    className="text-slate-400 hover:text-rose-600 p-1"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Detailed Discussion Notes */}
                            <div className="space-y-1.5">
                                <label className="font-semibold text-slate-900 dark:text-slate-100">
                                    Discussion Minutes & Notes
                                </label>
                                <Textarea
                                    rows={5}
                                    placeholder="Enter full meeting discussion notes, advisor feedback, implementation details, and architecture trade-offs discussed..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="text-xs leading-relaxed"
                                />
                            </div>

                            {/* Action Items */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                        Action Items & Tasks
                                    </label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                action_items: [...formData.action_items, { task: '', assignee: '', completed: false }],
                                            })
                                        }
                                        className="text-[11px] h-6 px-2 gap-1"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Add Action Item
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {formData.action_items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(item.completed)}
                                                onChange={(e) => {
                                                    const updated = [...formData.action_items];
                                                    updated[idx] = { ...updated[idx], completed: e.target.checked };
                                                    setFormData({ ...formData, action_items: updated });
                                                }}
                                                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <Input
                                                type="text"
                                                placeholder="Action item task description..."
                                                value={item.task}
                                                onChange={(e) => {
                                                    const updated = [...formData.action_items];
                                                    updated[idx] = { ...updated[idx], task: e.target.value };
                                                    setFormData({ ...formData, action_items: updated });
                                                }}
                                                className="h-7 text-xs flex-1"
                                            />
                                            <Input
                                                type="text"
                                                placeholder="Assignee"
                                                value={item.assignee}
                                                onChange={(e) => {
                                                    const updated = [...formData.action_items];
                                                    updated[idx] = { ...updated[idx], assignee: e.target.value };
                                                    setFormData({ ...formData, action_items: updated });
                                                }}
                                                className="h-7 text-xs w-28"
                                            />
                                            {formData.action_items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = formData.action_items.filter((_, i) => i !== idx);
                                                        setFormData({ ...formData, action_items: updated });
                                                    }}
                                                    className="text-slate-400 hover:text-rose-600 p-1"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Form Footer */}
                        <DialogFooter className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-950/40">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isSubmitting}
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-xs h-8"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 shadow-xs"
                            >
                                {isSubmitting ? 'Saving...' : editingNote ? 'Save Changes' : 'Create Note'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Custom Delete Confirmation Modal */}
            <Dialog open={Boolean(noteToDelete)} onOpenChange={(open) => !open && setNoteToDelete(null)}>
                <DialogContent className="max-w-md p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                    <div className="flex items-start gap-3.5">
                        <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="space-y-1.5 flex-1 pr-6">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                Delete Note
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-slate-200">{noteToDelete?.title}</span>? This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => setNoteToDelete(null)}
                            className="text-xs h-8"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            disabled={isDeleting}
                            onClick={confirmDelete}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 gap-1.5 shadow-xs"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            {isDeleting ? 'Deleting...' : 'Delete Note'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
