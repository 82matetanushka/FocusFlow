/* ==========================================
   FOCUSFLOW - DASHBOARD JAVASCRIPT
   Dashboard + Date + Mobile Navigation
========================================== */


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
   6. UPDATE DASHBOARD STATISTICS
========================================== */

function updateDashboardStatistics(tasks) {

    const total = tasks.length;

    const completed = tasks.filter(task => {

        return String(task.status).toLowerCase() === "completed";

    }).length;

    const pending = total - completed;

    const percentage = total > 0
        ? Math.round((completed / total) * 100)
        : 0;


    // Update summary cards.

    const totalElement = document.getElementById("total-tasks");

    const completedElement = document.getElementById(
        "completed-tasks"
    );

    const pendingElement = document.getElementById(
        "pending-tasks"
    );

    const rateElement = document.getElementById(
        "completion-rate"
    );


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
   7. DISPLAY TODAY'S TASKS
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

    taskList.innerHTML = visibleTasks.map(task => {

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
   8. SAFELY DISPLAY TASK TEXT
========================================== */

function escapeDashboardHTML(value) {

    return String(value).replace(/[&<>"']/g, character => {

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
   9. MOBILE SIDEBAR TOGGLE
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

    navigationLinks.forEach(link => {

        link.addEventListener("click", function () {

            sidebar.classList.remove("open");

        });

    });


    // Close the sidebar when clicking outside it on mobile.

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
   10. INITIALIZE DASHBOARD
========================================== */

function initializeDashboard() {

    displayDashboardDate();

    displayFooterYear();

    displayWelcomeGreeting();

    setupDashboardSidebar();

    loadDashboardTasks();

}


/* ==========================================
   11. START DASHBOARD
========================================== */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeDashboard
    );

} else {

    initializeDashboard();

}


/* =====================================
   FOCUS ROOM TIMER
===================================== */

(function () {
    const timerDisplay = document.getElementById("timer-display");

    // Run only on the Focus Room page.
    if (!timerDisplay) {
        return;
    }

    const timerCircle = document.getElementById("timer-circle");
    const timerStatus = document.getElementById("timer-status");
    const timerMessage = document.getElementById("timer-message");

    const startButton = document.getElementById("start-timer");
    const pauseButton = document.getElementById("pause-timer");
    const resetButton = document.getElementById("reset-timer");

    const modeButtons = document.querySelectorAll(".timer-mode");

    const completedSessionsElement =
        document.getElementById("completed-sessions");

    const focusMinutesElement =
        document.getElementById("focus-minutes");

    const focusDateElement = document.getElementById("focus-date");
    const footerYearElement = document.getElementById("footer-year");

    let selectedMinutes = 25;
    let remainingSeconds = selectedMinutes * 60;
    let timerInterval = null;
    let isRunning = false;

    let completedSessions = 0;
    let focusMinutes = 0;

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remaining = seconds % 60;

        return String(minutes).padStart(2, "0") +
            ":" +
            String(remaining).padStart(2, "0");
    }

    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(remainingSeconds);

        const totalSeconds = selectedMinutes * 60;
        const elapsedSeconds = totalSeconds - remainingSeconds;

        const progress = totalSeconds > 0
            ? Math.max(0, Math.min(1, elapsedSeconds / totalSeconds))
            : 0;

        const degrees = progress * 360;

        timerCircle.style.background =
            `conic-gradient(var(--sage-dark, #52745b) ${degrees}deg,
            var(--sage-light, #e4eee5) ${degrees}deg)`;
    }

    function updateButtons() {
        startButton.disabled = isRunning;
        pauseButton.disabled = !isRunning;
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false;
        updateButtons();
    }

    function startTimer() {
        if (isRunning) {
            return;
        }

        if (remainingSeconds <= 0) {
            remainingSeconds = selectedMinutes * 60;
            updateTimerDisplay();
        }

        isRunning = true;
        timerStatus.textContent = "Stay focused!";
        timerMessage.textContent = "Keep going. You are making progress.";

        updateButtons();

        timerInterval = setInterval(function () {
            remainingSeconds--;

            updateTimerDisplay();

            if (remainingSeconds <= 0) {
                stopTimer();
                timerStatus.textContent = "Session complete!";
                timerMessage.textContent =
                    "Well done! Take a moment to recharge.";

                if (selectedMinutes === 25 || selectedMinutes === 50) {
                    completedSessions++;
                    focusMinutes += selectedMinutes;

                    completedSessionsElement.textContent =
                        completedSessions;

                    focusMinutesElement.textContent = focusMinutes;
                }

                alert("Your timer is complete! Great work!");
            }
        }, 1000);
    }

    function pauseTimer() {
        if (!isRunning) {
            return;
        }

        stopTimer();

        timerStatus.textContent = "Timer paused";
        timerMessage.textContent = "Take your time. Resume when ready.";
    }

    function resetTimer() {
        stopTimer();

        remainingSeconds = selectedMinutes * 60;

        timerStatus.textContent = "Ready to focus?";
        timerMessage.textContent =
            "Choose a session and start when you're ready.";

        updateTimerDisplay();
    }

    function selectMode(button) {
        stopTimer();

        selectedMinutes = Number(button.dataset.minutes);
        remainingSeconds = selectedMinutes * 60;

        modeButtons.forEach(function (modeButton) {
            modeButton.classList.remove("active");
        });

        button.classList.add("active");

        timerStatus.textContent = "Ready to focus?";
        timerMessage.textContent =
            "Your " + button.textContent.trim() +
            " session is ready.";

        updateTimerDisplay();
    }

    modeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            selectMode(button);
        });
    });

    startButton.addEventListener("click", startTimer);
    pauseButton.addEventListener("click", pauseTimer);
    resetButton.addEventListener("click", resetTimer);

    if (focusDateElement) {
        focusDateElement.textContent =
            new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
    }

    if (footerYearElement) {
        footerYearElement.textContent = new Date().getFullYear();
    }

    updateTimerDisplay();
    updateButtons();
})();

