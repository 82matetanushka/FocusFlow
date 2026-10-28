/* ============================================================
   FOCUSFLOW - MAIN JAVASCRIPT
   Contains: Dashboard, Focus Room Timer, and Task Manager
   Separate files: settings.js, analytics.js, and habits.js
============================================================ */


/* ==========================================
   1. MOCKAPI CONFIGURATION
========================================== */

const dashboardAPI =
    "https://6ac5df0dbea0e72cf5c8261e.mockapi.io/FocusFlowTask";


/* ==========================================
   2. DISPLAY CURRENT DATE
========================================== */

function displayDashboardDate() {
    const dateElement = document.getElementById("current-date");

    if (dateElement) {
        const today = new Date();

        dateElement.textContent = today.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }
}


/* ==========================================
   3. DISPLAY FOOTER YEAR
========================================== */

function displayFooterYear() {
    const yearElement = document.getElementById("footer-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}


/* ==========================================
   4. DISPLAY WELCOME GREETING
========================================== */

function displayWelcomeGreeting() {
    const greetingElement = document.querySelector(
        ".welcome-content h2"
    );

    if (!greetingElement) return;

    const hour = new Date().getHours();
    let greeting;

    if (hour < 12) {
        greeting = "Good Morning, User!";
    } else if (hour < 17) {
        greeting = "Good Afternoon, User!";
    } else {
        greeting = "Good Evening, User!";
    }

    greetingElement.textContent = greeting;
}


/* ==========================================
   5. LOAD DASHBOARD TASKS
========================================== */

async function loadDashboardTasks() {
    const taskList = document.getElementById(
        "dashboard-task-list"
    );

    // Run only on the Dashboard page.
    if (!taskList) return;

    try {
        const response = await fetch(dashboardAPI);

        if (!response.ok) {
            throw new Error("Unable to retrieve tasks.");
        }

        const tasks = await response.json();

        updateDashboardStatistics(tasks);
        displayDashboardTaskList(tasks);

    } catch (error) {
        console.error("Dashboard error:", error);

        taskList.innerHTML = `
            <div class="empty-task-message">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>Unable to load tasks. Please check your internet connection.</p>
                <button type="button" id="retry-dashboard">
                    Try Again
                </button>
            </div>
        `;

        const retryButton = document.getElementById(
            "retry-dashboard"
        );

        if (retryButton) {
            retryButton.addEventListener(
                "click",
                loadDashboardTasks
            );
        }
    }
}


/* ==========================================
   6. COMPLETE TASK FROM DASHBOARD
========================================== */

function setupDashboardTaskCompletion() {
    const taskList = document.getElementById(
        "dashboard-task-list"
    );

    if (!taskList) return;

    taskList.addEventListener("change", async function (event) {
        const checkbox = event.target.closest(
            ".dashboard-task-checkbox"
        );

        if (!checkbox) return;

        const taskId = checkbox.dataset.taskId;
        const isChecked = checkbox.checked;

        checkbox.disabled = true;

        try {
            // Get the latest task records from MockAPI.
            const getResponse = await fetch(dashboardAPI);

            if (!getResponse.ok) {
                throw new Error("Unable to load task data.");
            }

            const tasks = await getResponse.json();

            const task = tasks.find(function (item) {
                return String(item.id) === String(taskId);
            });

            if (!task) {
                throw new Error("Task was not found.");
            }

            // Save the updated task status.
            const now = new Date();

            const today =
                `${now.getFullYear()}-` +
                `${String(now.getMonth() + 1).padStart(2, "0")}-` +
                `${String(now.getDate()).padStart(2, "0")}`;

            const updatedTask = {
                ...task,
                status: isChecked ? "completed" : "pending",
                completedAt: isChecked ? today : null
            };

            const updateResponse = await fetch(
                `${dashboardAPI}/${encodeURIComponent(taskId)}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedTask)
                }
            );

            if (!updateResponse.ok) {
                throw new Error("Unable to update task status.");
            }

            // Reload statistics and tasks.
            await loadDashboardTasks();

        } catch (error) {
            console.error("Dashboard completion error:", error);

            // Restore the checkbox if saving failed.
            checkbox.checked = !isChecked;

            alert("Could not update the task. Please try again.");

        } finally {
            checkbox.disabled = false;
        }
    });
}


/* ==========================================
   7. UPDATE DASHBOARD STATISTICS
========================================== */

function updateDashboardStatistics(tasks) {
    const total = tasks.length;

    const completed = tasks.filter(function (task) {
        return String(task.status).toLowerCase() === "completed";
    }).length;

    const pending = total - completed;

    const percentage = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    // Update summary cards.
    const totalElement = document.getElementById("total-tasks");
    const completedElement = document.getElementById("completed-tasks");
    const pendingElement = document.getElementById("pending-tasks");
    const rateElement = document.getElementById("completion-rate");

    if (totalElement) {
        totalElement.textContent = total;
    }

    if (completedElement) {
        completedElement.textContent = completed;
    }

    if (pendingElement) {
        pendingElement.textContent = pending;
    }

    if (rateElement) {
        rateElement.textContent = percentage + "%";
    }

    // Update progress details.
    const progressCompleted = document.getElementById(
        "progress-completed"
    );

    const progressPending = document.getElementById(
        "progress-pending"
    );

    const progressTotal = document.getElementById(
        "progress-total"
    );

    const progressPercentage = document.getElementById(
        "progress-percentage"
    );

    const progressCircle = document.getElementById(
        "progress-circle"
    );

    if (progressCompleted) {
        progressCompleted.textContent = completed;
    }

    if (progressPending) {
        progressPending.textContent = pending;
    }

    if (progressTotal) {
        progressTotal.textContent = total;
    }

    if (progressPercentage) {
        progressPercentage.textContent = percentage + "%";
    }

    // Update circular progress.
    if (progressCircle) {
        const degrees = (percentage / 100) * 360;

        progressCircle.style.setProperty(
            "--progress",
            degrees + "deg"
        );

        progressCircle.setAttribute(
            "aria-valuenow",
            percentage
        );
    }
}


/* ==========================================
   8. DISPLAY TODAY'S TASKS
========================================== */

function displayDashboardTaskList(tasks) {
    const taskList = document.getElementById(
        "dashboard-task-list"
    );

    if (!taskList) return;

    // Show a message if no tasks exist.
    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-task-message">
                <i class="fa-solid fa-list-check"></i>
                <p>No tasks yet. Start planning your day!</p>
                <a href="tasks.html">Go to Task Manager</a>
            </div>
        `;

        return;
    }

    // Display up to five tasks on the dashboard.
    const visibleTasks = tasks.slice(0, 5);

    taskList.innerHTML = visibleTasks.map(function (task) {
        const isCompleted =
            String(task.status).toLowerCase() === "completed";

        const taskName = escapeDashboardHTML(
            task.name || "Untitled Task"
        );

        const priority = String(
            task.priority || "Medium"
        ).toLowerCase();

        const safePriority = [
            "high",
            "medium",
            "low"
        ].includes(priority) ? priority : "medium";

        const priorityLabel =
            safePriority.charAt(0).toUpperCase() +
            safePriority.slice(1);

        return `
            <div class="task-row ${isCompleted ? "completed" : ""}">

                <input
                    type="checkbox"
                    class="dashboard-task-checkbox"
                    data-task-id="${escapeDashboardHTML(task.id)}"
                    ${isCompleted ? "checked" : ""}
                    aria-label="Mark ${taskName} as completed"
                >

                <span class="task-name">${taskName}</span>

                <span class="task-priority ${safePriority}">
                    ${priorityLabel}
                </span>

            </div>
        `;
    }).join("");
}


/* ==========================================
   9. SAFELY DISPLAY TASK TEXT
========================================== */

function escapeDashboardHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


/* ==========================================
   10. MOBILE SIDEBAR TOGGLE
========================================== */

function setupDashboardSidebar() {
    const menuButton = document.getElementById("menu-toggle");
    const sidebar = document.querySelector(".sidebar");

    if (!menuButton || !sidebar) return;

    menuButton.addEventListener("click", function () {
        sidebar.classList.toggle("open");
    });

    // Close the sidebar when a navigation link is selected.
    const navigationLinks = sidebar.querySelectorAll(".nav-link");

    navigationLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            sidebar.classList.remove("open");
        });
    });

    // Close the sidebar when clicking outside on mobile.
    document.addEventListener("click", function (event) {
        if (window.innerWidth > 768) return;

        if (
            !sidebar.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {
            sidebar.classList.remove("open");
        }
    });
}


/* ==========================================
   11. INITIALIZE DASHBOARD
========================================== */

function initializeDashboard() {
    displayDashboardDate();
    displayFooterYear();
    displayWelcomeGreeting();
    setupDashboardSidebar();
    setupDashboardTaskCompletion();
    loadDashboardTasks();
}


/* ==========================================
   12. START DASHBOARD
========================================== */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeDashboard
    );
} else {
    initializeDashboard();
}


