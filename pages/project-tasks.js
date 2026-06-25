/* =============================================
   AgencyOS — Task Management Module
   ============================================= */

import Store from '../store.js';

// --- Constants ---
const STATUSES = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'internal-review', label: 'Internal Review' },
  { value: 'client-approval', label: 'Client Approval' },
  { value: 'done', label: 'Done' }
];

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

// --- Helpers ---
function taskId() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (days < 0 && d.toDateString() !== now.toDateString()) {
    return `<span class="task-card-due overdue">${formatted}</span>`;
  }
  return `<span class="task-card-due">${formatted}</span>`;
}

function getAssigneeInitials(name) {
  if (!name) return '';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function isBlocked(task, allTasks) {
  if (!task.blockedBy || task.blockedBy.length === 0) return false;
  return task.blockedBy.some(id => {
    const blocker = allTasks.find(t => t.id === id);
    return blocker && blocker.status !== 'done';
  });
}

function getBlockingTasks(task, allTasks) {
  return allTasks.filter(t =>
    t.blockedBy && t.blockedBy.includes(task.id) && t.status !== 'done'
  );
}

function computeStats(tasks) {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const byStatus = STATUSES.map(s => ({
    ...s,
    count: tasks.filter(t => t.status === s.value).length
  }));
  return { total, done, percent, byStatus };
}

function persistTasks(project, tasks) {
  Store.update('projects', project.id, { tasks });
}

// --- Main render ---
export default function renderTasks(container, project) {
  const tasks = project.tasks || [];
  const stats = computeStats(tasks);

  container.innerHTML = `
    <div class="tasks-section">
      <div class="task-summary">
        <div class="task-progress-bar">
          <div class="task-progress-fill ${stats.percent === 100 ? 'complete' : ''}" style="width: ${stats.percent}%"></div>
        </div>
        <div class="task-stats">
          <span>${stats.total} total</span>
          ${stats.byStatus.map(s => `<span>${s.count} ${s.label}</span>`).join('')}
          <span>${stats.percent}% complete</span>
        </div>
      </div>

      <div class="task-controls">
        <div class="task-view-toggle">
          <button class="btn btn-small active" data-view="board">Board</button>
          <button class="btn btn-small" data-view="list">List</button>
        </div>
        <button class="btn btn-primary btn-small" id="add-task-btn">+ Add Task</button>
      </div>

      <div id="task-add-form-container"></div>
      <div id="task-view-container"></div>
    </div>
  `;

  // View toggle
  let currentView = localStorage.getItem(`taskView_${project.id}`) || 'board';
  const viewBtns = container.querySelectorAll('.task-view-toggle .btn');
  const viewContainer = container.querySelector('#task-view-container');

  function setView(view) {
    currentView = view;
    localStorage.setItem(`taskView_${project.id}`, view);
    viewBtns.forEach(b => b.classList.toggle('active', b.dataset.view === view));
    renderView();
  }

  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });

  function renderView() {
    const freshProject = Store.getById('projects', project.id);
    const freshTasks = freshProject?.tasks || [];
    if (currentView === 'board') {
      renderBoard(viewContainer, freshTasks, project);
    } else {
      renderList(viewContainer, freshTasks, project);
    }
  }

  // Add task button
  container.querySelector('#add-task-btn').addEventListener('click', () => {
    const formContainer = container.querySelector('#task-add-form-container');
    if (formContainer.innerHTML) {
      formContainer.innerHTML = '';
    } else {
      renderAddForm(formContainer, project, () => {
        refresh(container, project);
      });
    }
  });

  // Initial render
  setView(currentView);
}

function refresh(container, project) {
  const freshProject = Store.getById('projects', project.id);
  renderTasks(container, freshProject);
}

// --- Placeholder functions (implemented in later tasks) ---
function renderBoard(container, tasks, project) {
  container.innerHTML = `
    <div class="kanban-board">
      ${STATUSES.map(status => {
        const columnTasks = tasks.filter(t => t.status === status.value);
        return `
          <div class="kanban-column" data-status="${status.value}">
            <div class="kanban-column-header">
              <span>${status.label}</span>
              <span class="kanban-column-count">${columnTasks.length}</span>
            </div>
            <div class="kanban-column-body" data-status="${status.value}">
              ${columnTasks.map(task => renderTaskCard(task, tasks)).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Drag and drop
  setupDragDrop(container, tasks, project);

  // Card click to expand
  container.querySelectorAll('.task-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.task-card-blocked-icon')) return;
      const taskId = card.dataset.taskId;
      const freshProject = Store.getById('projects', project.id);
      const task = (freshProject.tasks || []).find(t => t.id === taskId);
      if (task) {
        renderTaskExpand(card, task, freshProject, () => {
          const parent = container.closest('.tasks-section').parentElement;
          refresh(parent, freshProject);
        });
      }
    });
  });
}

