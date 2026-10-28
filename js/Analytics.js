/* ==========================================
   FOCUSFLOW - ANALYTICS
   Tasks + Focus Sessions + Habits
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    // -------------------------------
    // 1. HTML ELEMENTS
    // -------------------------------

    const taskCompletedElement =
        document.getElementById("analytics-tasks-completed");

    const focusMinutesElement =
        document.getElementById("analytics-focus-minutes");

    const focusSessionsElement =
        document.getElementById("analytics-focus-sessions");

    const habitProgressElement =
        document.getElementById("analytics-habit-progress");

    const weeklyTasksElement =
        document.getElementById("weekly-tasks-completed");

    const weeklyFocusMinutesElement =
        document.getElementById("weekly-focus-minutes");

    const weeklyFocusSessionsElement =
        document.getElementById("weekly-focus-sessions");

    const weeklyHabitsElement =
        document.getElementById("weekly-habits-completed");

    const chartCanvas =
        document.getElementById("productivity-chart");

    const chartMessage =
        document.getElementById("analytics-chart-message");

    const taskInsight = document.getElementById("task-insight");
    const focusInsight = document.getElementById("focus-insight");
    const habitInsight = document.getElementById("habit-insight");

    const currentDateElement =
        document.getElementById("current-date");

    const footerYearElement =
        document.getElementById("footer-year");

    // Run only when the Analytics page is open.
    if (!chartCanvas) return;

    // -------------------------------
    // 2. CONFIGURATION
    // -------------------------------

    const TASK_API =
        "https://6ac5df0dbea0e72cf5c8261e.mockapi.io/FocusFlowTask";

    const HABIT_STORAGE_KEY = "focusFlowHabits";
    const FOCUS_STORAGE_KEY = "focusFlowFocusHistory";

    // -------------------------------
    // 3. DATE FUNCTIONS
    // -------------------------------

    function getDateKey(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function getLastSevenDays() {
        const dates = [];
        const today = new Date();

        for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
            const date = new Date(today);
            date.setDate(today.getDate() - daysAgo);

            dates.push({
                key: getDateKey(date),
                label: date.toLocaleDateString("en-IN", {
                    weekday: "short"
                })
            });
        }

        return dates;
    }

    // Works with YYYY-MM-DD and ISO date/time strings.
    function getStoredDateKey(value) {
        if (!value) return "";

        const text = String(value);
        const match = text.match(/^\d{4}-\d{2}-\d{2}/);

        if (match) return match[0];

        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? ""
            : getDateKey(date);
    }

    // -------------------------------
    // 4. READ SAVED LOCAL DATA
    // -------------------------------

    function readStorage(key) {
        try {
            const saved = localStorage.getItem(key);
            const data = saved ? JSON.parse(saved) : [];

            return Array.isArray(data) ? data : [];

        } catch (error) {
            console.error(`Could not read ${key}:`, error);
            return [];
        }
    }

    // -------------------------------
    // 5. LOAD TASKS FROM MOCKAPI
    // -------------------------------

    async function loadTasks() {
        const response = await fetch(TASK_API);

        if (!response.ok) {
            throw new Error("Unable to load tasks from MockAPI.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("The tasks API returned an invalid response.");
        }

        return data;
    }

    function isCompletedTask(task) {
        return String(task.status ?? "").toLowerCase() === "completed";
    }

    // -------------------------------
    // 6. ANALYSE TASKS
    // -------------------------------

    function analyseTasks(tasks, dates) {
        const completedTasks = tasks.filter(isCompletedTask);

        const dailyCounts = dates.map(function (day) {
            return completedTasks.filter(function (task) {
                const completedDate =
    task.completedAt ||
    task.completionDate ||
    task.updatedAt;

                return getStoredDateKey(completedDate) === day.key;
            }).length;
        });

        const weeklyTotal = dailyCounts.reduce(
            (total, count) => total + count,
            0
        );

        return {
            totalCompleted: completedTasks.length,
            dailyCounts: dailyCounts,
            weeklyTotal: weeklyTotal
        };
    }

    // -------------------------------
    // 7. ANALYSE FOCUS SESSIONS
    // -------------------------------

    function analyseFocus(history, dates) {
        const dailySessions = dates.map(function (day) {
            return history.filter(function (session) {
                return getStoredDateKey(session.date) === day.key;
            }).length;
        });

        const dailyMinutes = dates.map(function (day) {
            return history.reduce(function (total, session) {
                if (getStoredDateKey(session.date) !== day.key) {
                    return total;
                }

                return total + Math.max(0, Number(session.minutes) || 0);
            }, 0);
        });

        const weeklyHistory = history.filter(function (session) {
            return dates.some(day =>
                day.key === getStoredDateKey(session.date)
            );
        });

        const totalMinutes = history.reduce(function (total, session) {
            return total + Math.max(0, Number(session.minutes) || 0);
        }, 0);

        return {
            totalMinutes: totalMinutes,
            totalSessions: history.length,
            weeklyMinutes: dailyMinutes.reduce(
                (total, minutes) => total + minutes,
                0
            ),
            weeklySessions: weeklyHistory.length,
            dailySessions: dailySessions,
            dailyMinutes: dailyMinutes
        };
    }

    // -------------------------------
    // 8. ANALYSE HABITS
    // -------------------------------

    function analyseHabits(habits, dates) {
        const today = getDateKey();

        const completedToday = habits.filter(function (habit) {
            return Array.isArray(habit.completedDates) &&
                habit.completedDates.includes(today);
        }).length;

        const dailyCounts = dates.map(function (day) {
            return habits.reduce(function (total, habit) {
                const completedDates = Array.isArray(habit.completedDates)
                    ? habit.completedDates
                    : [];

                return total +
                    (completedDates.includes(day.key) ? 1 : 0);
            }, 0);
        });

        const weeklyTotal = habits.reduce(function (total, habit) {
            const completedDates = Array.isArray(habit.completedDates)
                ? habit.completedDates
                : [];

            const datesCompletedThisWeek = completedDates.filter(
                date => dates.some(day => day.key === date)
            );

            return total + datesCompletedThisWeek.length;
        }, 0);

        const percentage = habits.length === 0
            ? 0
            : Math.round((completedToday / habits.length) * 100);

        return {
            total: habits.length,
            completedToday: completedToday,
            percentage: percentage,
            weeklyTotal: weeklyTotal,
            dailyCounts: dailyCounts
        };
    }

    // -------------------------------
    // 9. UPDATE SUMMARY CARDS
    // -------------------------------

    function updateSummary(taskData, focusData, habitData) {
        taskCompletedElement.textContent =
            taskData.totalCompleted;

        focusMinutesElement.textContent =
            focusData.totalMinutes;

        focusSessionsElement.textContent =
            focusData.totalSessions;

        habitProgressElement.textContent =
            `${habitData.percentage}%`;

        weeklyTasksElement.textContent =
            taskData.weeklyTotal;

        weeklyFocusMinutesElement.textContent =
            focusData.weeklyMinutes;

        weeklyFocusSessionsElement.textContent =
            focusData.weeklySessions;

        weeklyHabitsElement.textContent =
            habitData.weeklyTotal;
    }

    // -------------------------------
    // 10. DRAW WEEKLY CHART
    // -------------------------------

    function drawChart(dates, taskData, focusData, habitData) {
        if (typeof Chart === "undefined") {
            chartMessage.textContent =
                "The chart library did not load. Check your internet connection.";
            return;
        }

        if (window.analyticsChart) {
            window.analyticsChart.destroy();
        }

        window.analyticsChart = new Chart(chartCanvas, {
            type: "bar",

            data: {
                labels: dates.map(day => day.label),

                datasets: [
                    {
                        label: "Tasks Completed",
                        data: taskData.dailyCounts,
                        backgroundColor: "#71B2A3",
                        borderRadius: 6
                    },
                    {
                        label: "Focus Sessions",
                        data: focusData.dailySessions,
                        backgroundColor: "#A9B7EF",
                        borderRadius: 6
                    },
                    {
                        label: "Habits Completed",
                        data: habitData.dailyCounts,
                        backgroundColor: "#F0B993",
                        borderRadius: 6
                    }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                interaction: {
                    mode: "index",
                    intersect: false
                },

                plugins: {
                    legend: {
                        display: true,
                        position: "bottom"
                    },

                    tooltip: {
                        enabled: true
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        },
                        title: {
                            display: true,
                            text: "Completed"
                        }
                    }
                }
            }
        });

        const hasActivity =
            taskData.dailyCounts.some(value => value > 0) ||
            focusData.dailySessions.some(value => value > 0) ||
            habitData.dailyCounts.some(value => value > 0);

        chartMessage.textContent = hasActivity
            ? "Your recorded activity for the last seven days."
            : "No activity recorded this week yet. Complete tasks, focus sessions, or habits to build your chart.";
    }

    // -------------------------------
    // 11. PRODUCTIVITY INSIGHTS
    // -------------------------------

    function updateInsights(taskData, focusData, habitData) {
        if (taskData.totalCompleted === 0) {
            taskInsight.textContent =
                "Complete a task to start tracking your achievements.";
        } else {
            taskInsight.textContent =
                `You have completed ${taskData.totalCompleted} task(s) in total. Keep progressing!`;
        }

        if (focusData.totalSessions === 0) {
            focusInsight.textContent =
                "Complete a focus timer session to start tracking focus time.";
        } else {
            focusInsight.textContent =
                `You have completed ${focusData.totalSessions} focus session(s), for ${focusData.totalMinutes} recorded minutes.`;
        }

        if (habitData.total === 0) {
            habitInsight.textContent =
                "Add habits in the Habits page to start tracking consistency.";
        } else {
            habitInsight.textContent =
                `You completed ${habitData.completedToday} of ${habitData.total} habits today (${habitData.percentage}%).`;
        }
    }

    // -------------------------------
    // 12. LOAD ALL ANALYTICS
    // -------------------------------

    async function loadAnalytics() {
        const dates = getLastSevenDays();

        try {
            const tasks = await loadTasks();
            const focusHistory = readStorage(FOCUS_STORAGE_KEY);
            const habits = readStorage(HABIT_STORAGE_KEY);

            const taskData = analyseTasks(tasks, dates);
            const focusData = analyseFocus(focusHistory, dates);
            const habitData = analyseHabits(habits, dates);

            updateSummary(taskData, focusData, habitData);
            drawChart(dates, taskData, focusData, habitData);
            updateInsights(taskData, focusData, habitData);

        } catch (error) {
            console.error("Analytics loading error:", error);

            chartMessage.textContent =
                "Unable to load task analytics. Check your internet connection and MockAPI endpoint.";

            taskInsight.textContent =
                "Task information could not be loaded.";

            // Show locally saved focus and habit data even if MockAPI fails.
            const focusData = analyseFocus(
                readStorage(FOCUS_STORAGE_KEY),
                dates
            );

            const habitData = analyseHabits(
                readStorage(HABIT_STORAGE_KEY),
                dates
            );

            focusMinutesElement.textContent = focusData.totalMinutes;
            focusSessionsElement.textContent = focusData.totalSessions;
            habitProgressElement.textContent = `${habitData.percentage}%`;

            weeklyFocusMinutesElement.textContent = focusData.weeklyMinutes;
            weeklyFocusSessionsElement.textContent = focusData.weeklySessions;
            weeklyHabitsElement.textContent = habitData.weeklyTotal;

            drawChart(
                dates,
                { dailyCounts: dates.map(() => 0) },
                focusData,
                habitData
            );

            updateInsights(
                { totalCompleted: 0 },
                focusData,
                habitData
            );
        }
    }

    // -------------------------------
    // 13. DATE, FOOTER AND SIDEBAR
    // -------------------------------

    if (currentDateElement) {
        currentDateElement.textContent =
            new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
    }

    if (footerYearElement) {
        footerYearElement.textContent = new Date().getFullYear();
    }

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

    // Start Analytics
    loadAnalytics();

});