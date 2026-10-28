/* ==========================================
   FOCUSFLOW - HABIT TRACKER
========================================== */

(function () {
    const STORAGE_KEY = "focusFlowHabits";

    const habitForm = document.getElementById("habits-form");
    const habitInput = document.getElementById("habit-input");
    const habitsList = document.getElementById("habits-list");
    const habitsMessage = document.getElementById("habits-message");

    const totalHabits = document.getElementById("total-habits");
    const completedHabits = document.getElementById("completed-habits");
    const habitsPercentage = document.getElementById("habits-percentage");
    const progressBar = document.getElementById("habits-progress-bar");
    const progressFill = document.getElementById("habits-progress-fill");

    const habitsCount = document.getElementById("habits-count");
    const progressMessage = document.getElementById("habits-progress-message");
    const habitsWeek = document.getElementById("habits-week");

    const currentDate = document.getElementById("current-date");
    const footerYear = document.getElementById("footer-year");

    if (!habitForm || !habitsList) return;

    let habits = [];

    // Get today's date in YYYY-MM-DD format
    function getDateKey(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    // Safely display habit names
    function escapeHTML(value) {
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

    // Show success or error messages
    function showMessage(message, type = "success") {
        habitsMessage.textContent = message;
        habitsMessage.style.color =
            type === "success" ? "#43784d" : "#b34337";
    }

    // Save habits in this browser
    function saveHabits() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
            return true;
        } catch (error) {
            console.error("Unable to save habits:", error);
            showMessage("Unable to save habits in this browser.", "error");
            return false;
        }
    }

    // Load previously saved habits
    function loadHabits() {
        try {
            const savedHabits = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            habits = Array.isArray(savedHabits)
                ? savedHabits.filter(function (habit) {
                    return habit &&
                        typeof habit.id === "string" &&
                        typeof habit.name === "string";
                })
                : [];

            habits = habits.map(function (habit) {
                return {
                    ...habit,
                    completedDates: Array.isArray(habit.completedDates)
                        ? habit.completedDates
                        : []
                };
            });

        } catch (error) {
            console.error("Unable to load habits:", error);
            habits = [];
            showMessage("Could not load saved habits.", "error");
        }

        renderHabits();
    }

    // Check whether a habit is completed today
    function isCompletedToday(habit) {
        return habit.completedDates.includes(getDateKey());
    }

    // Calculate consecutive completed days
    function getStreak(habit) {
        const completed = new Set(habit.completedDates);
        let date = new Date();

        // If not completed today, check whether yesterday was completed
        if (!completed.has(getDateKey(date))) {
            date.setDate(date.getDate() - 1);
        }

        let streak = 0;

        while (completed.has(getDateKey(date))) {
            streak++;
            date.setDate(date.getDate() - 1);
        }

        return streak;
    }

    // Add a new habit
    habitForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = habitInput.value.trim();

        if (!name) {
            showMessage("Please enter a habit name.", "error");
            return;
        }

        const newHabit = {
            id: Date.now().toString(36) +
                Math.random().toString(36).slice(2, 8),
            name: name,
            completedDates: []
        };

        habits.push(newHabit);

        if (saveHabits()) {
            habitForm.reset();
            renderHabits();
            showMessage("Habit added successfully!");
            habitInput.focus();
        } else {
            habits.pop();
        }
    });

    // Handle habit completion, editing and deleting
    habitsList.addEventListener("change", function (event) {
        const checkbox = event.target.closest(".habit-checkbox");

        if (!checkbox) return;

        const habit = habits.find(function (item) {
            return item.id === checkbox.dataset.habitId;
        });

        if (!habit) return;

        const today = getDateKey();
        const oldDates = [...habit.completedDates];

        if (checkbox.checked) {
            if (!habit.completedDates.includes(today)) {
                habit.completedDates.push(today);
            }
        } else {
            habit.completedDates = habit.completedDates.filter(
                date => date !== today
            );
        }

        if (saveHabits()) {
            renderHabits();
            showMessage(
                checkbox.checked
                    ? "Habit completed for today!"
                    : "Habit marked as incomplete."
            );
        } else {
            habit.completedDates = oldDates;
            renderHabits();
        }
    });

    habitsList.addEventListener("click", function (event) {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const habit = habits.find(function (item) {
            return item.id === button.dataset.habitId;
        });

        if (!habit) return;

        // Edit habit
        if (button.dataset.action === "edit") {
            const newName = prompt("Edit habit name:", habit.name);

            if (newName === null) return;

            if (!newName.trim()) {
                showMessage("Habit name cannot be empty.", "error");
                return;
            }

            const oldName = habit.name;
            habit.name = newName.trim();

            if (saveHabits()) {
                renderHabits();
                showMessage("Habit updated successfully!");
            } else {
                habit.name = oldName;
            }
        }

        // Delete habit
        if (button.dataset.action === "delete") {
            const confirmed = confirm(
                `Are you sure you want to delete "${habit.name}"?`
            );

            if (!confirmed) return;

            const oldHabits = [...habits];

            habits = habits.filter(function (item) {
                return item.id !== habit.id;
            });

            if (saveHabits()) {
                renderHabits();
                showMessage("Habit deleted successfully!");
            } else {
                habits = oldHabits;
                renderHabits();
            }
        }
    });

    // Display every habit
    function renderHabits() {
        if (habits.length === 0) {
            habitsList.innerHTML = `
                <div class="habits-empty">
                    <p>No habits added yet.</p>
                    <p>Add your first habit to get started!</p>
                </div>
            `;
        } else {
            habitsList.innerHTML = habits.map(function (habit) {
                const completed = isCompletedToday(habit);
                const id = escapeHTML(habit.id);
                const name = escapeHTML(habit.name);
                const streak = getStreak(habit);

                return `
                    <article class="habit-item ${completed ? "is-complete" : ""}">
                        <input
                            type="checkbox"
                            class="habit-checkbox"
                            data-habit-id="${id}"
                            aria-label="Mark ${name} complete"
                            ${completed ? "checked" : ""}>

                        <div class="habit-details">
                            <span class="habit-name">${name}</span>
                            <span class="habit-streak">
                                ${streak} day${streak === 1 ? "" : "s"} streak
                            </span>
                        </div>

                        <div class="habit-actions">
                            <button
                                type="button"
                                class="habit-action"
                                data-action="edit"
                                data-habit-id="${id}"
                                aria-label="Edit ${name}"
                                title="Edit habit">
                                <i class="fa-solid fa-pen"></i>
                            </button>

                            <button
                                type="button"
                                class="habit-action"
                                data-action="delete"
                                data-habit-id="${id}"
                                aria-label="Delete ${name}"
                                title="Delete habit">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </article>
                `;
            }).join("");
        }

        updateSummary();
        renderWeeklyProgress();
    }

    // Update total habits and daily completion
    function updateSummary() {
        const total = habits.length;
        const completed = habits.filter(isCompletedToday).length;

        const percentage = total === 0
            ? 0
            : Math.round((completed / total) * 100);

        totalHabits.textContent = total;
        completedHabits.textContent = completed;
        habitsPercentage.textContent = `${percentage}%`;
        habitsCount.textContent =
            `${total} habit${total === 1 ? "" : "s"}`;

        progressFill.style.width = `${percentage}%`;
        progressBar.setAttribute("aria-valuenow", percentage);

        if (total === 0) {
            progressMessage.textContent =
                "Add your first habit to start tracking your progress.";
        } else if (percentage === 100) {
            progressMessage.textContent =
                "Amazing! You completed all your habits today.";
        } else {
            progressMessage.textContent =
                `${completed} of ${total} habits completed today. Keep going!`;
        }
    }

    // Show completion counts for the last seven days
    function renderWeeklyProgress() {
        const today = new Date();
        const days = [];

        for (let offset = 6; offset >= 0; offset--) {
            const date = new Date(today);
            date.setDate(today.getDate() - offset);

            const key = getDateKey(date);
            const completed = habits.filter(function (habit) {
                return habit.completedDates.includes(key);
            }).length;

            const dayName = date.toLocaleDateString("en-IN", {
                weekday: "short"
            });

            days.push(`
                <div class="habits-day ${offset === 0 ? "today" : ""}"
                     title="${key}: ${completed} of ${habits.length} habits completed">
                    ${dayName}
                    <strong>${completed}/${habits.length}</strong>
                </div>
            `);
        }

        habitsWeek.innerHTML = days.join("");
    }

    // Set page date and footer year
    currentDate.textContent = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    footerYear.textContent = new Date().getFullYear();

    // Mobile sidebar toggle
    const menuToggle = document.getElementById("menu-toggle");
    const sidebar = document.querySelector(".sidebar");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", function () {
            sidebar.classList.toggle("open");
        });

        sidebar.querySelectorAll(".nav-link").forEach(function (link) {
            link.addEventListener("click", function () {
                sidebar.classList.remove("open");
            });
        });
    }

    // Start the habit tracker
    loadHabits();
})();