/* ============================================================
   13. FOCUS ROOM TIMER
============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    const timerDisplay = document.getElementById("timer-display");

    // Run only on the Focus Room page.
    if (!timerDisplay) return;

    const startButton = document.getElementById("start-timer");
    const pauseButton = document.getElementById("pause-timer");
    const resetButton = document.getElementById("reset-timer");

    const modeButtons = document.querySelectorAll(".timer-mode");

    let timerInterval = null;
    let timeLeft = 25 * 60;
    let isRunning = false;
    let currentMode = "pomodoro";

    const timerModes = {
        pomodoro: 25 * 60,
        short: 5 * 60,
        long: 15 * 60
    };

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return (
            String(minutes).padStart(2, "0") +
            ":" +
            String(remainingSeconds).padStart(2, "0")
        );
    }

    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(timeLeft);
    }

    function updateButtons() {
        if (startButton) {
            startButton.disabled = isRunning;
        }

        if (pauseButton) {
            pauseButton.disabled = !isRunning;
        }
    }

    function stopTimer() {
        clearInterval(timerInterval);

        timerInterval = null;
        isRunning = false;

        updateButtons();
    }

    function startTimer() {
        if (isRunning) return;

        if (timeLeft <= 0) {
            timeLeft = timerModes[currentMode];
        }

        isRunning = true;
        updateButtons();

        timerInterval = setInterval(function () {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();

            } else {
                stopTimer();

                // Save completed focus sessions for Analytics.
                if (currentMode === "pomodoro") {
                    try {
                        const history = JSON.parse(
                            localStorage.getItem(
                                "focusFlowFocusHistory"
                            ) || "[]"
                        );

                        const now = new Date();

                        const today =
                            `${now.getFullYear()}-` +
                            `${String(now.getMonth() + 1).padStart(2, "0")}-` +
                            `${String(now.getDate()).padStart(2, "0")}`;

                        history.push({
                            date: today,
                            minutes: 25,
                            completedAt: now.toISOString()
                        });

                        localStorage.setItem(
                            "focusFlowFocusHistory",
                            JSON.stringify(history)
                        );

                    } catch (error) {
                        console.error(
                            "Could not save focus history:",
                            error
                        );
                    }
                }

                alert("Focus session completed! Great work!");
            }
        }, 1000);
    }

    function pauseTimer() {
        stopTimer();
    }

    function resetTimer() {
        stopTimer();

        timeLeft = timerModes[currentMode];

        updateTimerDisplay();
    }

    function selectMode(button) {
        const selectedMode = button.dataset.mode ||
            (
                button.dataset.minutes === "25" ? "pomodoro" :
                button.dataset.minutes === "5" ? "short" :
                button.dataset.minutes === "15" ? "long" : ""
            );

        if (!timerModes[selectedMode]) return;

        stopTimer();

        currentMode = selectedMode;
        timeLeft = timerModes[currentMode];

        modeButtons.forEach(function (modeButton) {
            modeButton.classList.remove("active");
        });

        button.classList.add("active");

        updateTimerDisplay();
    }

    if (startButton) {
        startButton.addEventListener("click", startTimer);
    }

    if (pauseButton) {
        pauseButton.addEventListener("click", pauseTimer);
    }

    if (resetButton) {
        resetButton.addEventListener("click", resetTimer);
    }

    modeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            selectMode(button);
        });
    });

    updateTimerDisplay();
    updateButtons();
});


/* ============================================================
   14. TASK MANAGER
============================================================ */