function renderTaskCard(task, allTasks) {
  const blocked = isBlocked(task, allTasks);
  const subtaskTotal = task.subtasks?.length || 0;
  const subtaskDone = task.subtasks?.filter(s => s.done).length || 0;

  return `
    <div class="task-card ${blocked ? 'blocked' : ''}" draggable="true" data-task-id="${task.id}">
      <div class="task-card-title">${esc(task.title)}</div>
      <div class="task-card-meta">
        <span class="priority-dot priority-${task.priority}"></span>
        ${task.assignee ? `<span class="task-card-assignee">${getAssigneeInitials(task.assignee)}</span>` : ''}
        ${task.dueDate ? formatDate(task.dueDate) : ''}
        ${subtaskTotal > 0 ? `<span class="task-card-subtasks">${subtaskDone}/${subtaskTotal}</span>` : ''}
        ${blocked ? '<span class="task-card-blocked-icon" title="Blocked">🔒</span>' : ''}
      </div>
    </div>
  `;
}

function setupDragDrop(container, tasks, project) {
  const columns = container.querySelectorAll('.kanban-column-body');

  container.querySelectorAll('.task-card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', card.dataset.taskId);
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      columns.forEach(col => col.classList.remove('drag-over'));
    });
  });

  columns.forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      col.classList.add('drag-over');
    });

    col.addEventListener('dragleave', () => {
      col.classList.remove('drag-over');
    });

    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const taskId = e.dataTransfer.getData('text/plain');
      const newStatus = col.dataset.status;
      handleDrop(taskId, newStatus, project);
    });
  });
}

function handleDrop(taskId, newStatus, project) {
  const freshProject = Store.getById('projects', project.id);
  const tasks = [...(freshProject.tasks || [])];
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return;

  const task = tasks[taskIndex];

  // Block moving to done if dependencies unresolved
  if (newStatus === 'done' && isBlocked(task, tasks)) {
    const blockerNames = task.blockedBy
      .map(id => tasks.find(t => t.id === id))
      .filter(t => t && t.status !== 'done')
      .map(t => t.title)
      .join(', ');
    showToast(`Blocked by: ${blockerNames}`);
    return;
  }

  tasks[taskIndex] = { ...task, status: newStatus, updatedAt: new Date().toISOString() };
  persistTasks(freshProject, tasks);

  // Refresh the whole tasks section
  const section = document.querySelector('.tasks-section');
  if (section) {
    const parent = section.closest('.main-content') || section.parentElement;
    const refreshedProject = Store.getById('projects', project.id);
    renderTasks(parent, refreshedProject);
  }
}

