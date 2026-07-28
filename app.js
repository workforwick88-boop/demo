/* ==========================================================================
   Nexus Studio Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initChart();
    initTaskManager();
    initThemeToggle();
    initSearch();
    initGlobalInteractions();
});

// Chart Render Engine
function initChart() {
    const chartContainer = document.getElementById('visual-chart');
    if (!chartContainer) return;

    const dataSets = {
        '7d': [
            { label: 'Mon', value: 45 },
            { label: 'Tue', value: 72 },
            { label: 'Wed', value: 60 },
            { label: 'Thu', value: 95 },
            { label: 'Fri', value: 80 },
            { label: 'Sat', value: 30 },
            { label: 'Sun', value: 55 }
        ],
        '30d': [
            { label: 'W1', value: 210 },
            { label: 'W2', value: 340 },
            { label: 'W3', value: 410 },
            { label: 'W4', value: 290 }
        ],
        '1y': [
            { label: 'Q1', value: 1200 },
            { label: 'Q2', value: 1850 },
            { label: 'Q3', value: 2100 },
            { label: 'Q4', value: 2450 }
        ]
    };

    function renderBars(range) {
        const dataset = dataSets[range] || dataSets['7d'];
        const maxValue = Math.max(...dataset.map(d => d.value));
        chartContainer.innerHTML = '';

        dataset.forEach(item => {
            const heightPercent = Math.round((item.value / maxValue) * 100);

            const group = document.createElement('div');
            group.className = 'chart-bar-group';

            group.innerHTML = `
                <div class="bar-wrapper">
                    <div class="bar-fill" style="height: 0%" data-height="${heightPercent}%" title="${item.label}: ${item.value} commits"></div>
                </div>
                <span class="bar-label">${item.label}</span>
            `;

            chartContainer.appendChild(group);
        });

        // Trigger animation
        setTimeout(() => {
            const fills = chartContainer.querySelectorAll('.bar-fill');
            fills.forEach(fill => {
                fill.style.height = fill.getAttribute('data-height');
            });
        }, 50);
    }

    renderBars('7d');

    // Timeframe selector
    const pills = document.querySelectorAll('#chart-timeframe .pill');
    pills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            pills.forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            const range = e.target.getAttribute('data-range');
            renderBars(range);
            showToast(`Updated chart view to ${e.target.textContent}`);
        });
    });
}

// Interactive Task Manager
function initTaskManager() {
    const btnAddTask = document.getElementById('btn-add-task');
    const inputContainer = document.getElementById('task-input-container');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');

    if (btnAddTask && inputContainer) {
        btnAddTask.addEventListener('click', () => {
            const isVisible = inputContainer.style.display !== 'none';
            inputContainer.style.display = isVisible ? 'none' : 'block';
            if (!isVisible) taskInput.focus();
        });
    }

    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && taskInput.value.trim() !== '') {
                addTask(taskInput.value.trim());
                taskInput.value = '';
                inputContainer.style.display = 'none';
            }
        });
    }

    function addTask(text) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <label class="checkbox-container">
                <input type="checkbox">
                <span class="checkmark"></span>
            </label>
            <span class="task-title">${escapeHtml(text)}</span>
            <span class="badge badge-primary">New</span>
        `;

        taskList.prepend(li);
        attachCheckboxHandler(li.querySelector('input[type="checkbox"]'));
        showToast('New task added to roadmap!');
    }

    function attachCheckboxHandler(checkbox) {
        checkbox.addEventListener('change', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (e.target.checked) {
                taskItem.classList.add('completed');
                const badge = taskItem.querySelector('.badge');
                if (badge) {
                    badge.className = 'badge badge-success';
                    badge.textContent = 'Done';
                }
                showToast('Task marked as completed!');
            } else {
                taskItem.classList.remove('completed');
                const badge = taskItem.querySelector('.badge');
                if (badge) {
                    badge.className = 'badge badge-primary';
                    badge.textContent = 'In Progress';
                }
            }
        });
    }

    const existingCheckboxes = taskList.querySelectorAll('input[type="checkbox"]');
    existingCheckboxes.forEach(attachCheckboxHandler);
}

// Theme Toggle Engine
function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        themeBtn.querySelector('i').className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        showToast(`Switched to ${isLight ? 'Light' : 'Dark'} theme`);
    });
}

// Global Search
function initSearch() {
    const searchInput = document.getElementById('global-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const tasks = document.querySelectorAll('.task-item');
        tasks.forEach(task => {
            const text = task.querySelector('.task-title').textContent.toLowerCase();
            task.style.display = text.includes(query) ? 'flex' : 'none';
        });
    });
}

// Global Interactions & Toast Notifications
function initGlobalInteractions() {
    const btnNewProject = document.getElementById('btn-new-project');
    if (btnNewProject) {
        btnNewProject.addEventListener('click', () => {
            showToast('Creating new project workspace...');
        });
    }

    const notifBtn = document.getElementById('notif-btn');
    if (notifBtn) {
        notifBtn.addEventListener('click', () => {
            showToast('Repo synced cleanly with GitHub!');
        });
    }
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-success"></i> <span>${escapeHtml(message)}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}