(function () {
    const taskForm = document.getElementById("task-form");

    // Run only on tasks.html.
    if (!taskForm) return;

    const API_URL =
        "https://6ac5df0dbea0e72cf5c8261e.mockapi.io/FocusFlowTask";

    const taskName = document.getElementById("task-name");
    const taskPriority = document.getElementById("task-priority");
    const taskDueDate = document.getElementById("task-due-date");
    const taskDescription = document.getElementById("task-description");

    const taskList = document.getElementById("task-list");
    const taskSearch = document.getElementById("task-search");
    const statusFilter = document.getElementById("task-status-filter");
    const priorityFilter = document.getElementById("task-priority-filter");

    const totalElement = document.getElementById("tasks-total");
    const completedElement = document.getElementById("tasks-completed");
    const pendingElement = document.getElementById("tasks-pending");

    const resultCount = document.getElementById("task-result-count");
    const messageElement = document.getElementById("task-form-message");
    const addButton = document.getElementById("add-task-button");
    const refreshButton = document.getElementById("refresh-tasks");

    const dateElement = document.getElementById("tasks-date");
    const yearElement = document.getElementById("footer-year");

    let tasks = [];
    let isLoading = false;
    let isSaving = false;

    // Display today's date.
    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    // Display current year.
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Safely display text inside HTML.
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            const characters = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return characters[character];
        });
    }

    // Check task status.
    function isTaskCompleted(task) {
        return String(task.status ?? "").toLowerCase() === "completed";
    }

    // Display form messages.
    function showMessage(message, type) {
        if (!messageElement) return;

        messageElement.textContent = message;

        messageElement.style.color =
            type === "success" ? "#43784d" : "#b34337";
    }

    // Load tasks from MockAPI.
    async function loadTasks() {
        if (isLoading) return;

        isLoading = true;

        taskList.innerHTML = `
            <div class="task-loading">
                <i class="fa-solid fa-spinner"></i>
                <p>Loading your tasks...</p>
            </div>
        `;

        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Unable to load tasks.");
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("Invalid task list.");
            }

            tasks = data;

            updateStatistics();
            renderTasks();

        } catch (error) {
            console.error("Load tasks error:", error);

            taskList.innerHTML = `
                <div class="task-error">
                    <p>Unable to load tasks. Check your internet connection.</p>
                    <button type="button" id="retry-load-tasks">
                        Try Again
                    </button>
                </div>
            `;

            resultCount.textContent = "Tasks could not be loaded.";

            const retryButton =
                document.getElementById("retry-load-tasks");

            if (retryButton) {
                retryButton.addEventListener("click", loadTasks);
            }

        } finally {
            isLoading = false;
        }
    }

    // Update task statistics.
    function updateStatistics() {
        const completedTasks = tasks.filter(isTaskCompleted).length;
        const pendingTasks = tasks.length - completedTasks;

        totalElement.textContent = tasks.length;
        completedElement.textContent = completedTasks;
        pendingElement.textContent = pendingTasks;
    }

    // Render filtered tasks.
    function renderTasks() {
        const searchText = taskSearch.value.trim().toLowerCase();
        const selectedStatus = statusFilter.value;
        const selectedPriority = priorityFilter.value;

        const filteredTasks = tasks.filter(function (task) {
            const name = String(
                task.name ?? task.title ?? ""
            ).toLowerCase();

            const description = String(
                task.description ?? ""
            ).toLowerCase();

            const matchesSearch =
                name.includes(searchText) ||
                description.includes(searchText);

            const completed = isTaskCompleted(task);

            const matchesStatus =
                selectedStatus === "all" ||
                (selectedStatus === "completed" && completed) ||
                (selectedStatus === "pending" && !completed);

            const taskPriority = String(
                task.priority ?? "Medium"
            ).toLowerCase();

            const matchesPriority =
                selectedPriority === "all" ||
                taskPriority === selectedPriority.toLowerCase();

            return matchesSearch && matchesStatus && matchesPriority;
        });

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="task-empty">
                    <i class="fa-solid fa-clipboard-check"></i>
                    <p>No tasks found.</p>
                    <p>Add a task or change your search and filters.</p>
                </div>
            `;

            resultCount.textContent = "0 tasks shown";
            return;
        }

        taskList.innerHTML = filteredTasks.map(function (task) {
            const completed = isTaskCompleted(task);

            const name = escapeHTML(
                task.name ?? task.title ?? "Untitled task"
            );

            const description = escapeHTML(
                task.description ?? ""
            );

            const priority = String(task.priority ?? "Medium");

            const safePriority = ["high", "medium", "low"]
                .includes(priority.toLowerCase())
                ? priority.toLowerCase()
                : "medium";

            const dueDate = task.dueDate
                ? escapeHTML(task.dueDate)
                : "";

            const taskId = escapeHTML(task.id);

            return `
                <article class="task-row ${completed ? "completed" : ""}"
                         data-task-id="${taskId}">

                    <div class="task-row-content">
                        <h3>${name}</h3>

                        ${description ? `<p>${description}</p>` : ""}

                        <div class="task-row-meta">
                            <span class="task-badge priority-${safePriority}">
                                ${escapeHTML(priority)} Priority
                            </span>

                            <span class="task-badge task-status-badge">
                                ${completed ? "Completed" : "Pending"}
                            </span>

                            ${dueDate
                                ? `<span class="task-due-date">
                                    <i class="fa-regular fa-calendar"></i>
                                    ${dueDate}
                                   </span>`
                                : ""}
                        </div>
                    </div>

                    <div class="task-row-actions">

                        <button
                            type="button"
                            class="task-action-button complete-task-button"
                            data-id="${taskId}"
                            title="${completed ? "Mark as pending" : "Complete task"}">
                            <i class="fa-solid ${completed
                                ? "fa-rotate-left"
                                : "fa-check"}"></i>
                            ${completed ? "Undo" : "Complete"}
                        </button>

                        <button
                            type="button"
                            class="task-action-button edit-task-button"
                            data-id="${taskId}"
                            title="Edit task">
                            <i class="fa-solid fa-pen"></i>
                            Edit
                        </button>

                        <button
                            type="button"
                            class="task-action-button delete delete-task-button"
                            data-id="${taskId}"
                            title="Delete task">
                            <i class="fa-solid fa-trash"></i>
                            Delete
                        </button>

                    </div>
                </article>
            `;
        }).join("");

        resultCount.textContent =
            `Showing ${filteredTasks.length} of ${tasks.length} tasks`;
    }


    /* ==========================================
       ADD A NEW TASK
    ========================================== */

    taskForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (isSaving) return;

        const name = taskName.value.trim();

        if (!name) {
            showMessage("Please enter a task name.", "error");
            taskName.focus();
            return;
        }

        const newTask = {
            name: name,
            description: taskDescription.value.trim(),
            priority: taskPriority.value,
            dueDate: taskDueDate.value,
            status: "pending"
        };

        isSaving = true;
        addButton.disabled = true;

        showMessage("Saving your task...", "success");

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newTask)
            });

            if (!response.ok) {
                throw new Error("The server could not save your task.");
            }

            const savedTask = await response.json();

            tasks.unshift(savedTask);

            taskForm.reset();
            taskPriority.value = "Medium";

            updateStatistics();
            renderTasks();

            showMessage("Task added successfully!", "success");

        } catch (error) {
            console.error("Add task error:", error);

            showMessage(
                "Unable to save the task. Please check your API connection.",
                "error"
            );

        } finally {
            isSaving = false;
            addButton.disabled = false;
        }
    });


    /* ==========================================
       COMPLETE, EDIT AND DELETE TASKS
    ========================================== */

    taskList.addEventListener("click", async function (event) {
        const button = event.target.closest(
            ".complete-task-button, .edit-task-button, .delete-task-button"
        );

        if (!button) return;

        const taskId = button.dataset.id;

        const task = tasks.find(function (item) {
            return String(item.id) === String(taskId);
        });

        if (!task) {
            showMessage("Task not found. Please refresh.", "error");
            return;
        }


        /* ==========================================
           1. COMPLETE OR UNDO TASK
        ========================================== */

        if (button.classList.contains("complete-task-button")) {
            const newStatus = isTaskCompleted(task)
                ? "pending"
                : "completed";

            const now = new Date();

            const completedDate =
                `${now.getFullYear()}-` +
                `${String(now.getMonth() + 1).padStart(2, "0")}-` +
                `${String(now.getDate()).padStart(2, "0")}`;

            button.disabled = true;

            try {
                const response = await fetch(
                    `${API_URL}/${encodeURIComponent(taskId)}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            ...task,
                            status: newStatus,
                            completedAt: newStatus === "completed"
                                ? completedDate
                                : null
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error("Unable to update task.");
                }

                const updatedTask = await response.json();

                tasks = tasks.map(function (item) {
                    return String(item.id) === String(taskId)
                        ? updatedTask
                        : item;
                });

                updateStatistics();
                renderTasks();

                showMessage(
                    newStatus === "completed"
                        ? "Task completed successfully!"
                        : "Task moved back to pending.",
                    "success"
                );

            } catch (error) {
                console.error("Complete task error:", error);

                showMessage(
                    "Unable to update task. Please try again.",
                    "error"
                );

                button.disabled = false;
            }
        }


        /* ==========================================
           2. EDIT TASK
        ========================================== */

        else if (button.classList.contains("edit-task-button")) {
            const newName = prompt(
                "Enter task name:",
                task.name || task.title || ""
            );

            if (newName === null) return;

            if (!newName.trim()) {
                alert("Task name cannot be empty.");
                return;
            }

            const newDescription = prompt(
                "Enter task description:",
                task.description || ""
            );

            if (newDescription === null) return;

            const newPriority = prompt(
                "Enter priority: High, Medium or Low",
                task.priority || "Medium"
            );

            if (newPriority === null) return;

            const priority = newPriority.trim().toLowerCase();

            if (!["high", "medium", "low"].includes(priority)) {
                alert("Please enter High, Medium or Low.");
                return;
            }

            const newDueDate = prompt(
                "Enter due date (YYYY-MM-DD), or leave blank:",
                task.dueDate || ""
            );

            if (newDueDate === null) return;

            button.disabled = true;

            try {
                const response = await fetch(
                    `${API_URL}/${encodeURIComponent(taskId)}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            ...task,
                            name: newName.trim(),
                            description: newDescription.trim(),
                            priority:
                                priority.charAt(0).toUpperCase() +
                                priority.slice(1),
                            dueDate: newDueDate.trim()
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error("Unable to save task changes.");
                }

                const updatedTask = await response.json();

                tasks = tasks.map(function (item) {
                    return String(item.id) === String(taskId)
                        ? updatedTask
                        : item;
                });

                updateStatistics();
                renderTasks();

                showMessage("Task updated successfully!", "success");

            } catch (error) {
                console.error("Edit task error:", error);

                showMessage(
                    "Unable to edit task. Please try again.",
                    "error"
                );

                button.disabled = false;
            }
        }


        /* ==========================================
           3. DELETE TASK
        ========================================== */

        else if (button.classList.contains("delete-task-button")) {
            const confirmed = confirm(
                "Are you sure you want to delete this task?"
            );

            if (!confirmed) return;

            button.disabled = true;

            try {
                const response = await fetch(
                    `${API_URL}/${encodeURIComponent(taskId)}`,
                    {
                        method: "DELETE"
                    }
                );

                if (!response.ok) {
                    throw new Error("Unable to delete task.");
                }

                tasks = tasks.filter(function (item) {
                    return String(item.id) !== String(taskId);
                });

                updateStatistics();
                renderTasks();

                showMessage("Task deleted successfully!", "success");

            } catch (error) {
                console.error("Delete task error:", error);

                showMessage(
                    "Unable to delete task. Please try again.",
                    "error"
                );

                button.disabled = false;
            }
        }
    });


    /* ==========================================
       SEARCH TASKS
    ========================================== */

    taskSearch.addEventListener("input", renderTasks);


    /* ==========================================
       FILTER TASKS BY STATUS
    ========================================== */

    statusFilter.addEventListener("change", renderTasks);


    /* ==========================================
       FILTER TASKS BY PRIORITY
    ========================================== */

    priorityFilter.addEventListener("change", renderTasks);


    /* ==========================================
       REFRESH TASKS
    ========================================== */

    refreshButton.addEventListener("click", loadTasks);


    /* ==========================================
       LOAD TASKS WHEN PAGE OPENS
    ========================================== */

    loadTasks();

})();