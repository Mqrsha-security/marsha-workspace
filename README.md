# Marsha Security Workspace

Internal operations workspace for Aditya Rahman and Fahristi Dewi Khadijah. Built on Laravel 11, Inertia.js, React 19, and Tailwind CSS.

## Team

- **Aditya Rahman** — Security Architect (infrastructure hardening, vulnerability assessment, threat modeling)
- **Fahristi Dewi Khadijah** — Project Manager (milestones, task coordination, sprint tracking)

Access is restricted to internal team accounts. Public registration is disabled. Sessions persist for 7 days.

## Features

### Tasks and Workstreams
Tasks break down into UI, Code, and Design tabs with reference links and progress logs. Only the assigned owner can change task status or details. Other members can follow along and post comments.

Tasks move through four stages:
- Todo
- In Progress
- Revisi (requires a revision note)
- Done (logs the completion timestamp)

### Meetings and Notes
Meeting agendas capture attendees, agenda points, links, and action items. The notes module links directly to specific meetings to track decisions and follow-ups.

### Real-Time Presence and Pixel Office
Tabs ping `/presence/ping` every 6 seconds. When a tab closes or hides, an instant beacon marks the user offline. A retro 8-bit canvas displays desk status (working or away) and runs shared office dialogue when both members are online.

### Backups
The workspace exports all data (tasks, meetings, notes, apps, and users) either directly to Google Drive as formatted Google Docs, or as a downloadable ZIP package containing HTML summaries and raw JSON.
