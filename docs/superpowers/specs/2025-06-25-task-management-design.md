# Task Management Design — AgencyOS

**Date:** 2025-06-25
**Status:** Approved
**Scope:** Add task management with subtasks, dependencies, and dual views to existing project detail page

---

## Overview

Add a task management system to AgencyOS that lets users break projects into tasks, track progress through an agency-aligned workflow, and manage dependencies between tasks. Tasks live inside projects (not a separate collection). Two views: Kanban board and table/list.

---

## Data Model

Tasks are embedded in the project object as a `tasks` array. No new Store collections.

### Project (updated)

```js
{
  id, name, clientId, serviceType, scope, startDate, deadline,
  status, priority, internalNotes, clientNotes, approvalStatus,
  generatedContent: null,
  tasks: []    // ← new field
}
```

### Task object

```js
{
  id: string,              // timestamp_id (same pattern as other entities)
  title: string,           // required
  description: string,     // optional notes
  status: string,          // 'todo' | 'in-progress' | 'internal-review' | 'client-approval' | 'done'
  priority: string,        // 'low' | 'medium' | 'high' | 'urgent'
  assignee: string,        // free text (person name)
  dueDate: string|null,    // ISO date string
  attachments: string[],   // file name/path references (text only, no uploads)
  blockedBy: string[],     // array of task IDs this task depends on
  subtasks: [],            // array of subtask objects
  createdAt: ISO string,
  updatedAt: ISO string
}
```

### Subtask object

```js
{
  id: string,
  title: string,
  done: boolean
}
```

### Key decisions

- Tasks are embedded in the project, not a separate collection
- `blockedBy` references other task IDs within the same project
- `attachments` stores text references only (no file uploads — stays within localStorage limits)
- Subtasks are simple checklists, no independent status
- Existing projects get `tasks: []` by default (backward compatible)

---

## Status Workflow — Agency-Aligned

```
To Do → In Progress → Internal Review → Client Approval → Done
```

| Status | Meaning |
|--------|---------|
| `todo` | Not started yet |
| `in-progress` | Actively being worked on |
| `internal-review` | Team/QA review before sending to client |
| `client-approval` | Waiting for client sign-off |
| `done` | Completed and approved |

**Why this instead of generic statuses:** Matches the real agency content pipeline. Every agency tool (Teamwork, Asana, ClickUp) separates internal review from client approval. This is the #1 workflow pattern agencies need.

---

## UI Layout

Tasks appear as a new section inside `project-detail.js`, below the existing project info and generated content cards.

```
┌─────────────────────────────────────────────┐
│  Project Header (name, status, edit/delete)  │
├──────────────────────┬──────────────────────┤
│  Project Details     │  Generated Content   │
│  (info card)         │  (generator)         │
├──────────────────────┴──────────────────────┤
│  Tasks — Progress bar + stats                │
│  ████████░░░░░░░░░░░░  35% complete         │
│  12 total · 4 Todo · 3 Progress · 2 Review  │
│                                              │
│  [Board] [List]              [+ Add Task]    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │Todo  │ │In Pro│ │Review│ │Client│ │ Done│
│  │......│ │......│ │......│ │......│ │.....│
│  └──────┘ └──────┘ └──────┘ └──────┘ └─────┘
└─────────────────────────────────────────────┘
```

### Kanban board view

- 5 columns: To Do, In Progress, Internal Review, Client Approval, Done
- Each task card shows: title, priority dot, due date, assignee initials, subtask progress (2/5)
- Drag and drop between columns (HTML5 native drag API)
- Blocked tasks show 🔒 icon and can't be moved to Done until blockers are resolved

### Table/list view

- Sortable rows: Title | Status | Priority | Assignee | Due Date | Subtasks
- Click row to expand inline detail (description, subtask checklist, dependencies)
- Same data, row format

### Toggle

- Two buttons at top: `Board` and `List`
- Remembers last choice per project (stored in localStorage as preference)

---

## Task Operations

### Create task

