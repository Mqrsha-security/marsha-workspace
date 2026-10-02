import { useState, useMemo } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import GithubIcon from '@/components/GithubIcon';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    CalendarDays,
    Clock,
    MapPin,
    Plus,
    Search,
    Trash2,
    Edit2,
    Link2,
    ExternalLink,
    CheckCircle2,
    Circle,
    Copy,
    Check,
    Image as ImageIcon,
    Upload,
    X,
    Users,
    Video,
    ListChecks,
    BookOpen,
    Eye,
    FileText,
    AlertTriangle,
} from 'lucide-react';

const STATUS_CONFIG = {
    scheduled: {
        label: 'Scheduled',
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500',
    },
    ongoing: {
        label: 'Ongoing',
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500 animate-pulse',
    },
    completed: {
        label: 'Completed',
        color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        dot: 'bg-slate-500',
    },
    cancelled: {
        label: 'Cancelled',
        color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        dot: 'bg-rose-500',
    },
};

const CATEGORY_COLORS = {
    'Thesis Advisory': 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'Bimbingan Skripsi': 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'Security Architecture': 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'Progress Review': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'Seminar & Defense': 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    'Sidang / Seminar': 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    'Code Review': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
};

const getCategoryBadgeClass = (category) => {
    if (!category) return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    if (CATEGORY_COLORS[category]) {
        return CATEGORY_COLORS[category];
    }
    const colorVariants = [
        'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200 dark:border-teal-800',
        'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800',
        'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 border-violet-200 dark:border-violet-800',
        'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    ];
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorVariants.length;
    return colorVariants[index];
};

export default function MeetingsIndex({ meetings = [], counts = {}, filters = {}, categories = [] }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [editingMeeting, setEditingMeeting] = useState(null);
    const [activeImageViewer, setActiveImageViewer] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // Delete confirmation dialog
    const [meetingToDelete, setMeetingToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Dynamic category selection & creation
    const defaultCategories = useMemo(() => [
        'Thesis Advisory',
        'Security Architecture',
        'Progress Review',
        'Seminar & Defense',
        'Code Review',
    ], []);

    const availableCategories = useMemo(() => {
        const set = new Set([...defaultCategories, ...(categories || []), ...meetings.map((m) => m.category).filter(Boolean)]);
        return Array.from(set);
    }, [defaultCategories, categories, meetings]);

    const [isCustomCategory, setIsCustomCategory] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        category: 'Thesis Advisory',
        meeting_date: new Date().toISOString().split('T')[0],
        start_time: '09:30',
        end_time: '11:00',
        location: 'Cyber Security & Forensics Lab Building B 3rd Fl',
        status: 'scheduled',
        attendees: ['Aditya Rahman', 'Fahristi Dewi Khadijah'],
        points: ['Penetration testing methodology and authentication flow evaluation'],
        action_items: [{ task: 'Update authentication architecture diagram', assignee: 'Aditya Rahman', completed: false }],
        reference_links: [{ title: 'Chapter 4 Document Draft', url: 'https://docs.google.com' }],
        images: [],
        notes: '',
    });

    const [newAttendeeInput, setNewAttendeeInput] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newImageCaption, setNewImageCaption] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filtered meetings
    const filteredMeetings = useMemo(() => {
        return meetings.filter((m) => {
            const matchesSearch =
                !search ||
                m.title?.toLowerCase().includes(search.toLowerCase()) ||
                m.location?.toLowerCase().includes(search.toLowerCase()) ||
                m.notes?.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
            const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [meetings, search, statusFilter, categoryFilter]);

    // Summary counts
    const scheduledCount = meetings.filter((m) => m.status === 'scheduled').length;
    const completedCount = meetings.filter((m) => m.status === 'completed').length;
    const totalActionItems = meetings.reduce((acc, m) => acc + (m.action_items?.length || 0), 0);

    const openCreateModal = () => {
        setEditingMeeting(null);
        setIsCustomCategory(false);
        setFormData({
            title: '',
            category: availableCategories[0] || 'Thesis Advisory',
            meeting_date: new Date().toISOString().split('T')[0],
            start_time: '09:30',
            end_time: '11:00',
            location: 'Cyber Security & Forensics Lab Building B 3rd Fl',
            status: 'scheduled',
            attendees: ['Aditya Rahman', 'Fahristi Dewi Khadijah'],
            points: ['Penetration testing methodology and authentication flow evaluation'],
            action_items: [{ task: 'Update authentication architecture diagram', assignee: 'Aditya Rahman', completed: false }],
            reference_links: [{ title: 'Chapter 4 Document Draft', url: 'https://docs.google.com' }],
            images: [],
            notes: '',
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (meeting) => {
        setEditingMeeting(meeting);
        const isPredefined = availableCategories.includes(meeting.category);
        setIsCustomCategory(!isPredefined && Boolean(meeting.category));
        setFormData({
            title: meeting.title || '',
            category: meeting.category || 'Thesis Advisory',
            meeting_date: meeting.meeting_date ? meeting.meeting_date.split('T')[0] : '',
            start_time: meeting.start_time || '',
            end_time: meeting.end_time || '',
            location: meeting.location || '',
            status: meeting.status || 'scheduled',
            attendees: Array.isArray(meeting.attendees) ? meeting.attendees : [],
            points: Array.isArray(meeting.points) && meeting.points.length > 0 ? meeting.points : [''],
            action_items: Array.isArray(meeting.action_items) && meeting.action_items.length > 0 ? meeting.action_items : [{ task: '', assignee: '', completed: false }],
            reference_links: Array.isArray(meeting.reference_links) && meeting.reference_links.length > 0 ? meeting.reference_links : [{ title: '', url: '' }],
            images: Array.isArray(meeting.images) ? meeting.images : [],
            notes: meeting.notes || '',
        });
        setIsCreateModalOpen(true);
    };

    const openDetailModal = (meeting) => {
        setSelectedMeeting(meeting);
        setIsDetailModalOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const cleanCategory = (formData.category || '').trim() || 'Thesis Advisory';
        const cleanPoints = (formData.points || []).map((p) => (typeof p === 'string' ? p.trim() : '')).filter(Boolean);
        const cleanActionItems = (formData.action_items || []).filter((item) => item.task && item.task.trim() !== '');
        const cleanReferences = (formData.reference_links || []).filter((ref) => ref.title && ref.url && ref.title.trim() !== '');

        const payload = {
            ...formData,
            category: cleanCategory,
            points: cleanPoints,
            action_items: cleanActionItems,
            reference_links: cleanReferences,
        };

        if (editingMeeting) {
            router.put(route('meetings.update', editingMeeting.id), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: () => setIsSubmitting(false),
            });
        } else {
            router.post(route('meetings.store'), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: () => setIsSubmitting(false),
            });
        }
    };

    const openDeleteDialog = (meeting) => {
        setMeetingToDelete(meeting);
    };

    const confirmDelete = () => {
        if (!meetingToDelete) return;
        setIsDeleting(true);
        router.delete(route('meetings.destroy', meetingToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                if (selectedMeeting?.id === meetingToDelete.id) {
                    setIsDetailModalOpen(false);
                    setSelectedMeeting(null);
                }
                setMeetingToDelete(null);
            },
            onError: () => setIsDeleting(false),
        });
    };

    // Client-side image upload & canvas compression to lightweight webp/jpeg base64
    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 1200;

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
                setFormData((prev) => ({
                    ...prev,
                    images: [
                        ...(prev.images || []),
                        {
                            url: compressedDataUrl,
                            caption: file.name.replace(/\.[^/.]+$/, ''),
                        },
                    ],
                }));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const addImageUrl = () => {
        if (!newImageUrl.trim()) return;
        setFormData((prev) => ({
            ...prev,
            images: [
                ...(prev.images || []),
                {
                    url: newImageUrl.trim(),
                    caption: newImageCaption.trim() || 'Whiteboard / Diagram Attachment',
                },
            ],
        }));
        setNewImageUrl('');
        setNewImageCaption('');
    };

    const removeImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, idx) => idx !== index),
        }));
    };

    // Copy formatted meeting minutes to clipboard
    const copyMeetingMinutes = (meeting) => {
        const dateFormatted = new Date(meeting.meeting_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const attendeesList = (meeting.attendees || []).join(', ') || 'Aditya Rahman, Fahristi Dewi Khadijah';
        const pointsList = (meeting.points || []).map((p, idx) => `${idx + 1}. ${p}`).join('\n') || 'None recorded';
        const actionItemsList = (meeting.action_items || []).map((item) => `[${item.completed ? 'x' : ' '}] ${item.task} (Owner: ${item.assignee || 'Team'})`).join('\n') || 'None';
        const referencesList = (meeting.reference_links || []).map((ref) => `• ${ref.title}: ${ref.url}`).join('\n') || 'None';

        const text = `*MEETING MINUTES: ${meeting.title}*
Category: ${meeting.category}
Date: ${dateFormatted}
Time: ${meeting.start_time || 'TBD'} to ${meeting.end_time || 'TBD'}
Location: ${meeting.location}
Attendees: ${attendeesList}

*DISCUSSION POINTS:*
${pointsList}

*ACTION ITEMS:*
${actionItemsList}

*REFERENCE MATERIALS:*
${referencesList}

${meeting.notes ? `*DISCUSSION NOTES (WHAT WAS DISCUSSED):*\n${meeting.notes}\n` : ''}
_Recorded via Marsha Security Workspace_`;

        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(meeting.id);
            setTimeout(() => setCopiedId(null), 2500);
        });
    };

    return (
        <AppLayout counts={counts} currentNav="meetings">
            <Head title="Meetings & Notes — Marsha Workspace" />

            <div className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center">
                                <CalendarDays className="h-4 w-4" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                Meeting Agendas & Minutes
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Thesis advisory logs, security architecture reviews, discussion minutes, and follow-up action items.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href="https://github.com/Mqrsha-security"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                                <GithubIcon className="h-3.5 w-3.5" />
                                GitHub Org
                            </Button>
                        </a>
                        <Button onClick={openCreateModal} size="sm" className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-xs gap-1.5 h-8">
                            <Plus className="h-3.5 w-3.5" />
                            New Meeting
                        </Button>
                    </div>
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Sessions</div>
                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{meetings.length}</div>
                    </div>
                    <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Scheduled Sessions</div>
                        <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{scheduledCount}</div>
                    </div>
                    <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Completed Sessions</div>
                        <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{completedCount}</div>
                    </div>
                    <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Action Items</div>
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{totalActionItems}</div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Search topic, location, minutes, notes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        {/* Status filter */}
                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100/70 dark:bg-slate-800/70 text-xs">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-2.5 py-1 rounded-md transition-colors ${
                                    statusFilter === 'all'
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold shadow-2xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setStatusFilter('scheduled')}
                                className={`px-2.5 py-1 rounded-md transition-colors ${
                                    statusFilter === 'scheduled'
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold shadow-2xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                Scheduled
                            </button>
                            <button
                                onClick={() => setStatusFilter('completed')}
                                className={`px-2.5 py-1 rounded-md transition-colors ${
                                    statusFilter === 'completed'
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold shadow-2xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                Completed
                            </button>
                        </div>

                        {/* Category filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            aria-label="Filter meeting category"
                            className="h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
                        >
                            <option value="all">All Categories</option>
                            {availableCategories.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Meetings List */}
                {filteredMeetings.length === 0 ? (
                    <Card className="p-10 text-center border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                            <CalendarDays className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">No meeting agendas found</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                            Start logging thesis advisory sessions, security architecture reviews, or team synchronization notes.
                        </p>
                        <Button onClick={openCreateModal} size="sm" className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-xs gap-1.5 h-8">
                            <Plus className="h-3.5 w-3.5" />
                            Create Meeting
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {filteredMeetings.map((meeting) => {
                            const isOnline = meeting.location?.toLowerCase().includes('http') ||
                                            meeting.location?.toLowerCase().includes('meet') ||
                                            meeting.location?.toLowerCase().includes('zoom');

                            const statusInfo = STATUS_CONFIG[meeting.status] || STATUS_CONFIG.scheduled;
                            const categoryStyle = getCategoryBadgeClass(meeting.category);

                            return (
                                <Card
                                    key={meeting.id}
                                    className="p-4 sm:p-5 flex flex-col justify-between border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                                >
                                    <div className="space-y-3.5">
                                        {/* Card Top Badges */}
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${categoryStyle}`}>
                                                {meeting.category}
                                            </Badge>
                                            <div className="flex items-center gap-1.5">
                                                <Link
                                                    href={route('notes.index', { meeting_id: meeting.id })}
                                                    className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 transition-colors"
                                                    title="View notes referencing this meeting"
                                                >
                                                    <FileText className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
                                                    <span>{meeting.meeting_notes_count || 0} Notes</span>
                                                </Link>
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Meeting Title / Topic */}
                                        <div>
                                            <h3
                                                onClick={() => openDetailModal(meeting)}
                                                className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors leading-snug"
                                            >
                                                {meeting.title}
                                            </h3>
                                        </div>

                                        {/* Date, Time & Location row */}
                                        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60 font-mono">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                <span>
                                                    {new Date(meeting.meeting_date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                                {(meeting.start_time || meeting.end_time) && (
                                                    <span className="flex items-center gap-1 text-slate-500">
                                                        <Clock className="h-3 w-3" />
                                                        {meeting.start_time || 'TBD'} - {meeting.end_time || 'TBD'}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {isOnline ? (
                                                    <Video className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                                ) : (
                                                    <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                                )}
                                                {isOnline ? (
                                                    <a
                                                        href={meeting.location.startsWith('http') ? meeting.location : `https://${meeting.location}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 truncate"
                                                    >
                                                        <span>{meeting.location}</span>
                                                        <ExternalLink className="h-3 w-3 shrink-0" />
                                                    </a>
                                                ) : (
                                                    <span className="truncate">{meeting.location}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Attendees */}
                                        {meeting.attendees && meeting.attendees.length > 0 && (
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <Users className="h-3 w-3 text-slate-400" />
                                                {meeting.attendees.map((attendee, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                                                    >
                                                        {attendee}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Discussion Points Preview */}
                                        {meeting.points && meeting.points.length > 0 && (
                                            <div className="space-y-1">
                                                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                                    <ListChecks className="h-3.5 w-3.5 text-slate-400" />
                                                    Discussion Points:
                                                </div>
                                                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-4 list-disc marker:text-slate-400">
                                                    {meeting.points.slice(0, 3).map((point, idx) => (
                                                        <li key={idx} className="line-clamp-2">
                                                            {point}
                                                        </li>
                                                    ))}
                                                    {meeting.points.length > 3 && (
                                                        <li className="text-[11px] text-slate-400 italic list-none -ml-4 pt-0.5">
                                                            +{meeting.points.length - 3} more discussion points
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Notes Pembahasan (Yang Dibahas di Meeting) */}
                                        {meeting.notes && (
                                            <div className="space-y-1 p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/70 dark:border-amber-900/40">
                                                <div className="text-[11px] font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                                                    <FileText className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                                    <span>Discussion Notes:</span>
                                                </div>
                                                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 whitespace-pre-wrap leading-relaxed">
                                                    {meeting.notes}
                                                </p>
                                            </div>
                                        )}

                                        {/* Reference Links */}
                                        {meeting.reference_links && meeting.reference_links.length > 0 && (
                                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                                {meeting.reference_links.map((ref, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={ref.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 transition-colors"
                                                    >
                                                        <Link2 className="h-3 w-3" />
                                                        <span className="truncate max-w-[140px]">{ref.title}</span>
                                                        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        {/* Image Attachments Thumbnail Strip */}
                                        {meeting.images && meeting.images.length > 0 && (
                                            <div className="space-y-1 pt-1">
                                                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                                    <ImageIcon className="h-3 w-3" />
                                                    Attachments ({meeting.images.length})
                                                </div>
                                                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                                    {meeting.images.map((img, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() => setActiveImageViewer(img)}
                                                            className="h-12 w-16 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer hover:opacity-85 transition-opacity relative group bg-slate-100 dark:bg-slate-800"
                                                        >
                                                            <img
                                                                src={img.url}
                                                                alt={img.caption || `Attachment ${idx + 1}`}
                                                                className="h-full w-full object-cover"
                                                                loading="lazy"
                                                            />
                                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                <Eye className="h-3.5 w-3.5 text-white" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Footer Actions */}
                                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                onClick={() => copyMeetingMinutes(meeting)}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs gap-1.5 h-7 px-2"
                                                title="Copy formatted meeting minutes to clipboard"
                                            >
                                                {copiedId === meeting.id ? (
                                                    <>
                                                        <Check className="h-3 w-3 text-emerald-600" />
                                                        <span className="text-emerald-600 font-semibold">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-3 w-3" />
                                                        <span>Copy Minutes</span>
                                                    </>
                                                )}
                                            </Button>

                                            <Button
                                                onClick={() => openDetailModal(meeting)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs h-7 px-2 text-slate-600 dark:text-slate-400"
                                            >
                                                Details
                                            </Button>

                                            <Link
                                                href={route('notes.index', { meeting_id: meeting.id })}
                                                className="text-xs h-7 px-2 inline-flex items-center gap-1 rounded-md text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                title="View notes referencing this meeting"
                                            >
                                                <FileText className="h-3 w-3" />
                                                <span>Notes ({meeting.meeting_notes_count || 0})</span>
                                            </Link>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Button
                                                onClick={() => openEditModal(meeting)}
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 dark:hover:text-slate-200"
                                                title="Edit Meeting"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                onClick={() => openDeleteDialog(meeting)}
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                                                title="Delete Meeting"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create / Edit Meeting Dialog */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                    <DialogHeader className="pr-10 sm:pr-12">
                        <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            {editingMeeting ? 'Edit Meeting Record' : 'Create New Meeting'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleFormSubmit} className="space-y-4 pt-2 text-xs">
                        {/* Title / Topic */}
                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Meeting Topic / Title *
                            </label>
                            <Input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Chapter 4 Evaluation: Authentication Architecture & Load Testing Benchmarks"
                                className="text-xs h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            />
                        </div>

                        {/* Category & Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                                        Category *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const nextCustom = !isCustomCategory;
                                            setIsCustomCategory(nextCustom);
                                            if (nextCustom) {
                                                setFormData({ ...formData, category: '' });
                                            } else {
                                                setFormData({ ...formData, category: availableCategories[0] || 'Thesis Advisory' });
                                            }
                                        }}
                                        className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {isCustomCategory ? '← Choose list' : '+ Add custom'}
                                    </button>
                                </div>

                                {isCustomCategory ? (
                                    <Input
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="Type custom category name (e.g. Threat Modeling Lab)"
                                        className="text-xs h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                        autoFocus
                                    />
                                ) : (
                                    <select
                                        value={formData.category}
                                        onChange={(e) => {
                                            if (e.target.value === '__custom__') {
                                                setIsCustomCategory(true);
                                                setFormData({ ...formData, category: '' });
                                            } else {
                                                setFormData({ ...formData, category: e.target.value });
                                            }
                                        }}
                                        aria-label="Category"
                                        className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                                    >
                                        {availableCategories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                        <option value="__custom__">+ Add Custom Category...</option>
                                    </select>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Session Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    aria-label="Session Status"
                                    className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                                >
                                    <option value="scheduled">Scheduled</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Meeting Date *
                                </label>
                                <Input
                                    type="date"
                                    required
                                    value={formData.meeting_date}
                                    onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
                                    className="text-xs h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Start Time
                                </label>
                                <Input
                                    type="time"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    className="text-xs h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    End Time
                                </label>
                                <Input
                                    type="time"
                                    value={formData.end_time}
                                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                    className="text-xs h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Location or Meeting URL *
                            </label>
                            <Input
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g. Cyber Security Lab Building B 3rd Fl or https://meet.google.com/xyz-abcd-efg"
                                className="text-xs h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            />
                        </div>

                        {/* Attendees */}
                        <div className="space-y-1.5">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Attendees
                            </label>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {formData.attendees.map((att, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                    >
                                        {att}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData({
                                                    ...formData,
                                                    attendees: formData.attendees.filter((_, i) => i !== idx),
                                                })
                                            }
                                            className="text-slate-400 hover:text-rose-500"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <Input
                                    value={newAttendeeInput}
                                    onChange={(e) => setNewAttendeeInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (newAttendeeInput.trim()) {
                                                setFormData({
                                                    ...formData,
                                                    attendees: [...formData.attendees, newAttendeeInput.trim()],
                                                });
                                                setNewAttendeeInput('');
                                            }
                                        }
                                    }}
                                    placeholder="Type attendee name and click Add (e.g. Primary Thesis Advisor)"
                                    className="text-xs h-8 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                />
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        if (newAttendeeInput.trim()) {
                                            setFormData({
                                                ...formData,
                                                attendees: [...formData.attendees, newAttendeeInput.trim()],
                                            });
                                            setNewAttendeeInput('');
                                        }
                                    }}
                                    className="text-xs h-8 px-2.5"
                                >
                                    Add
                                </Button>
                            </div>
                        </div>

                        {/* Discussion Points */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Discussion Points / Minutes
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData({
                                            ...formData,
                                            points: [...formData.points, ''],
                                        })
                                    }
                                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                    <Plus className="h-3 w-3" /> Add Point
                                </button>
                            </div>

                            <div className="space-y-2">
                                {formData.points.map((point, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="text-slate-400 font-mono text-[11px] w-4">{idx + 1}.</span>
                                        <Input
                                            value={point}
                                            onChange={(e) => {
                                                const updated = [...formData.points];
                                                updated[idx] = e.target.value;
                                                setFormData({ ...formData, points: updated });
                                            }}
                                            placeholder={`Discussion point #${idx + 1} (e.g. Evaluation of authentication query latency and database pooling)`}
                                            className="text-xs h-8 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                        />
                                        {formData.points.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = formData.points.filter((_, i) => i !== idx);
                                                    setFormData({ ...formData, points: updated });
                                                }}
                                                className="text-slate-400 hover:text-rose-500 p-1"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Items / Follow-up */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Follow-up Action Items
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData({
                                            ...formData,
                                            action_items: [
                                                ...formData.action_items,
                                                { task: '', assignee: 'Aditya Rahman', completed: false },
                                            ],
                                        })
                                    }
                                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                    <Plus className="h-3 w-3" /> Add Action Item
                                </button>
                            </div>

                            <div className="space-y-2">
                                {formData.action_items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={item.completed}
                                            onChange={(e) => {
                                                const updated = [...formData.action_items];
                                                updated[idx].completed = e.target.checked;
                                                setFormData({ ...formData, action_items: updated });
                                            }}
                                            aria-label={`Follow-up status ${idx + 1}`}
                                            className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0"
                                        />
                                        <Input
                                            value={item.task}
                                            onChange={(e) => {
                                                const updated = [...formData.action_items];
                                                updated[idx].task = e.target.value;
                                                setFormData({ ...formData, action_items: updated });
                                            }}
                                            placeholder="Action item task (e.g. Update authentication sequence diagram in Chapter 4)"
                                            className="text-xs h-8 flex-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                        />
                                        <select
                                            value={item.assignee}
                                            onChange={(e) => {
                                                const updated = [...formData.action_items];
                                                updated[idx].assignee = e.target.value;
                                                setFormData({ ...formData, action_items: updated });
                                            }}
                                            aria-label={`Follow-up assignee ${idx + 1}`}
                                            className="h-8 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 text-xs text-slate-800 dark:text-slate-200"
                                        >
                                            <option value="Aditya Rahman">Adit</option>
                                            <option value="Fahristi Dewi Khadijah">Risty</option>
                                            <option value="Team">Team</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updated = formData.action_items.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, action_items: updated });
                                            }}
                                            className="text-slate-400 hover:text-rose-500 p-1"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reference Links */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Reference Documents & Research Links
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData({
                                            ...formData,
                                            reference_links: [
                                                ...formData.reference_links,
                                                { title: '', url: '' },
                                            ],
                                        })
                                    }
                                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                    <Plus className="h-3 w-3" /> Add Reference
                                </button>
                            </div>

                            <div className="space-y-2">
                                {formData.reference_links.map((ref, idx) => (
                                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                                        <Input
                                            value={ref.title}
                                            onChange={(e) => {
                                                const updated = [...formData.reference_links];
                                                updated[idx].title = e.target.value;
                                                setFormData({ ...formData, reference_links: updated });
                                            }}
                                            placeholder="Link title (e.g. Chapter 4 Draft Google Docs)"
                                            className="text-xs h-8 sm:col-span-2 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                        />
                                        <Input
                                            value={ref.url}
                                            onChange={(e) => {
                                                const updated = [...formData.reference_links];
                                                updated[idx].url = e.target.value;
                                                setFormData({ ...formData, reference_links: updated });
                                            }}
                                            placeholder="URL (https://docs.google.com/...)"
                                            className="text-xs h-8 sm:col-span-2 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updated = formData.reference_links.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, reference_links: updated });
                                            }}
                                            className="text-slate-400 hover:text-rose-500 p-1 justify-self-center"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image Attachments */}
                        <div className="space-y-2">
                            <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                                Diagrams & Whiteboard Attachments
                            </label>

                            {/* Existing Images */}
                            {formData.images && formData.images.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {formData.images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-950 group"
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.caption || `Attachment ${idx + 1}`}
                                                className="h-24 w-full object-cover rounded-md"
                                            />
                                            <div className="text-[10px] font-medium text-slate-600 dark:text-slate-400 truncate mt-1 px-1">
                                                {img.caption || 'Untitled attachment'}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-2 right-2 p-1 rounded-full bg-rose-600 text-white shadow-xs opacity-90 hover:opacity-100"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload from device or input URL */}
                            <div className="p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2.5">
                                <div className="flex items-center gap-2">
                                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs">
                                        <Upload className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                        <span>Upload Image File</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                    <span className="text-[10px] text-slate-400">JPG, PNG, WebP auto-compressed</span>
                                </div>

                                <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                                    <Input
                                        value={newImageUrl}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                        placeholder="Or paste external image URL (https://...)"
                                        className="text-xs h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                    />
                                    <Input
                                        value={newImageCaption}
                                        onChange={(e) => setNewImageCaption(e.target.value)}
                                        placeholder="Image caption"
                                        className="text-xs h-8 w-36 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hidden sm:block"
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={addImageUrl}
                                        className="text-xs h-8 px-2.5"
                                    >
                                        Add URL
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Discussion Notes */}
                        <div className="space-y-1.5 p-3 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                            <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                    Discussion Notes (What was discussed in the meeting)
                                </span>
                                <span className="text-[10px] text-slate-400 font-normal">Supports multi-paragraph</span>
                            </label>
                            <Textarea
                                rows={4}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Summarize key discussion takeaways: agreements with advisor or team, security architectural decisions, technical blockers, and planned solutions..."
                                className="text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 resize-y min-h-[90px]"
                            />
                        </div>

                        <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-xs h-8"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-xs h-8 px-4"
                            >
                                {isSubmitting ? 'Saving...' : (editingMeeting ? 'Update Meeting' : 'Save Meeting')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Detail Meeting Modal */}
            {selectedMeeting && (
                <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 space-y-4">
                        <DialogHeader className="pr-10 sm:pr-12">
                            <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100 dark:border-slate-800">
                                <Badge variant="outline" className={`text-xs px-2.5 py-0.5 rounded-md ${getCategoryBadgeClass(selectedMeeting.category)}`}>
                                    {selectedMeeting.category}
                                </Badge>
                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${STATUS_CONFIG[selectedMeeting.status]?.color}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[selectedMeeting.status]?.dot}`} />
                                    {STATUS_CONFIG[selectedMeeting.status]?.label}
                                </span>
                            </div>
                            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2 leading-snug">
                                {selectedMeeting.title}
                            </DialogTitle>
                        </DialogHeader>

                        {/* Timing and Location */}
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 font-mono">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                <CalendarDays className="h-4 w-4 text-slate-400" />
                                <span>
                                    {new Date(selectedMeeting.meeting_date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                                {(selectedMeeting.start_time || selectedMeeting.end_time) && (
                                    <span className="flex items-center gap-1 text-slate-500">
                                        <Clock className="h-3 w-3" />
                                        {selectedMeeting.start_time || 'TBD'} to {selectedMeeting.end_time || 'TBD'}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                <MapPin className="h-4 w-4 text-rose-500" />
                                <span>{selectedMeeting.location}</span>
                            </div>
                        </div>

                        {/* Attendees */}
                        {selectedMeeting.attendees && selectedMeeting.attendees.length > 0 && (
                            <div className="space-y-1">
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Attendees
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {selectedMeeting.attendees.map((att, idx) => (
                                        <span
                                            key={idx}
                                            className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                                        >
                                            {att}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Discussion Points */}
                        {selectedMeeting.points && selectedMeeting.points.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Discussion Points
                                </div>
                                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
                                    {selectedMeeting.points.map((point, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                                            <span className="font-mono text-slate-400 font-bold shrink-0">{idx + 1}.</span>
                                            <span className="leading-relaxed">{point}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action items */}
                        {selectedMeeting.action_items && selectedMeeting.action_items.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Follow-up Action Items
                                </div>
                                <div className="space-y-1.5">
                                    {selectedMeeting.action_items.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between gap-2 p-2 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/70 text-xs"
                                        >
                                            <div className="flex items-center gap-2">
                                                {item.completed ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                ) : (
                                                    <Circle className="h-4 w-4 text-slate-400" />
                                                )}
                                                <span className={item.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}>
                                                    {item.task}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                                                {item.assignee || 'Team'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reference links */}
                        {selectedMeeting.reference_links && selectedMeeting.reference_links.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Reference Documents & Links
                                </div>
                                <div className="space-y-1.5">
                                    {selectedMeeting.reference_links.map((ref, idx) => (
                                        <a
                                            key={idx}
                                            href={ref.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-2 rounded-md bg-blue-50/70 hover:bg-blue-100/70 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 border border-blue-200/70 dark:border-blue-800/70 text-xs text-blue-700 dark:text-blue-300 transition-colors"
                                        >
                                            <span className="flex items-center gap-2 font-medium">
                                                <Link2 className="h-3.5 w-3.5" />
                                                {ref.title}
                                            </span>
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Attached Images */}
                        {selectedMeeting.images && selectedMeeting.images.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Whiteboard & Visual Attachments ({selectedMeeting.images.length})
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {selectedMeeting.images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setActiveImageViewer(img)}
                                            className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer group bg-slate-50 dark:bg-slate-950 p-1"
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.caption || `Attachment ${idx + 1}`}
                                                className="h-28 w-full object-cover rounded-md group-hover:scale-105 transition-transform duration-200"
                                            />
                                            {img.caption && (
                                                <div className="text-[10px] text-slate-600 dark:text-slate-400 p-1 truncate font-medium">
                                                    {img.caption}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Discussion Notes Section */}
                        <div className="space-y-2 p-3.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="text-xs font-semibold text-blue-900 dark:text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    <span>Associated Meeting Notes & Minutes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={route('notes.index', { meeting_id: selectedMeeting.id })}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                    >
                                        View Notes
                                    </Link>
                                    <Link
                                        href={route('notes.index', { meeting_id: selectedMeeting.id, create: 1 })}
                                        className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1 shadow-xs"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Take Note
                                    </Link>
                                </div>
                            </div>
                            {selectedMeeting.notes && (
                                <div className="p-3 rounded bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-200/70 dark:border-slate-800">
                                    {selectedMeeting.notes}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                            <Button
                                onClick={() => copyMeetingMinutes(selectedMeeting)}
                                variant="outline"
                                size="sm"
                                className="text-xs gap-1.5 h-8"
                            >
                                {copiedId === selectedMeeting.id ? (
                                    <>
                                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                                        <span className="text-emerald-600 font-semibold">Minutes Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5" />
                                        <span>Copy Minutes</span>
                                    </>
                                )}
                            </Button>

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => openDeleteDialog(selectedMeeting)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsDetailModalOpen(false);
                                        openEditModal(selectedMeeting);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8 gap-1.5"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                    Edit
                                </Button>
                                <Button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    size="sm"
                                    className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-xs h-8"
                                >
                                    Close
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Enlarged Image Viewer Dialog */}
            {activeImageViewer && (
                <Dialog open={Boolean(activeImageViewer)} onOpenChange={() => setActiveImageViewer(null)}>
                    <DialogContent className="max-w-3xl p-3 bg-black/95 border-slate-800 text-white" hideCloseButton={true}>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <span className="text-xs font-semibold truncate text-slate-300">
                                {activeImageViewer.caption || 'Image Preview'}
                            </span>
                            <button
                                onClick={() => setActiveImageViewer(null)}
                                className="text-slate-400 hover:text-white p-1"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex items-center justify-center p-2 max-h-[75vh]">
                            <img
                                src={activeImageViewer.url}
                                alt={activeImageViewer.caption || 'Preview'}
                                className="max-h-[70vh] max-w-full object-contain rounded-md"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Custom Delete Confirmation Modal */}
            <Dialog open={Boolean(meetingToDelete)} onOpenChange={(open) => !open && setMeetingToDelete(null)}>
                <DialogContent className="max-w-md p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                    <div className="flex items-start gap-3.5">
                        <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="space-y-1.5 flex-1 pr-6">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                Delete Meeting Record
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-slate-200">{meetingToDelete?.title}</span>? All discussion minutes, attachments, and action items will be permanently removed.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => setMeetingToDelete(null)}
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
                            {isDeleting ? 'Deleting...' : 'Delete Meeting'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