/* ==========================================
   FOCUSFLOW - TASK MANAGER
========================================== */

(function () {
    const taskForm = document.getElementById("task-form");

    // Run only on tasks.html
    if (!taskForm) {
        return;
    }

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

    // Display today's date
    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    // Display current year
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Safely display text inside HTML
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

    // Normalize task status
    function isTaskCompleted(task) {
        return String(task.status ?? "").toLowerCase() === "completed";
    }

    // Display form messages
    function showMessage(message, type) {
        messageElement.textContent = message;
        messageElement.style.color =
            type === "success" ? "#43784d" : "#b34337";
    }

    // Load tasks from MockAPI
    async function loadTasks() {
        if (isLoading) {
            return;
        }

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
                throw new Error("Unable to load tasks from the server.");
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("The API did not return a task list.");
            }

            tasks = data;
            updateStatistics();
            renderTasks();

        } catch (error) {
            console.error("Load tasks error:", error);

            taskList.innerHTML = `
                <div class="task-error">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p>Unable to load tasks. Check your internet connection and API URL.</p>
                    <button type="button" class="refresh-tasks-button"
                            id="retry-load-tasks">
                        Try Again
                    </button>
                </div>
            `;

            resultCount.textContent = "Tasks could not be loaded.";

            document.getElementById("retry-load-tasks")
                .addEventListener("click", loadTasks);

        } finally {
            isLoading = false;
        }
    }

    // Update task statistics
    function updateStatistics() {
        const completedTasks = tasks.filter(isTaskCompleted).length;
        const pendingTasks = tasks.length - completedTasks;

        totalElement.textContent = tasks.length;
        completedElement.textContent = completedTasks;
        pendingElement.textContent = pendingTasks;
    }

    // Render filtered tasks
    function renderTasks() {
        const searchText = taskSearch.value.trim().toLowerCase();
        const selectedStatus = statusFilter.value;
        const selectedPriority = priorityFilter.value;

        const filteredTasks = tasks.filter(function (task) {
            const name = String(task.name ?? task.title ?? "").toLowerCase();
            const description = String(task.description ?? "").toLowerCase();

            const matchesSearch =
                name.includes(searchText) ||
                description.includes(searchText);

            const completed = isTaskCompleted(task);

            const matchesStatus =
                selectedStatus === "all" ||
                (selectedStatus === "completed" && completed) ||
                (selectedStatus === "pending" && !completed);

            const taskPriority =
                String(task.priority ?? "Medium").toLowerCase();

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
            const name = escapeHTML(task.name ?? task.title ?? "Untitled task");
            const description = escapeHTML(task.description ?? "");
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

                    <input
                        type="checkbox"
                        class="task-complete-checkbox"
                        data-id="${taskId}"
                        aria-label="Mark ${name} as completed"
                        ${completed ? "checked" : ""}>

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
                            class="task-action-button delete delete-task-button"
                            data-id="${taskId}"
                            aria-label="Delete ${name}"
                            title="Delete task">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>

                </article>
            `;
        }).join("");

        resultCount.textContent =
            `Showing ${filteredTasks.length} of ${tasks.length} tasks`;
    }

    // Add a task to MockAPI
    taskForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (isSaving) {
            return;
        }

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

            // Use the server response to avoid duplicate submissions.
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

    // Mark a task as completed or pending
    taskList.addEventListener("change", async function (event) {
        const checkbox = event.target.closest(".task-complete-checkbox");

        if (!checkbox) {
            return;
        }

        const taskId = checkbox.dataset.id;
        const task = tasks.find(function (item) {
            return String(item.id) === String(taskId);
        });

        if (!task) {
            return;
        }

        checkbox.disabled = true;

        const previousStatus = task.status;
        const newStatus = checkbox.checked ? "completed" : "pending";

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
                        status: newStatus
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Unable to update the task.");
            }

            const updatedTask = await response.json();

            tasks = tasks.map(function (item) {
                return String(item.id) === String(taskId)
                    ? updatedTask
                    : item;
            });

            updateStatistics();
            renderTasks();

        } catch (error) {
            console.error("Update task error:", error);

            task.status = previousStatus;

            alert("Could not update the task. Please try again.");

            renderTasks();

        }
    });

    // Delete a task from MockAPI
    taskList.addEventListener("click", async function (event) {
        const deleteButton = event.target.closest(".delete-task-button");

        if (!deleteButton) {
            return;
        }

        const taskId = deleteButton.dataset.id;

        const confirmed = confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) {
            return;
        }

        deleteButton.disabled = true;

        try {
            const response = await fetch(
                `${API_URL}/${encodeURIComponent(taskId)}`,
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {
                throw new Error("Unable to delete the task.");
            }

            tasks = tasks.filter(function (task) {
                return String(task.id) !== String(taskId);
            });

            updateStatistics();
            renderTasks();

            showMessage("Task deleted successfully.", "success");

        } catch (error) {
            console.error("Delete task error:", error);

            alert("Could not delete the task. Please try again.");

            deleteButton.disabled = false;
        }
    });

    // Search tasks
    taskSearch.addEventListener("input", renderTasks);

    // Filter by status
    statusFilter.addEventListener("change", renderTasks);

    // Filter by priority
    priorityFilter.addEventListener("change", renderTasks);

    // Refresh task list from server
    refreshButton.addEventListener("click", loadTasks);

    // Load saved tasks when the page opens
    loadTasks();

})();

