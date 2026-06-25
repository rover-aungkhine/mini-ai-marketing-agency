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
  container.innerHTML = '<p>List view — coming in Task 4</p>';
}

function renderAddForm(container, project, onSave) {
  container.innerHTML = '<p>Add form — coming in Task 5</p>';
}
