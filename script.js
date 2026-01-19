document.addEventListener('DOMContentLoaded', () => {
    // --- 0. Dropdown Interaction Logic ---
    const notifyBtn = document.getElementById('notifyBtn');
    const notifyDropdown = document.getElementById('notifyDropdown');
    const userBtn = document.getElementById('userBtn');
    const userDropdown = document.getElementById('userDropdown');

    function toggleDropdown(dropdown, otherDropdown) {
        if (otherDropdown && otherDropdown.classList.contains('show')) {
            otherDropdown.classList.remove('show');
        }
        if (dropdown) dropdown.classList.toggle('show');
    }

    if (notifyBtn && notifyDropdown) {
        notifyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(notifyDropdown, userDropdown);
        });
        notifyDropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(userDropdown, notifyDropdown);
        });
        userDropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    document.addEventListener('click', () => {
        if (notifyDropdown) notifyDropdown.classList.remove('show');
        if (userDropdown) userDropdown.classList.remove('show');
    });

    // --- 1. Water Tank & Slider Logic ---
    const slider = document.getElementById('levelSlider');
    const valueDisplay = document.getElementById('sliderValue');
    const waterLiquid = document.querySelector('.water-liquid');
    const waterText = document.querySelector('#waterLevelText');

    // Debounce function for notifications to avoid spamming while sliding
    let notificationTimeout;

    if (slider) {
        slider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);

            // Update UI
            if (valueDisplay) valueDisplay.textContent = `${val}%`;
            if (waterLiquid) waterLiquid.style.height = `${val}%`;
            if (waterText) waterText.textContent = `${val}%`;

            // Check for notifications
            clearTimeout(notificationTimeout);
            notificationTimeout = setTimeout(() => {
                checkNotifications(val);
            }, 500); // 500ms delay after sliding stops
        });
    }

    // --- 2. Chart.js Implementation ---
    const ctx = document.getElementById('usageChart');
    let usageChart;

    // Data for different periods
    const chartData = {
        daily: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: [45, 45, 60, 45, 45, 15, 25],
            unit: 'Liters'
        },
        monthly: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            data: [1200, 1350, 1100, 1400, 1600, 1800, 1900, 1750, 1500, 1300, 1150, 1250],
            unit: 'Liters'
        },
        yearly: {
            labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
            data: [14000, 15500, 14800, 16200, 17500, 13000],
            unit: 'Liters'
        }
    };

    if (ctx) {
        // Gradient for "Premium" look
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(100, 181, 246, 0.5)'); // primary-blue
        gradient.addColorStop(1, 'rgba(100, 181, 246, 0.0)');

        usageChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.daily.labels,
                datasets: [{
                    label: 'Water Usage',
                    data: chartData.daily.data,
                    borderColor: '#64B5F6', // primary-blue
                    backgroundColor: gradient,
                    borderWidth: 3,
                    tension: 0.4, // Smooths the curve
                    fill: true,
                    pointBackgroundColor: '#FFFFFF',
                    pointBorderColor: '#64B5F6',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#FFFFFF',
                        titleColor: '#1F2937',
                        bodyColor: '#6B7280',
                        borderColor: '#E5E7EB',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            label: function (context) {
                                return context.parsed.y + ' L';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#F3F4F6' },
                        ticks: { color: '#9CA3AF', font: { size: 10 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#9CA3AF', font: { size: 10 } }
                    }
                }
            }
        });
    }

    // --- 3. Dynamic Date Logic & Tab Switching ---
    const dateRangeText = document.getElementById('dateRangeText');
    const tabs = document.querySelectorAll('.usage-tab');

    function updateDateRange(period) {
        const today = new Date();
        const options = { month: 'short', day: 'numeric' };

        if (period === 'daily') {
            // Calculate start/end of current week (assuming Mon start)
            const day = today.getDay() || 7; // Get current day number, converting Sun(0) to 7
            if (day !== 1) today.setHours(-24 * (day - 1)); // Set to Monday
            const startOfWeek = today.toLocaleDateString('en-US', options);

            today.setHours(24 * 6); // Set to Sunday
            const endOfWeek = today.toLocaleDateString('en-US', options);

            dateRangeText.textContent = `${startOfWeek} - ${endOfWeek}`;
        } else if (period === 'monthly') {
            dateRangeText.textContent = `Jan - Dec, ${new Date().getFullYear()}`;
        } else if (period === 'yearly') {
            dateRangeText.textContent = `2020 - 2025`;
        }
    }

    // Initialize with Daily
    updateDateRange('daily');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // UI Toggle
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Data Update
            const period = tab.dataset.period;
            updateDateRange(period);

            // Chart Update
            if (usageChart && chartData[period]) {
                const newData = chartData[period];
                usageChart.data.labels = newData.labels;
                usageChart.data.datasets[0].data = newData.data;
                usageChart.update();
            }
        });
    });

    // --- 4. Notification Logic ---
    // --- 4. Notification Logic ---
    function checkNotifications(value) {
        if (value === 0) {
            const title = "Tank is Empty";
            const msg = "The tank is empty. Please fill it immediately.";
            showToast('Warning', msg, 'warning');
            addNotificationToDropdown('alert', title, msg);
        } else if (value === 100) {
            const title = "Tank is Full";
            const msg = "The tank is completely full (100%).";
            showToast('Success', msg, 'success');
            addNotificationToDropdown('success', title, msg);
        } else {
            // Dynamic Threshold Notification
            const title = "Desired Level Reached";
            const msg = `Water level has successfully reached your desired threshold of ${value}%.`;
            showToast('Info', msg, 'info');
            addNotificationToDropdown('info', title, msg);
        }
    }

    function addNotificationToDropdown(type, title, message) {
        const list = document.getElementById('notificationList');
        const badge = document.querySelector('#notifyBtn .badge');

        if (!list) return;

        const time = "Just now";
        const iconName = type === 'alert' ? 'alert-circle' : (type === 'success' ? 'check-circle' : 'info');

        const itemHtml = `
            <div class="dropdown-item" style="animation: fadeIn 0.3s ease-out;">
                <i data-lucide="${iconName}" class="icon"></i>
                <div class="notification-content">
                    <span class="notification-msg" style="font-weight:600; font-size:0.85rem;">${title}</span>
                    <span class="notification-msg">${message}</span>
                    <span class="notification-time">${time}</span>
                </div>
            </div>
        `;

        // Prepend to list
        list.insertAdjacentHTML('afterbegin', itemHtml);

        // Update icons for the new element
        lucide.createIcons();

        // Update Badge
        if (badge) {
            badge.style.display = 'block';
            badge.classList.add('pulse'); // Optional animation if we had it
        }
    }

    function showToast(title, message, type = 'default') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        // Icon based on type
        let iconHtml = '';
        if (type === 'warning') iconHtml = '<i data-lucide="alert-circle" class="text-red-500"></i>';
        else if (type === 'success') iconHtml = '<i data-lucide="check-circle" class="text-green-500"></i>';
        else iconHtml = '<i data-lucide="info"></i>';

        toast.innerHTML = `
            ${iconHtml}
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;

        container.appendChild(toast);
        lucide.createIcons(); // Re-init icons for the new toast

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.4s forwards';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
});
