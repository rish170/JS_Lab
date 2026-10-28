/**
 * Kanso Workspace — Real-Time Task Dispatcher
 * Demonstrates: jQuery DOM Manipulation, Event Handling, localStorage, and AJAX Integration
 */

(function($) {
    'use strict';

    // Storage Keys
    const STORAGE_KEY_TASKS = 'kanso_tasks_v1';
    const STORAGE_KEY_LOG = 'kanso_log_v1';
    const STORAGE_KEY_VIEW = 'kanso_view_v1';

    // Application State
    let tasks = [];
    let activityLog = [];
    let currentView = 'board'; // 'board' or 'list'

    // Status Workflow Progression
    const STATUS_FLOW = ['todo', 'in-progress', 'done'];

    // Fallback Seed Data (Used if file:// protocol blocks local AJAX CORS)
    const DEFAULT_SEED_TASKS = [
        {
            id: 'task-101',
            title: 'Review database migration scripts',
            description: 'Verify indexes and foreign key constraints before applying migration v2.4 to production replica.',
            category: 'Engineering',
            priority: 'high',
            status: 'in-progress',
            dueDate: '2026-11-02',
            createdAt: new Date().toISOString()
        },
        {
            id: 'task-102',
            title: 'Design typography hierarchy for client portal',
            description: 'Establish editorial heading scales, line heights, and tabular figures for analytics tables.',
            category: 'Design',
            priority: 'medium',
            status: 'todo',
            dueDate: '2026-11-04',
            createdAt: new Date().toISOString()
        },
        {
            id: 'task-103',
            title: 'Optimize Webpack asset chunking',
            description: 'Separate vendor bundles and configure dynamic imports for route-based code splitting.',
            category: 'Performance',
            priority: 'medium',
            status: 'todo',
            dueDate: '2026-11-06',
            createdAt: new Date().toISOString()
        },
        {
            id: 'task-104',
            title: 'Publish API documentation v1.2',
            description: 'Document webhook retry policies, idempotency headers, and rate limiting status codes.',
            category: 'Documentation',
            priority: 'low',
            status: 'done',
            dueDate: '2026-10-27',
            createdAt: new Date().toISOString()
        },
        {
            id: 'task-105',
            title: 'Conduct security audit on OAuth2 refresh tokens',
            description: 'Verify token rotation policies and validate revocation endpoints against OWASP standards.',
            category: 'Security',
            priority: 'high',
            status: 'todo',
            dueDate: '2026-11-01',
            createdAt: new Date().toISOString()
        },
        {
            id: 'task-106',
            title: 'Draft quarterly infrastructure budget report',
            description: 'Compile cloud compute costs, egress traffic metrics, and forecasted reserved instance savings.',
            category: 'Operations',
            priority: 'low',
            status: 'in-progress',
            dueDate: '2026-11-08',
            createdAt: new Date().toISOString()
        }
    ];

    // =========================================================================
    // 1. Initialization
    // =========================================================================

    $(document).ready(function() {
        initLiveClock();
        loadSavedViewPreference();
        loadStoredActivities();

        // Check if data already exists in localStorage
        const storedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
        if (storedTasks) {
            try {
                tasks = JSON.parse(storedTasks);
                logEvent('Loaded ' + tasks.length + ' task(s) from localStorage', 'Storage');
                renderAll();
                setAjaxStatus('Storage Active', 'connected');
            } catch (err) {
                console.error('Failed to parse localStorage data:', err);
                fetchInitialDataViaAjax();
            }
        } else {
            // First time load: Fetch seed via AJAX
            fetchInitialDataViaAjax();
        }

        bindEventListeners();
    });

    // =========================================================================
    // 2. Real-Time Telemetry & Clock
    // =========================================================================

    function initLiveClock() {
        function updateClock() {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            $('#liveClock').text(timeStr);
        }
        updateClock();
        setInterval(updateClock, 1000);
    }

    function setAjaxStatus(text, stateClass) {
        $('#ajaxStatusText').text(text);
        $('#ajaxDot').removeClass('connected loading').addClass(stateClass || '');
    }

    // =========================================================================
    // 3. AJAX Integration (jQuery $.ajax)
    // =========================================================================

    function fetchInitialDataViaAjax(isManualTrigger) {
        setAjaxStatus('Fetching AJAX...', 'loading');

        $.ajax({
            url: 'initialTasks.json',
            type: 'GET',
            dataType: 'json',
            cache: false,
            beforeSend: function(xhr) {
                logEvent('Initiating jQuery AJAX GET request for initialTasks.json', 'AJAX');
            },
            success: function(response) {
                tasks = Array.isArray(response) ? response : (response.tasks || []);
                saveTasksToStorage();
                renderAll();
                setAjaxStatus('AJAX Connected', 'connected');
                logEvent('Successfully loaded ' + tasks.length + ' tasks via AJAX', 'AJAX');
            },
            error: function(xhr, status, errorThrown) {
                console.warn('AJAX request failed or restricted by browser CORS for local file://:', status, errorThrown);
                
                // Fallback to starter seed if opened via file:// without local server
                tasks = DEFAULT_SEED_TASKS;
                saveTasksToStorage();
                renderAll();

                const isLocalFile = window.location.protocol === 'file:';
                const msg = isLocalFile 
                    ? 'file:// CORS restriction detected. Loaded seed data with AJAX simulation.'
                    : 'AJAX endpoint unavailable. Loaded default seed tasks.';

                setAjaxStatus('Seed Loaded', 'connected');
                logEvent(msg, 'AJAX');
            }
        });
    }

    // =========================================================================
    // 4. localStorage Helpers
    // =========================================================================

    function saveTasksToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
        } catch (e) {
            console.error('Error saving tasks to localStorage:', e);
        }
    }

    function saveActivityLogToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY_LOG, JSON.stringify(activityLog.slice(0, 40)));
        } catch (e) {
            console.error('Error saving activity log:', e);
        }
    }

    function loadStoredActivities() {
        const storedLog = localStorage.getItem(STORAGE_KEY_LOG);
        if (storedLog) {
            try {
                activityLog = JSON.parse(storedLog);
                renderActivityLog();
            } catch (e) {
                activityLog = [];
            }
        }
    }

    function loadSavedViewPreference() {
        const savedView = localStorage.getItem(STORAGE_KEY_VIEW);
        if (savedView === 'list' || savedView === 'board') {
            currentView = savedView;
        }
        applyViewMode(currentView);
    }

    function clearAllStorage() {
        if (confirm('Are you sure you want to clear all tasks and reset workspace?')) {
            localStorage.removeItem(STORAGE_KEY_TASKS);
            localStorage.removeItem(STORAGE_KEY_LOG);
            tasks = [];
            activityLog = [];
            renderAll();
            renderActivityLog();
            setAjaxStatus('Reset Complete', '');
            logEvent('Workspace reset and localStorage cleared', 'Storage');
        }
    }

    // =========================================================================
    // 5. DOM Manipulation & Rendering
    // =========================================================================

    function renderAll() {
        renderMetrics();
        if (currentView === 'board') {
            renderBoardView();
        } else {
            renderListView();
        }
    }

    // Render Metrics and Sprint Progress
    function renderMetrics() {
        const total = tasks.length;
        const todoCount = tasks.filter(t => t.status === 'todo').length;
        const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
        const doneCount = tasks.filter(t => t.status === 'done').length;

        $('#statTotal').text(total);
        $('#statTodo').text(todoCount);
        $('#statInProgress').text(inProgressCount);
        $('#statDone').text(doneCount);

        $('#countTodo').text(todoCount);
        $('#countInProgress').text(inProgressCount);
        $('#countDone').text(doneCount);

        const completionRatio = total > 0 ? Math.round((doneCount / total) * 100) : 0;
        $('#progressPercentage').text(completionRatio + '%');
        $('#progressBar').css('width', completionRatio + '%');
    }

    // Filter tasks based on search & dropdowns
    function getFilteredTasks() {
        const query = ($('#searchInput').val() || '').trim().toLowerCase();
        const selectedPriority = $('#priorityFilter').val();
        const selectedCategory = $('#categoryFilter').val();

        return tasks.filter(function(task) {
            const matchesQuery = !query || 
                (task.title && task.title.toLowerCase().indexOf(query) !== -1) ||
                (task.description && task.description.toLowerCase().indexOf(query) !== -1);

            const matchesPriority = (selectedPriority === 'all') || (task.priority === selectedPriority);
            const matchesCategory = (selectedCategory === 'all') || (task.category === selectedCategory);

            return matchesQuery && matchesPriority && matchesCategory;
        });
    }

    // Render Kanban Board View
    function renderBoardView() {
        const filtered = getFilteredTasks();

        const $tasksTodo = $('#tasksTodo').empty();
        const $tasksInProgress = $('#tasksInProgress').empty();
        const $tasksDone = $('#tasksDone').empty();

        const containers = {
            'todo': $tasksTodo,
            'in-progress': $tasksInProgress,
            'done': $tasksDone
        };

        STATUS_FLOW.forEach(function(status) {
            const colTasks = filtered.filter(t => t.status === status);
            const $container = containers[status];

            if (colTasks.length === 0) {
                $container.append('<div class="column-empty-state">No matching tasks</div>');
            } else {
                colTasks.forEach(function(task) {
                    const $card = buildTaskCard(task);
                    $container.append($card);
                });
            }
        });
    }

    // Build Single Kanban Card using jQuery DOM methods
    function buildTaskCard(task) {
        const $card = $('<div>')
            .addClass('task-card')
            .attr('data-id', task.id);

        // Top Metadata: Category & Priority
        const $metaTop = $('<div>').addClass('task-meta-top');
        const $catTag = $('<span>').addClass('category-tag').text(task.category || 'General');
        const $priTag = $('<span>')
            .addClass('priority-tag priority-' + (task.priority || 'medium'))
            .text(task.priority || 'Medium');
        $metaTop.append($catTag, $priTag);

        // Title & Description
        const $title = $('<div>')
            .addClass('task-title')
            .text(task.title)
            .attr('title', 'Click to edit task');

        const $desc = $('<div>')
            .addClass('task-desc')
            .text(task.description || 'No description provided.');

        // Bottom Metadata & Actions
        const $metaBottom = $('<div>').addClass('task-meta-bottom');
        
        const dateDisplay = task.dueDate ? formatDate(task.dueDate) : 'No due date';
        const $dueDate = $('<span>')
            .addClass('task-due-date')
            .html('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ' + dateDisplay);

        const $actions = $('<div>').addClass('task-actions');

        // Move Backward Button
        if (task.status !== 'todo') {
            const $btnPrev = $('<button>')
                .addClass('btn-card-action btn-move-prev')
                .attr('type', 'button')
                .attr('title', 'Move backward')
                .html('&larr;');
            $actions.append($btnPrev);
        }

        // Move Forward Button
        if (task.status !== 'done') {
            const $btnNext = $('<button>')
                .addClass('btn-card-action btn-move-next')
                .attr('type', 'button')
                .attr('title', 'Move forward')
                .html('&rarr;');
            $actions.append($btnNext);
        }

        // Delete Button
        const $btnDelete = $('<button>')
            .addClass('btn-card-action btn-delete')
            .attr('type', 'button')
            .attr('title', 'Delete task')
            .html('&times;');
        $actions.append($btnDelete);

        $metaBottom.append($dueDate, $actions);

        $card.append($metaTop, $title, $desc, $metaBottom);
        return $card;
    }

    // Render Alternative List View
    function renderListView() {
        const filtered = getFilteredTasks();
        const $listBody = $('#listBody').empty();

        if (filtered.length === 0) {
            $listBody.append('<div style="padding: 30px; text-align: center; color: var(--text-tertiary);">No tasks found.</div>');
            return;
        }

        filtered.forEach(function(task) {
            const $row = $('<div>')
                .addClass('list-row')
                .toggleClass('done-row', task.status === 'done')
                .attr('data-id', task.id);

            const statusLabel = task.status === 'todo' ? 'To Do' : (task.status === 'in-progress' ? 'In Progress' : 'Done');
            const $colStatus = $('<div>').html('<span class="column-count-badge">' + statusLabel + '</span>');
            const $colTitle = $('<div>').addClass('list-title-text').text(task.title);
            const $colCat = $('<div>').html('<span class="category-tag">' + (task.category || 'General') + '</span>');
            const $colPri = $('<div>').html('<span class="priority-tag priority-' + task.priority + '">' + task.priority + '</span>');
            const $colDue = $('<div>').addClass('task-due-date').text(task.dueDate || '—');

            const $colActions = $('<div>').addClass('task-actions');
            const $btnEdit = $('<button>').addClass('btn-card-action btn-edit-list').text('Edit');
            const $btnDel = $('<button>').addClass('btn-card-action btn-delete').text('Delete');
            $colActions.append($btnEdit, $btnDel);

            $row.append($colStatus, $colTitle, $colCat, $colPri, $colDue, $colActions);
            $listBody.append($row);
        });
    }

    // =========================================================================
    // 6. Real-Time Activity Log Stream
    // =========================================================================

    function logEvent(message, category) {
        const timeNow = new Date();
        const timestamp = timeNow.toLocaleTimeString('en-US', { hour12: false });
        
        const entry = {
            id: 'evt-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            time: timestamp,
            category: category || 'Action',
            text: message
        };

        activityLog.unshift(entry);
        saveActivityLogToStorage();

        // Dynamically prepend to DOM with smooth slide-in
        const $entryEl = buildActivityElement(entry).hide();
        $('#activityStream').prepend($entryEl);
        $entryEl.slideDown(150);

        $('#activityCount').text(activityLog.length + ' event' + (activityLog.length === 1 ? '' : 's'));
    }

    function buildActivityElement(item) {
        const badgeClass = item.category === 'AJAX' ? 'badge-ajax' : (item.category === 'Storage' ? 'badge-storage' : '');
        
        return $('<div>')
            .addClass('activity-item')
            .append($('<span>').addClass('activity-time').text('[' + item.time + ']'))
            .append($('<span>').addClass('activity-badge ' + badgeClass).text(item.category))
            .append($('<span>').addClass('activity-text').text(item.text));
    }

    function renderActivityLog() {
        const $stream = $('#activityStream').empty();
        activityLog.forEach(function(item) {
            $stream.append(buildActivityElement(item));
        });
        $('#activityCount').text(activityLog.length + ' event' + (activityLog.length === 1 ? '' : 's'));
    }

    // =========================================================================
    // 7. Event Handling
    // =========================================================================

    function bindEventListeners() {

        // Real-Time Search Filtering
        $('#searchInput').on('input', function() {
            const query = $(this).val();
            $('#clearSearchBtn').toggle(query.length > 0);
            renderAll();
        });

        $('#clearSearchBtn').on('click', function() {
            $('#searchInput').val('').focus();
            $(this).hide();
            renderAll();
        });

        // Dropdown Filters
        $('#priorityFilter, #categoryFilter').on('change', function() {
            renderAll();
        });

        // View Mode Switcher
        $('#viewBoardBtn').on('click', function() {
            applyViewMode('board');
        });
        $('#viewListBtn').on('click', function() {
            applyViewMode('list');
        });

        // Manual Trigger for AJAX Fetch
        $('#btnFetchAjax').on('click', function() {
            fetchInitialDataViaAjax(true);
        });

        // Clear Storage Button
        $('#btnClearStorage').on('click', function() {
            clearAllStorage();
        });

        // Clear Activity Log Button
        $('#btnClearActivity').on('click', function() {
            activityLog = [];
            saveActivityLogToStorage();
            renderActivityLog();
        });

        // Toggle Activity Drawer
        $('#btnToggleActivity').on('click', function() {
            const $stream = $('#activityStream');
            $stream.slideToggle(200);
            $(this).css('transform', $stream.is(':visible') ? 'rotate(0deg)' : 'rotate(180deg)');
        });

        // Quick Add from Column Header
        $(document).on('click', '.btn-quick-add', function() {
            const targetStatus = $(this).data('quick-status');
            openModalForNew(targetStatus);
        });

        // Open Modal Button
        $('#btnOpenModal').on('click', function() {
            openModalForNew('todo');
        });

        // Close Modal Handlers
        $('#btnCloseModal, #btnCancelModal').on('click', function() {
            closeModal();
        });

        // Close modal on outside click
        $('#taskModal').on('click', function(e) {
            if ($(e.target).is('#taskModal')) {
                closeModal();
            }
        });

        // Keyboard Shortcut: ESC to close modal
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape' && $('#taskModal').is(':visible')) {
                closeModal();
            }
        });

        // Form Submit: Add or Edit Task
        $('#taskForm').on('submit', function(e) {
            e.preventDefault();
            handleFormSubmit();
        });

        // Move Forward Button
        $(document).on('click', '.btn-move-next', function(e) {
            e.stopPropagation();
            const taskId = $(this).closest('.task-card').data('id');
            shiftTaskStatus(taskId, 1);
        });

        // Move Backward Button
        $(document).on('click', '.btn-move-prev', function(e) {
            e.stopPropagation();
            const taskId = $(this).closest('.task-card').data('id');
            shiftTaskStatus(taskId, -1);
        });

        // Delete Task Button
        $(document).on('click', '.btn-delete', function(e) {
            e.stopPropagation();
            const $card = $(this).closest('.task-card, .list-row');
            const taskId = $card.data('id');
            deleteTask(taskId, $card);
        });

        // Click on Task Title to Edit
        $(document).on('click', '.task-title, .btn-edit-list', function() {
            const taskId = $(this).closest('.task-card, .list-row').data('id');
            openModalForEdit(taskId);
        });
    }

    // =========================================================================
    // 8. Task Actions & State Updates
    // =========================================================================

    function applyViewMode(mode) {
        currentView = mode;
        localStorage.setItem(STORAGE_KEY_VIEW, mode);

        if (mode === 'board') {
            $('#viewBoardBtn').addClass('active');
            $('#viewListBtn').removeClass('active');
            $('#boardContainer').show();
            $('#listContainer').hide();
        } else {
            $('#viewListBtn').addClass('active');
            $('#viewBoardBtn').removeClass('active');
            $('#boardContainer').hide();
            $('#listContainer').show();
        }
        renderAll();
    }

    function shiftTaskStatus(taskId, delta) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const currentIndex = STATUS_FLOW.indexOf(task.status);
        const newIndex = currentIndex + delta;

        if (newIndex >= 0 && newIndex < STATUS_FLOW.length) {
            const prevStatus = task.status;
            task.status = STATUS_FLOW[newIndex];
            saveTasksToStorage();
            renderAll();
            logEvent('Task "' + task.title + '" shifted from ' + prevStatus + ' to ' + task.status, 'DOM Update');
        }
    }

    function deleteTask(taskId, $element) {
        const task = tasks.find(t => t.id === taskId);
        const taskTitle = task ? task.title : taskId;

        // jQuery animation before removal
        $element.fadeOut(180, function() {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasksToStorage();
            renderAll();
            logEvent('Deleted task: "' + taskTitle + '"', 'Storage');
        });
    }

    function openModalForNew(defaultStatus) {
        $('#modalHeading').text('Create New Task');
        $('#editTaskId').val('');
        $('#taskForm')[0].reset();
        $('#taskStatus').val(defaultStatus || 'todo');
        $('#titleError').hide();
        $('#taskModal').fadeIn(150);
        $('#taskTitle').focus();
    }

    function openModalForEdit(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        $('#modalHeading').text('Edit Task');
        $('#editTaskId').val(task.id);
        $('#taskTitle').val(task.title);
        $('#taskDescription').val(task.description || '');
        $('#taskCategory').val(task.category || 'Engineering');
        $('#taskPriority').val(task.priority || 'medium');
        $('#taskStatus').val(task.status || 'todo');
        $('#taskDueDate').val(task.dueDate || '');
        $('#titleError').hide();

        $('#taskModal').fadeIn(150);
        $('#taskTitle').focus();
    }

    function closeModal() {
        $('#taskModal').fadeOut(120);
        $('#taskForm')[0].reset();
        $('#titleError').hide();
    }

    function handleFormSubmit() {
        const title = $('#taskTitle').val().trim();
        if (!title) {
            $('#titleError').show();
            $('#taskTitle').focus();
            return;
        }

        const editId = $('#editTaskId').val();
        const description = $('#taskDescription').val().trim();
        const category = $('#taskCategory').val();
        const priority = $('#taskPriority').val();
        const status = $('#taskStatus').val();
        const dueDate = $('#taskDueDate').val();

        if (editId) {
            // Update existing
            const task = tasks.find(t => t.id === editId);
            if (task) {
                task.title = title;
                task.description = description;
                task.category = category;
                task.priority = priority;
                task.status = status;
                task.dueDate = dueDate;
                logEvent('Updated task: "' + title + '"', 'Edit');
            }
        } else {
            // Create new
            const newTask = {
                id: 'task-' + Date.now(),
                title: title,
                description: description,
                category: category,
                priority: priority,
                status: status,
                dueDate: dueDate,
                createdAt: new Date().toISOString()
            };
            tasks.unshift(newTask);
            logEvent('Created new task: "' + title + '" in ' + status, 'DOM Create');
        }

        saveTasksToStorage();
        renderAll();
        closeModal();
    }

    // Format ISO date (YYYY-MM-DD) to friendly string
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const date = new Date(parts[0], parts[1] - 1, parts[2]);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return dateStr;
    }

})(jQuery);