function renderList(container, tasks, project) {
  container.innerHTML = `
    <div class="task-list">
      <div class="task-list-header">
        <span>Title</span><span>Status</span><span>Priority</span>
        <span>Assignee</span><span>Due Date</span><span>Subtasks</span>
      </div>
      ${tasks.map(task => {
        const blocked = isBlocked(task, tasks);
        const subtaskTotal = task.subtasks?.length || 0;
        const subtaskDone = task.subtasks?.filter(s => s.done).length || 0;
        const statusObj = STATUSES.find(s => s.value === task.status);
        return `
          <div class="task-list-row" data-task-id="${task.id}">
            <div class="task-list-row-title">
              ${blocked ? '🔒 ' : ''}${esc(task.title)}
            </div>
            <div><span class="status-badge status-${task.status}">${statusObj?.label || task.status}</span></div>
            <div><span class="priority-dot priority-${task.priority}"></span> ${task.priority}</div>
            <div>${task.assignee ? esc(task.assignee) : '—'}</div>
            <div>${task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</div>
            <div>${subtaskTotal > 0 ? `${subtaskDone}/${subtaskTotal}` : '—'}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Click row to expand
  container.querySelectorAll('.task-list-row').forEach(row => {
    row.addEventListener('click', () => {
      const taskId = row.dataset.taskId;
      const freshProject = Store.getById('projects', project.id);
      const task = (freshProject.tasks || []).find(t => t.id === taskId);
      if (task) {
        renderTaskExpand(row, task, freshProject, () => {
          const parent = container.closest('.tasks-section').parentElement;
          refresh(parent, freshProject);
        });
      }
    });
  });
}

function renderAddForm(container, project, onSave) {
  container.innerHTML = `
    <div class="task-add-form">
      <div class="form-grid">
        <div class="field">
          <label>Title <span class="required">*</span></label>
          <input type="text" id="new-task-title" placeholder="Task title" required>
        </div>
        <div class="field">
          <label>Priority</label>
          <select id="new-task-priority">
            ${PRIORITIES.map(p => `<option value="${p}" ${p === 'medium' ? 'selected' : ''}>${p}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>Assignee</label>
          <input type="text" id="new-task-assignee" placeholder="Person name">
        </div>
        <div class="field">
          <label>Due Date</label>
          <input type="date" id="new-task-due">
        </div>
      </div>
      <div class="field" style="margin-top:10px">
        <label>Description</label>
        <textarea id="new-task-desc" rows="2" placeholder="Optional notes..."></textarea>
      </div>
      <div class="task-expand-actions">
        <button class="btn btn-primary btn-small" id="save-new-task">Create Task</button>
        <button class="btn btn-secondary btn-small" id="cancel-new-task">Cancel</button>
      </div>
    </div>
  `;

  container.querySelector('#save-new-task').addEventListener('click', () => {
    const title = container.querySelector('#new-task-title').value.trim();
    if (!title) { showToast('Task title is required.'); return; }

    const now = new Date().toISOString();
    const newTask = {
      id: taskId(),
      title,
      description: container.querySelector('#new-task-desc').value.trim(),
      status: 'todo',
      priority: container.querySelector('#new-task-priority').value,
      assignee: container.querySelector('#new-task-assignee').value.trim(),
      dueDate: container.querySelector('#new-task-due').value || null,
      attachments: [],
      blockedBy: [],
      subtasks: [],
      createdAt: now,
      updatedAt: now
    };

    const freshProject = Store.getById('projects', project.id);
    const tasks = [...(freshProject.tasks || []), newTask];
    persistTasks(freshProject, tasks);
    showToast('Task created!');
    onSave();
  });

  container.querySelector('#cancel-new-task').addEventListener('click', () => {
    container.innerHTML = '';
  });
}

function renderTaskExpand(afterElement, task, project, onRefresh) {
  // Remove any existing expand
  document.querySelectorAll('.task-expand').forEach(el => el.remove());

  const expand = document.createElement('div');
  expand.className = 'task-expand';
  expand.innerHTML = `
    <div class="task-expand-field">
      <label>Title</label>
      <input type="text" value="${esc(task.title)}" data-field="title">
    </div>
    <div class="task-expand-field">
      <label>Description</label>
      <textarea data-field="description">${esc(task.description || '')}</textarea>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
      <div class="task-expand-field">
        <label>Status</label>
        <select data-field="status">
          ${STATUSES.map(s => `<option value="${s.value}" ${s.value === task.status ? 'selected' : ''}>${s.label}</option>`).join('')}
        </select>
      </div>
      <div class="task-expand-field">
        <label>Priority</label>
        <select data-field="priority">
          ${PRIORITIES.map(p => `<option value="${p}" ${p === task.priority ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="task-expand-field">
        <label>Due Date</label>
        <input type="date" value="${task.dueDate || ''}" data-field="dueDate">
      </div>
    </div>
    <div class="task-expand-field">
      <label>Assignee</label>
      <input type="text" value="${esc(task.assignee || '')}" data-field="assignee">
    </div>

    <div class="task-expand-field">
      <label>Subtasks (${task.subtasks?.filter(s => s.done).length || 0}/${task.subtasks?.length || 0})</label>
      <ul class="subtask-list">
        ${(task.subtasks || []).map(st => `
          <li class="subtask-item ${st.done ? 'done' : ''}">
            <input type="checkbox" ${st.done ? 'checked' : ''} data-subtask-id="${st.id}">
            <span class="subtask-title">${esc(st.title)}</span>
            <button class="subtask-delete" data-subtask-id="${st.id}">×</button>
          </li>
        `).join('')}
      </ul>
      <div class="add-subtask-form">
        <input type="text" placeholder="Add subtask..." id="new-subtask-input">
        <button class="btn btn-small" id="add-subtask-btn">+</button>
      </div>
    </div>

    ${renderDependencySection(task, project.tasks || [])}

    <div class="task-expand-actions">
      <button class="btn btn-primary btn-small" id="save-task-btn">Save</button>
      <button class="btn btn-danger btn-small" id="delete-task-btn">Delete</button>
      <button class="btn btn-secondary btn-small" id="close-task-btn">Close</button>
    </div>
  `;

  afterElement.after(expand);

  // Subtask checkbox toggle
  expand.querySelectorAll('.subtask-item input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const freshProject = Store.getById('projects', project.id);
      const tasks = [...(freshProject.tasks || [])];
      const t = tasks.find(t => t.id === task.id);
      const st = t.subtasks.find(s => s.id === cb.dataset.subtaskId);
      if (st) { st.done = cb.checked; }
      persistTasks(freshProject, tasks);
      onRefresh();
    });
  });

  // Delete subtask
  expand.querySelectorAll('.subtask-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const freshProject = Store.getById('projects', project.id);
      const tasks = [...(freshProject.tasks || [])];
      const t = tasks.find(t => t.id === task.id);
      t.subtasks = t.subtasks.filter(s => s.id !== btn.dataset.subtaskId);
      persistTasks(freshProject, tasks);
      onRefresh();
    });
  });

  // Add subtask
  expand.querySelector('#add-subtask-btn').addEventListener('click', () => {
    const input = expand.querySelector('#new-subtask-input');
    const title = input.value.trim();
    if (!title) return;
    const freshProject = Store.getById('projects', project.id);
    const tasks = [...(freshProject.tasks || [])];
    const t = tasks.find(t => t.id === task.id);
    t.subtasks.push({ id: taskId(), title, done: false });
    persistTasks(freshProject, tasks);
    onRefresh();
  });

  // Add dependency
  const depSelect = expand.querySelector('#add-dep-select');
  if (depSelect) {
    depSelect.addEventListener('change', () => {
      const depId = depSelect.value;
      if (!depId) return;
      const freshProject = Store.getById('projects', project.id);
      const tasks = [...(freshProject.tasks || [])];
      const t = tasks.find(t => t.id === task.id);
      if (!t.blockedBy.includes(depId)) t.blockedBy.push(depId);
      persistTasks(freshProject, tasks);
      onRefresh();
    });
  }

  // Save
  expand.querySelector('#save-task-btn').addEventListener('click', () => {
    const freshProject = Store.getById('projects', project.id);
    const tasks = [...(freshProject.tasks || [])];
    const idx = tasks.findIndex(t => t.id === task.id);
    if (idx === -1) return;
    tasks[idx] = {
      ...tasks[idx],
      title: expand.querySelector('[data-field="title"]').value.trim() || task.title,
      description: expand.querySelector('[data-field="description"]').value.trim(),
      status: expand.querySelector('[data-field="status"]').value,
      priority: expand.querySelector('[data-field="priority"]').value,
      dueDate: expand.querySelector('[data-field="dueDate"]').value || null,
      assignee: expand.querySelector('[data-field="assignee"]').value.trim(),
      updatedAt: new Date().toISOString()
    };
    persistTasks(freshProject, tasks);
    showToast('Task updated!');
    onRefresh();
  });

  // Delete
  expand.querySelector('#delete-task-btn').addEventListener('click', () => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    const freshProject = Store.getById('projects', project.id);
    let tasks = (freshProject.tasks || []).filter(t => t.id !== task.id);
    tasks = tasks.map(t => ({
      ...t,
      blockedBy: t.blockedBy.filter(id => id !== task.id)
    }));
    persistTasks(freshProject, tasks);
    showToast('Task deleted.');
    onRefresh();
  });

  // Close
  expand.querySelector('#close-task-btn').addEventListener('click', () => {
    expand.remove();
  });
}

