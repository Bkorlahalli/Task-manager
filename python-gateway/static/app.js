const API_BASE = '';

async function api(method, path, body = null) {
    const opts = { method };
    if (body) {
        opts.headers = { 'Content-Type': 'application/json' };
        opts.body = JSON.stringify(body);
    }
    const res = await fetch(API_BASE + path, opts);
    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
    return data;
}

const $ = id => document.getElementById(id);
const taskList = $('task-list');
const taskForm = $('task-form');
const formTitle = $('form-title');
const submitBtn = $('submit-btn');
const cancelBtn = $('cancel-btn');
const loading = $('loading');
const errorDiv = $('error');
const refreshBtn = $('refresh-btn');

function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
}

function hideError() {
    errorDiv.style.display = 'none';
}

function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderTask(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;
    li.innerHTML = `
        <div class="task-content">
            <h3>${escapeHtml(task.title)}</h3>
            ${task.description ? `<p>${escapeHtml(task.description)}</p>` : ''}
            <div class="task-meta">
                <span class="status-badge status-${task.status}">${task.status}</span>
                · ${formatDate(task.createdAt)}
            </div>
        </div>
        <div class="task-actions">
            <button class="edit-btn" data-id="${task.id}">Edit</button>
            <button class="delete-btn" data-id="${task.id}">Delete</button>
        </div>
    `;
    li.querySelector('.edit-btn').addEventListener('click', () => loadTaskForEdit(task.id));
    li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
    return li;
}

function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

async function loadTasks() {
    hideError();
    showLoading(true);
    taskList.innerHTML = '';
    try {
        const tasks = await api('GET', '/tasks');
        showLoading(false);
        if (!tasks || tasks.length === 0) {
            taskList.innerHTML = '<li class="empty-state">No tasks yet. Add one above.</li>';
        } else {
            tasks.forEach(t => taskList.appendChild(renderTask(t)));
        }
    } catch (e) {
        showLoading(false);
        showError(e.message);
    }
}

async function loadTaskForEdit(id) {
    try {
        const task = await api('GET', `/task/${id}`);
        $('task-id').value = task.id;
        $('title').value = task.title;
        $('description').value = task.description || '';
        $('status').value = task.status;
        formTitle.textContent = 'Edit Task';
        submitBtn.textContent = 'Update Task';
        cancelBtn.style.display = 'inline-block';
    } catch (e) {
        showError(e.message);
    }
}

async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    try {
        await api('DELETE', `/task/${id}`);
        loadTasks();
    } catch (e) {
        showError(e.message);
    }
}

function resetForm() {
    $('task-id').value = '';
    $('title').value = '';
    $('description').value = '';
    $('status').value = 'TODO';
    formTitle.textContent = 'Add Task';
    submitBtn.textContent = 'Add Task';
    cancelBtn.style.display = 'none';
}

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();
    const id = $('task-id').value;
    const body = {
        title: $('title').value.trim(),
        description: $('description').value.trim(),
        status: $('status').value
    };
    try {
        if (id) {
            await api('PUT', `/task/${id}`, body);
        } else {
            await api('POST', '/task', body);
        }
        resetForm();
        loadTasks();
    } catch (e) {
        showError(e.message);
    }
});

cancelBtn.addEventListener('click', resetForm);
refreshBtn.addEventListener('click', loadTasks);

loadTasks();