- Click `+ Add Task` → inline form at top of task section
- Fields: title (required), description, priority (default: medium), assignee, due date
- On save: task gets `id`, `status: 'todo'`, empty `subtasks`, empty `blockedBy`, timestamps
- New task appears in To Do column/row immediately

### Edit task

- Click any task card/row → inline expand below it (not modal, not new page)
- Edit all fields inline
- Add/remove subtasks (checkbox + title + delete button)
- Add/remove dependencies (dropdown of other tasks, exclude self and done tasks)
- Save on blur or explicit save button

### Delete task

- Delete button in expanded task view
- `confirm()` dialog
- Removes this task ID from any other task's `blockedBy` array

### Drag and drop (board view only)

- HTML5 native drag API (`draggable="true"`, `dragstart`, `dragover`, `drop`)
- On drop: update task `status`, persist to Store
- **Status rules:**
  - Free movement between `todo`, `in-progress`, `internal-review`
  - Moving to `client-approval`: always allowed
  - Moving to `done`: requires all `blockedBy` tasks to have status `done`
  - Moving backwards: always allowed
  - Blocked tasks: show toast "Blocked by: [task title]"

### Subtask toggle

- Click checkbox → flip `done` boolean, persist immediately
- Progress shown as fraction: "3/5 done"
- When all subtasks done, suggest (don't auto-move) status change

---

## Dependencies (Blocked By)

### Data model

- `blockedBy: string[]` — task IDs that must complete before this task can move to Done
- Circular dependencies prevented at add time

### UI in expanded task view

```
┌─ Dependencies ──────────────────────────────┐
│  Blocked by:                                 │
│  🔒 Write blog post          (In Progress)   │
│  🔒 Design hero image        (To Do)         │
│                                              │
│  [+ Add dependency]                          │
│                                              │
│  Blocking:                                   │
│  → Schedule social posts     (To Do)         │
└──────────────────────────────────────────────┘
```

- **Blocked by** — tasks that must finish before this one
- **Blocking** — reverse lookup, tasks waiting on this one

### Add dependency

- Dropdown shows all tasks in the project except: self, already-linked, and tasks with status `done`
- Search/filter for large task lists

### Enforcement

- If task has unresolved blockers, dragging to Done is blocked with toast
- Manual override: "Force complete" button in expanded view

---

## Project Task Summary

Progress bar and stats at top of tasks section:

```
████████░░░░░░░░░░░░  35% complete
12 total · 4 To Do · 3 In Progress · 2 Review · 3 Done
```

- Progress = tasks with status `done` / total tasks
- Green when 100%, accent color otherwise
- Updates in real-time as tasks change

---

## New File: `pages/project-tasks.js`

Not a separate page — a module exporting `renderTasks(container, project)`.

### Responsibilities

- Renders full tasks UI (summary bar, view toggle, board/list, add form, task expand)
- Handles all task CRUD operations
- Manages drag and drop
- Persists changes via `Store.update('projects', projectId, { tasks })`

### Why separate

- `project-detail.js` is already 199 lines
- Clean separation: project detail handles project info, tasks module handles task management
- Easier to maintain

### Integration

```js
import { renderTasks } from './project-tasks.js';

// In project-detail.js, after rendering project info:
const tasksContainer = container.querySelector('#tasks-section');
renderTasks(tasksContainer, project);
```

---

## Files Changed

| File | Change |
|------|--------|
| `pages/project-detail.js` | Add tasks section container, import renderTasks |
| `pages/project-tasks.js` | **NEW** — all task management logic |

No changes to `store.js` or `router.js`. Task styles will be added to `style.css` in a focused update (kanban columns, task cards, dependency UI).

---

## Future Enhancements (Not Now)

- Task templates (pre-built task lists for common deliverables)
- Project templates (clone full project with tasks)
- Cross-project task view ("My Tasks" across all projects)
- Visual dependency graph (Gantt-style)
- Time tracking on tasks
- Client portal (clients see tasks in client-approval status)
- Notifications when blockers resolve