function renderDependencySection(task, allTasks) {
  const available = allTasks.filter(t =>
    t.id !== task.id &&
    t.status !== 'done' &&
    !(task.blockedBy || []).includes(t.id)
  );
  const blockers = (task.blockedBy || [])
    .map(id => allTasks.find(t => t.id === id))
    .filter(Boolean);
  const blocking = getBlockingTasks(task, allTasks);

  return `
    <div class="dependency-section">
      <h5>Blocked by</h5>
      ${blockers.length === 0 ? '<p style="font-size:0.82rem;color:var(--color-text-secondary)">No blockers</p>' :
        blockers.map(b => `
          <div class="dependency-item">
            <span class="status-badge status-${b.status}">${b.status}</span>
            <span>${esc(b.title)}</span>
          </div>
        `).join('')}
      ${available.length > 0 ? `
        <div class="add-dependency-form">
          <select id="add-dep-select">
            <option value="">+ Add dependency...</option>
            ${available.map(t => `<option value="${t.id}">${esc(t.title)}</option>`).join('')}
          </select>
        </div>
      ` : ''}

      ${blocking.length > 0 ? `
        <h5 style="margin-top:10px">Blocking</h5>
        ${blocking.map(b => `
          <div class="dependency-item">
            <span>→ ${esc(b.title)}</span>
            <span class="status-badge status-${b.status}">${b.status}</span>
          </div>
        `).join('')}
      ` : ''}
    </div>
  `;
}
