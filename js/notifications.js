// Notification Bell Component for Doctor Dashboard
// Add this to doctor.js or create a separate notifications.js file

class NotificationBell {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.init();
    }

    init() {
        this.createBellUI();
        this.loadNotifications();
        // Auto-refresh every 30 seconds
        setInterval(() => this.loadNotifications(), 30000);
    }

    createBellUI() {
        const navbar = document.querySelector('.dashboard-header') || document.querySelector('nav');
        if (!navbar) return;

        const bellHTML = `
            <div class="notification-bell" id="notificationBell">
                <button class="bell-button" id="bellButton">
                    🔔
                    <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
                </button>
                <div class="notification-dropdown" id="notificationDropdown" style="display: none;">
                    <div class="notification-header">
                        <h3>Notifications</h3>
                        <button class="mark-all-read" id="markAllRead">Mark all as read</button>
                    </div>
                    <div class="notification-list" id="notificationList">
                        <p class="loading">Loading...</p>
                    </div>
                </div>
            </div>
        `;

        navbar.insertAdjacentHTML('beforeend', bellHTML);
        this.attachEventListeners();
        this.addStyles();
    }

    attachEventListeners() {
        const bellButton = document.getElementById('bellButton');
        const dropdown = document.getElementById('notificationDropdown');
        const markAllRead = document.getElementById('markAllRead');

        bellButton?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });

        markAllRead?.addEventListener('click', () => this.markAllAsRead());

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-bell')) {
                dropdown.style.display = 'none';
            }
        });
    }

    async loadNotifications() {
        try {
            const response = await ConsultationsAPI.getNotifications();
            this.notifications = response.data || [];
            this.unreadCount = this.notifications.length;
            this.updateUI();
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    updateUI() {
        const badge = document.getElementById('notificationBadge');
        const list = document.getElementById('notificationList');

        // Update badge
        if (this.unreadCount > 0) {
            badge.textContent = this.unreadCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }

        // Update notification list
        if (this.notifications.length === 0) {
            list.innerHTML = '<p class="no-notifications">No new notifications</p>';
            return;
        }

        list.innerHTML = this.notifications.map(notification => `
            <div class="notification-item" data-id="${notification._id}" onclick="notificationBell.markAsRead('${notification._id}')">
                <div class="notification-icon">🔔</div>
                <div class="notification-content">
                    <h4>New Consultation Booking</h4>
                    <p><strong>${notification.customerName}</strong> booked a consultation</p>
                    <p class="notification-details">
                        Pet: ${notification.petName} (${notification.petType})<br>
                        Date: ${new Date(notification.appointmentDate).toLocaleDateString()}<br>
                        Time: ${notification.appointmentTime}
                    </p>
                    <span class="notification-time">${this.getTimeAgo(notification.createdAt)}</span>
                </div>
            </div>
        `).join('');
    }

    async markAsRead(id) {
        try {
            await ConsultationsAPI.markAsRead(id);
            this.loadNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    async markAllAsRead() {
        try {
            await ConsultationsAPI.markAllAsRead();
            this.loadNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification-bell {
                position: relative;
                margin-left: auto;
            }

            .bell-button {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                position: relative;
                padding: 8px;
            }

            .notification-badge {
                position: absolute;
                top: 0;
                right: 0;
                background: #ff4444;
                color: white;
                border-radius: 10px;
                padding: 2px 6px;
                font-size: 12px;
                font-weight: bold;
            }

            .notification-dropdown {
                position: absolute;
                right: 0;
                top: 100%;
                width: 400px;
                max-height: 500px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                overflow: hidden;
            }

            .notification-header {
                padding: 15px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .notification-header h3 {
                margin: 0;
                font-size: 16px;
            }

            .mark-all-read {
                background: none;
                border: none;
                color: #4CAF50;
                cursor: pointer;
                font-size: 12px;
            }

            .notification-list {
                max-height: 400px;
                overflow-y: auto;
            }

            .notification-item {
                padding: 15px;
                border-bottom: 1px solid #eee;
                cursor: pointer;
                display: flex;
                gap: 10px;
                transition: background 0.2s;
            }

            .notification-item:hover {
                background: #f5f5f5;
            }

            .notification-icon {
                font-size: 24px;
            }

            .notification-content {
                flex: 1;
            }

            .notification-content h4 {
                margin: 0 0 5px 0;
                font-size: 14px;
                color: #333;
            }

            .notification-content p {
                margin: 0 0 5px 0;
                font-size: 13px;
                color: #666;
            }

            .notification-details {
                font-size: 12px !important;
                color: #888 !important;
                line-height: 1.4;
            }

            .notification-time {
                font-size: 11px;
                color: #999;
            }

            .no-notifications, .loading {
                text-align: center;
                padding: 30px;
                color: #999;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize notification bell when doctor dashboard loads
let notificationBell;
if (window.location.pathname.includes('doctor-dashboard')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for doctor to login
        setTimeout(() => {
            const token = TokenManager.getToken();
            if (token) {
                notificationBell = new NotificationBell();
            }
        }, 1000);
    });
}
