import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
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
} from 'lucide-react';

const STATUS_CONFIG = {
    scheduled: {
        label: 'Terjadwal',
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500',
    },
    ongoing: {
        label: 'Sedang Berlangsung',
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500 animate-pulse',
    },
    completed: {
        label: 'Selesai',
        color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        dot: 'bg-slate-500',
    },
    cancelled: {
        label: 'Dibatalkan',
        color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        dot: 'bg-rose-500',
    },
};

const CATEGORY_COLORS = {
    'Bimbingan Skripsi': 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'Security Architecture': 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'Progress Review': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'Sidang / Seminar': 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    'Code Review': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
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

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        category: 'Bimbingan Skripsi',
        meeting_date: new Date().toISOString().split('T')[0],
        start_time: '09:30',
        end_time: '11:00',
        location: 'Lab Cyber Security & Forensik Gedung B Lt. 3',
        status: 'scheduled',
        attendees: ['Aditya Rahman', 'Fahristi Dewi Khadijah'],
        points: ['Penyelarasan bab 4 metodologi pengujian penetrasi'],
        action_items: [{ task: 'Perbarui diagram arsitektur otentikasi', assignee: 'Aditya Rahman', completed: false }],
        reference_links: [{ title: 'Draf Dokumen Bab 4', url: 'https://docs.google.com' }],
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
        setFormData({
            title: '',
            category: 'Bimbingan Skripsi',
            meeting_date: new Date().toISOString().split('T')[0],
            start_time: '09:30',
            end_time: '11:00',
            location: 'Lab Cyber Security & Forensik Gedung B Lt. 3',
            status: 'scheduled',
            attendees: ['Aditya Rahman', 'Fahristi Dewi Khadijah'],
            points: ['Evaluasi bab 4 metodologi pengujian penetrasi'],
            action_items: [{ task: 'Perbarui diagram arsitektur otentikasi', assignee: 'Aditya Rahman', completed: false }],
            reference_links: [{ title: 'Draf Dokumen Bab 4', url: 'https://docs.google.com' }],
            images: [],
            notes: '',
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (meeting) => {
        setEditingMeeting(meeting);
        setFormData({
            title: meeting.title || '',
            category: meeting.category || 'Bimbingan Skripsi',
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

        const cleanPoints = (formData.points || []).map((p) => (typeof p === 'string' ? p.trim() : '')).filter(Boolean);
        const cleanActionItems = (formData.action_items || []).filter((item) => item.task && item.task.trim() !== '');
        const cleanReferences = (formData.reference_links || []).filter((ref) => ref.title && ref.url && ref.title.trim() !== '');

        const payload = {
            ...formData,
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

    const handleDelete = (meetingId) => {
        if (confirm('Hapus catatan meeting ini? Tindakan tidak dapat dibatalkan.')) {
            router.delete(route('meetings.destroy', meetingId), {
                preserveScroll: true,
                onSuccess: () => {
                    if (selectedMeeting?.id === meetingId) {
                        setIsDetailModalOpen(false);
                    }
                },
            });
        }
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
                    caption: newImageCaption.trim() || 'Lampiran Diagram / Foto',
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
        const dateFormatted = new Date(meeting.meeting_date).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const attendeesList = (meeting.attendees || []).join(', ') || 'Aditya Rahman, Fahristi Dewi Khadijah';
        const pointsList = (meeting.points || []).map((p, idx) => `${idx + 1}. ${p}`).join('\n') || '- Tidak ada poin tercatat';
        const actionItemsList = (meeting.action_items || []).map((item, idx) => `[${item.completed ? 'x' : ' '}] ${item.task} (PJ: ${item.assignee || 'Tim'})`).join('\n') || '-';
        const referencesList = (meeting.reference_links || []).map((ref) => `• ${ref.title}: ${ref.url}`).join('\n') || '-';

        const text = `*NOTULENSI MEETING: ${meeting.title}*
Kategori: ${meeting.category}
Hari/Tanggal: ${dateFormatted}
Waktu: ${meeting.start_time || '-'} s/d ${meeting.end_time || '-'}
Lokasi: ${meeting.location}
Peserta: ${attendeesList}

*POIN PEMBAHASAN:*
${pointsList}

*TINDAK LANJUT (ACTION ITEMS):*
${actionItemsList}

*REFERENSI MATERI:*
${referencesList}

${meeting.notes ? `*CATATAN TAMBAHAN:*\n${meeting.notes}\n` : ''}
_Dicatat via Marsha Security Workspace_`;

        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(meeting.id);
            setTimeout(() => setCopiedId(null), 2500);
        });
    };

    return (
        <AppLayout counts={counts} currentNav="meetings">
            <Head title="Meetings & Agendas — Marsha Workspace" />

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
                            Pencatatan sesi bimbingan skripsi, evaluasi arsitektur keamanan, notulensi poin diskusi, dan rencana tindak lanjut
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
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Sesi Meeting</div>
                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{meetings.length}</div>
                    </div>
                    <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Sesi Terjadwal</div>
                        <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{scheduledCount}</div>
                    </div>
                    <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Selesai / Terlaksana</div>
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
                            placeholder="Cari topik, lokasi, notulensi..."
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
                                Semua
                            </button>
                            <button
                                onClick={() => setStatusFilter('scheduled')}
                                className={`px-2.5 py-1 rounded-md transition-colors ${
                                    statusFilter === 'scheduled'
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold shadow-2xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                Terjadwal
                            </button>
                            <button
                                onClick={() => setStatusFilter('completed')}
                                className={`px-2.5 py-1 rounded-md transition-colors ${
                                    statusFilter === 'completed'
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold shadow-2xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                Selesai
                            </button>
                        </div>

                        {/* Category filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            aria-label="Filter kategori meeting"
                            className="h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
                        >
                            <option value="all">Semua Kategori</option>
                            {categories.map((c) => (
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
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Belum ada agenda meeting</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                            Mulai catat jadwal bimbingan skripsi, evaluasi arsitektur keamanan, atau sinkronisasi teknis bersama tim.
                        </p>
                        <Button onClick={openCreateModal} size="sm" className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-xs gap-1.5 h-8">
                            <Plus className="h-3.5 w-3.5" />
                            Buat Catatan Meeting
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {filteredMeetings.map((meeting) => {
                            const isOnline = meeting.location?.toLowerCase().includes('http') ||
                                            meeting.location?.toLowerCase().includes('meet') ||
                                            meeting.location?.toLowerCase().includes('zoom');

                            const statusInfo = STATUS_CONFIG[meeting.status] || STATUS_CONFIG.scheduled;
                            const categoryStyle = CATEGORY_COLORS[meeting.category] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

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
                                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                                                {statusInfo.label}
                                            </span>
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
                                                    {new Date(meeting.meeting_date).toLocaleDateString('id-ID', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                                {(meeting.start_time || meeting.end_time) && (
                                                    <span className="flex items-center gap-1 text-slate-500">
                                                        <Clock className="h-3 w-3" />
                                                        {meeting.start_time || '-'} s/d {meeting.end_time || '-'}
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
                                                    Poin Pembahasan:
                                                </div>
                                                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-4 list-disc marker:text-slate-400">
                                                    {meeting.points.slice(0, 3).map((point, idx) => (
                                                        <li key={idx} className="line-clamp-2">
                                                            {point}
                                                        </li>
                                                    ))}
                                                    {meeting.points.length > 3 && (
                                                        <li className="text-[11px] text-slate-400 italic list-none -ml-4 pt-0.5">
                                                            +{meeting.points.length - 3} poin pembahasan lainnya
                                                        </li>
                                                    )}
                                                </ul>
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
                                                    Foto / Lampiran Whiteboard ({meeting.images.length})
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
                                                                alt={img.caption || `Lampiran ${idx + 1}`}
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
                                                title="Salin notulensi lengkap ke clipboard"
                                            >
                                                {copiedId === meeting.id ? (
                                                    <>
                                                        <Check className="h-3 w-3 text-emerald-600" />
                                                        <span className="text-emerald-600 font-semibold">Tersalin</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-3 w-3" />
                                                        <span>Salin Notulensi</span>
                                                    </>
                                                )}
                                            </Button>

                                            <Button
                                                onClick={() => openDetailModal(meeting)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs h-7 px-2 text-slate-600 dark:text-slate-400"
                                            >
                                                Detail
                                            </Button>
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
                                                onClick={() => handleDelete(meeting.id)}
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                                                title="Hapus Meeting"
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
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            {editingMeeting ? 'Perbarui Catatan Meeting' : 'Buat Catatan Meeting Baru'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleFormSubmit} className="space-y-4 pt-2 text-xs">
                        {/* Title / Topic */}
                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Topik / Judul Pertemuan *
                            </label>
                            <Input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Contoh: Evaluasi Arsitektur Otentikasi dan Mitigasi Token JWT pada Vercel Serverless"
                                className="text-xs h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            />
                        </div>

                        {/* Category & Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Kategori Meeting
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    aria-label="Kategori Meeting"
                                    className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                                >
                                    <option value="Bimbingan Skripsi">Bimbingan Skripsi</option>
                                    <option value="Security Architecture">Security Architecture</option>
                                    <option value="Progress Review">Progress Review</option>
                                    <option value="Sidang / Seminar">Sidang / Seminar</option>
                                    <option value="Code Review">Code Review</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Status Sesi
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    aria-label="Status Sesi"
                                    className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                                >
                                    <option value="scheduled">Terjadwal</option>
                                    <option value="ongoing">Sedang Berlangsung</option>
                                    <option value="completed">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </select>
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Tanggal Pertemuan *
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
                                    Waktu Mulai
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
                                    Waktu Selesai
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
                                Lokasi / Link Meeting *
                            </label>
                            <Input
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Contoh: Lab Cyber Security Gedung B Lt. 3 atau https://meet.google.com/xyz-abcd-efg"
                                className="text-xs h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            />
                        </div>

                        {/* Attendees / Peserta */}
                        <div className="space-y-1.5">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Peserta Pertemuan
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
                                    placeholder="Ketik nama peserta lalu tekan Tambah (contoh: Dosen Pembimbing Utama)"
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
                                    Tambah
                                </Button>
                            </div>
                        </div>

                        {/* Discussion Points */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Poin Pembahasan / Notulensi
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
                                    <Plus className="h-3 w-3" /> Tambah Poin
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
                                            placeholder={`Poin pembahasan ke ${idx + 1} (contoh: Evaluasi kueri autentikasi dan penanganan latensi database)`}
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

                        {/* Action Items / Tindak Lanjut */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Tindak Lanjut (Action Items)
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
                                    <Plus className="h-3 w-3" /> Tambah Action Item
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
                                            aria-label={`Status tindak lanjut ${idx + 1}`}
                                            className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0"
                                        />
                                        <Input
                                            value={item.task}
                                            onChange={(e) => {
                                                const updated = [...formData.action_items];
                                                updated[idx].task = e.target.value;
                                                setFormData({ ...formData, action_items: updated });
                                            }}
                                            placeholder="Tugas tindak lanjut (contoh: Revisi bab 4 subbab 4.2 pengujian beban)"
                                            className="text-xs h-8 flex-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                        />
                                        <select
                                            value={item.assignee}
                                            onChange={(e) => {
                                                const updated = [...formData.action_items];
                                                updated[idx].assignee = e.target.value;
                                                setFormData({ ...formData, action_items: updated });
                                            }}
                                            aria-label={`Penanggung jawab tindak lanjut ${idx + 1}`}
                                            className="h-8 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 text-xs text-slate-800 dark:text-slate-200"
                                        >
                                            <option value="Aditya Rahman">Adit</option>
                                            <option value="Fahristi Dewi Khadijah">Risty</option>
                                            <option value="Tim">Bersama</option>
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
                                    Tautan Referensi Dokumen / Riset
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
                                    <Plus className="h-3 w-3" /> Tambah Referensi
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
                                            placeholder="Judul tautan (contoh: Draf Bab 4 Google Docs)"
                                            className="text-xs h-8 sm:col-span-2 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                        />
                                        <Input
                                            value={ref.url}
                                            onChange={(e) => {
                                                const updated = [...formData.reference_links];
                                                updated[idx].url = e.target.value;
                                                setFormData({ ...formData, reference_links: updated });
                                            }}
                                            placeholder="URL tautan (https://docs.google.com/...)"
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
                                Lampiran Gambar / Foto Whiteboard / Diagram
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
                                                alt={img.caption || `Lampiran ${idx + 1}`}
                                                className="h-24 w-full object-cover rounded-md"
                                            />
                                            <div className="text-[10px] font-medium text-slate-600 dark:text-slate-400 truncate mt-1 px-1">
                                                {img.caption || 'Tanpa keterangan'}
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
                                        <span>Unggah Berkas Gambar / Foto</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                    <span className="text-[10px] text-slate-400">JPG, PNG, WebP terkompresi otomatis</span>
                                </div>

                                <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                                    <Input
                                        value={newImageUrl}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                        placeholder="Atau tempel URL gambar eksternal (https://...)"
                                        className="text-xs h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                    />
                                    <Input
                                        value={newImageCaption}
                                        onChange={(e) => setNewImageCaption(e.target.value)}
                                        placeholder="Keterangan foto"
                                        className="text-xs h-8 w-36 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hidden sm:block"
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={addImageUrl}
                                        className="text-xs h-8 px-2.5"
                                    >
                                        Tambah URL
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* General Notes */}
                        <div className="space-y-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Catatan Tambahan / Ringkasan Evaluasi
                            </label>
                            <Textarea
                                rows={3}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Tuliskan masukan dosen pembimbing, catatan kendala arsitektur keamanan, atau kesepakatan timeline sidang..."
                                className="text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 resize-none"
                            />
                        </div>

                        <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-xs h-8"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-xs h-8 px-4"
                            >
                                {isSubmitting ? 'Menyimpan...' : (editingMeeting ? 'Perbarui Catatan' : 'Simpan Meeting')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Detail Meeting Modal */}
            {selectedMeeting && (
                <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 space-y-4">
                        <DialogHeader>
                            <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100 dark:border-slate-800">
                                <Badge variant="outline" className={`text-xs px-2.5 py-0.5 rounded-md ${CATEGORY_COLORS[selectedMeeting.category] || ''}`}>
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
                                    {new Date(selectedMeeting.meeting_date).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                                {(selectedMeeting.start_time || selectedMeeting.end_time) && (
                                    <span className="flex items-center gap-1 text-slate-500">
                                        <Clock className="h-3 w-3" />
                                        {selectedMeeting.start_time || '-'} s/d {selectedMeeting.end_time || '-'}
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
                                    Peserta Yang Hadir
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
                                    Poin Pembahasan Notulensi
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
                                    Tindak Lanjut Pasca Meeting
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
                                                {item.assignee || 'Tim'}
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
                                    Dokumen & Tautan Referensi
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
                                    Foto Whiteboard / Lampiran Visual ({selectedMeeting.images.length})
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
                                                alt={img.caption || `Lampiran ${idx + 1}`}
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

                        {/* General Notes */}
                        {selectedMeeting.notes && (
                            <div className="space-y-1">
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Catatan Tambahan
                                </div>
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-200/60 dark:border-slate-800/60">
                                    {selectedMeeting.notes}
                                </div>
                            </div>
                        )}

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
                                        <span className="text-emerald-600 font-semibold">Notulensi Tersalin</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5" />
                                        <span>Salin Notulensi</span>
                                    </>
                                )}
                            </Button>

                            <div className="flex items-center gap-2">
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
                                    Tutup
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Enlarged Image Viewer Dialog */}
            {activeImageViewer && (
                <Dialog open={Boolean(activeImageViewer)} onOpenChange={() => setActiveImageViewer(null)}>
                    <DialogContent className="max-w-3xl p-3 bg-black/95 border-slate-800 text-white">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <span className="text-xs font-semibold truncate text-slate-300">
                                {activeImageViewer.caption || 'Pratinjau Gambar'}
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
                                alt={activeImageViewer.caption || 'Pratinjau'}
                                className="max-h-[70vh] max-w-full object-contain rounded-md"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </AppLayout>
    );
}
