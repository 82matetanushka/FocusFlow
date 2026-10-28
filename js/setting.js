/* ==========================================
   FOCUSFLOW - SETTINGS JAVASCRIPT
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    // 1. Get HTML elements
    const userName = document.getElementById("user-name");
    const userGreeting = document.getElementById("user-greeting");

    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const dailyFocusGoal = document.getElementById("daily-focus-goal");

    const taskReminders = document.getElementById("task-reminders");
    const habitReminders = document.getElementById("habit-reminders");

    const saveButton = document.getElementById("save-settings");
    const resetButton = document.getElementById("reset-settings");

    const settingsMessage = document.getElementById("settings-message");
    const currentDate = document.getElementById("current-date");
    const footerYear = document.getElementById("footer-year");

    const menuToggle = document.getElementById("menu-toggle");
    const sidebar = document.querySelector(".sidebar");

    // 2. Local storage keys
    const SETTINGS_KEY = "focusFlowSettings";
    const THEME_KEY = "focusFlowDarkMode";

    // 3. Default settings
    const defaultSettings = {
        userName: "",
        greeting: "",
        darkMode: false,
        dailyFocusGoal: 120,
        taskReminders: true,
        habitReminders: true
    };

    // 4. Read saved settings
    function getSavedSettings() {
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);

            if (saved) {
                const parsed = JSON.parse(saved);

                if (
                    parsed &&
                    typeof parsed === "object" &&
                    !Array.isArray(parsed)
                ) {
                    return {
                        ...defaultSettings,
                        ...parsed
                    };
                }
            }
        } catch (error) {
            console.error("Could not load settings:", error);
        }

        return { ...defaultSettings };
    }

    // 5. Display messages
    function showMessage(message, isError = false) {
        settingsMessage.textContent = message;

        settingsMessage.style.color = isError
            ? "#c0392b"
            : "#198060";
    }

    // 6. Apply light or dark mode
    function applyDarkMode(enabled) {
        const isDark = Boolean(enabled);

        document.body.classList.toggle("dark-mode", isDark);
        document.documentElement.classList.toggle("dark-mode", isDark);

        document.documentElement.style.colorScheme =
            isDark ? "dark" : "light";

        darkModeToggle.checked = isDark;
    }

    // 7. Save theme immediately
    function saveTheme(enabled) {
        const oldTheme = localStorage.getItem(THEME_KEY);

        const settings = getSavedSettings();
        settings.darkMode = Boolean(enabled);

        try {
            localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify(settings)
            );

            localStorage.setItem(
                THEME_KEY,
                String(Boolean(enabled))
            );

            applyDarkMode(enabled);
            showMessage("Appearance updated successfully!");

        } catch (error) {
            console.error("Could not save theme:", error);

            // Restore the previous theme preference.
            try {
                if (oldTheme === null) {
                    localStorage.removeItem(THEME_KEY);
                } else {
                    localStorage.setItem(THEME_KEY, oldTheme);
                }
            } catch (storageError) {
                console.error("Could not restore theme:", storageError);
            }

            applyDarkMode(oldTheme === "true");
            showMessage("Could not save the theme.", true);
        }
    }

    // 8. Load saved values into the page
    function loadSettings() {
        const settings = getSavedSettings();

        userName.value = settings.userName || "";
        userGreeting.value = settings.greeting || "";

        const goal = Number(settings.dailyFocusGoal);

        dailyFocusGoal.value =
            Number.isFinite(goal) && goal >= 5 && goal <= 1440
                ? goal
                : 120;

        taskReminders.checked = settings.taskReminders !== false;
        habitReminders.checked = settings.habitReminders !== false;

        let savedTheme = settings.darkMode === true;

        try {
            const themeValue = localStorage.getItem(THEME_KEY);

            if (themeValue !== null) {
                savedTheme = themeValue === "true";
            }
        } catch (error) {
            console.error("Could not load theme:", error);
        }

        applyDarkMode(savedTheme);
    }

    // 9. Collect the current values
    function collectSettings() {
        return {
            userName: userName.value.trim(),
            greeting: userGreeting.value.trim(),
            darkMode: darkModeToggle.checked,
            dailyFocusGoal: Number(dailyFocusGoal.value),
            taskReminders: taskReminders.checked,
            habitReminders: habitReminders.checked
        };
    }

    // 10. Save button
    function saveSettings() {
        const settings = collectSettings();

        if (
            !Number.isFinite(settings.dailyFocusGoal) ||
            settings.dailyFocusGoal < 5 ||
            settings.dailyFocusGoal > 1440
        ) {
            showMessage(
                "Enter a daily focus goal between 5 and 1440 minutes.",
                true
            );

            dailyFocusGoal.focus();
            return;
        }

        try {
            localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify(settings)
            );

            localStorage.setItem(
                THEME_KEY,
                String(settings.darkMode)
            );

            applyDarkMode(settings.darkMode);

            showMessage("Settings saved successfully!");

        } catch (error) {
            console.error("Could not save settings:", error);

            showMessage(
                "Unable to save settings. Check browser storage.",
                true
            );
        }
    }

    saveButton.addEventListener("click", saveSettings);

    // 11. Reset settings to defaults
    resetButton.addEventListener("click", function () {
        const confirmed = confirm(
            "Reset your preferences to their default values?"
        );

        if (!confirmed) return;

        try {
            localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify(defaultSettings)
            );

            localStorage.setItem(THEME_KEY, "false");

            loadSettings();

            showMessage("Settings restored to defaults!");

        } catch (error) {
            console.error("Could not reset settings:", error);

            showMessage("Unable to reset settings.", true);
        }
    });

    // 12. Apply theme as soon as the toggle changes
    darkModeToggle.addEventListener("change", function () {
        saveTheme(darkModeToggle.checked);
    });

    // 13. Clear old messages when values change
    [
        userName,
        userGreeting,
        dailyFocusGoal,
        taskReminders,
        habitReminders
    ].forEach(function (element) {
        element.addEventListener("input", function () {
            showMessage("");
        });

        element.addEventListener("change", function () {
            showMessage("");
        });
    });

    // 14. Date and footer year
    currentDate.textContent = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    footerYear.textContent = new Date().getFullYear();

    // 15. Mobile sidebar
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

    // 16. Initialize settings
    loadSettings();

    console.log("FocusFlow Settings loaded successfully.");
});