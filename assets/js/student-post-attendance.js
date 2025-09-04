// student post-dashboard attendance view
document.addEventListener('DOMContentLoaded', function() {
    let attendanceRecords = [];
    let studentData = null;
    
    // initialize attendance page
    initializeAttendance();
    
    async function initializeAttendance() {
        try {
            await loadStudentData();
            await loadAttendanceRecords();
            renderAttendance();
            setupEventListeners();
        } catch (error) {
            console.error('Error initializing attendance:', error);
            showNotification('Failed to load attendance data', 'error');
        }
    }
    
    // load student data
    async function loadStudentData() {
        try {
            const response = await fetch('/api/students/me/', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to load student data');
            }
            
            studentData = await response.json();
        } catch (error) {
            console.error('Error loading student data:', error);
            throw error;
        }
    }
    
    //load attendance records from API
    async function loadAttendanceRecords() {
        try {
            const response = await fetch('/api/attendance/', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to load attendance records');
            }
            
            const allRecords = await response.json();
            
            // filter records for current student
            attendanceRecords = allRecords.filter(record => 
                record.student == studentData.id
            );
        } catch (error) {
            console.error('Error loading attendance records:', error);
            throw error;
        }
    }
    
    // render attendance in the UI
    function renderAttendance() {
        const tableBody = document.querySelector('.attendance-table tbody');
        if (!tableBody) return;
        
        // clear existing content
        tableBody.innerHTML = '';
        
        if (attendanceRecords.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="no-records">No attendance records found.</td>
                </tr>
            `;
            return;
        }
        
        // group records by date
        const groupedRecords = groupRecordsByDate(attendanceRecords);
        
        Object.keys(groupedRecords).forEach(date => {
            const dayRecords = groupedRecords[date];
            const row = createAttendanceRow(date, dayRecords);
            tableBody.appendChild(row);
        });
    }
    
    // group attendance records by date
    function groupRecordsByDate(records) {
        const grouped = {};
        
        records.forEach(record => {
            const date = record.date;
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(record);
        });
        
        return grouped;
    }
    
    // create attendance row for a specific date
    function createAttendanceRow(date, dayRecords) {
        const tr = document.createElement('tr');
        
        // find shift-wise records
        const morningRecord = dayRecords.find(r => r.shift === 'morning');
        const eveningRecord = dayRecords.find(r => r.shift === 'evening');
        const nightRecord = dayRecords.find(r => r.shift === 'night');
        
        // determine overall status
        const status = determineOverallStatus(morningRecord, eveningRecord, nightRecord);
        
        // get marked by (prefer non-null records)
        const markedBy = morningRecord?.marked_by || eveningRecord?.marked_by || nightRecord?.marked_by || '-';
        
        tr.innerHTML = `
            <td>${studentData.student_id || '-'}</td>
            <td>${studentData.user?.first_name || ''} ${studentData.user?.last_name || ''}</td>
            <td class="status-${morningRecord?.status || 'null'}">${morningRecord?.status || 'Null'}</td>
            <td class="status-${eveningRecord?.status || 'null'}">${eveningRecord?.status || 'Null'}</td>
            <td class="status-${nightRecord?.status || 'null'}">${nightRecord?.status || 'Null'}</td>
            <td>${markedBy}</td>
            <td>${formatDate(date)}</td>
            <td class="overall-status status-${status.toLowerCase()}">${status}</td>
        `;
        
        return tr;
    }
    
    // determine overall status for the day
    function determineOverallStatus(morning, evening, night) {
        const statuses = [morning?.status, evening?.status, night?.status];
        
        if (statuses.includes('present')) return 'Present';
        if (statuses.includes('absent')) return 'Absent';
        if (statuses.includes('leave')) return 'Leave';
        if (statuses.includes('holiday')) return 'Holiday';
        
        return 'Null';
    }
    
    // format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // setup event listeners
    function setupEventListeners() {
        // logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleLogout();
            });
        }
    }
    
    // handle logout
    async function handleLogout() {
        try {
            const response = await fetch('/api/auth/logout/', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                showNotification('You have been logged out successfully', 'success');
                setTimeout(() => {
                    window.location.href = '/student-public.html/login-all.html';
                }, 1500);
            } else {
                throw new Error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
            showNotification('Logout failed. Please try again.', 'error');
        }
    }
    
    // show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        // set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#10b981';
                break;
            case 'error':
                notification.style.backgroundColor = '#ef4444';
                break;
            case 'warn':
                notification.style.backgroundColor = '#f59e0b';
                break;
            default:
                notification.style.backgroundColor = '#3b82f6';
        }
        
        document.body.appendChild(notification);
        
        // auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 5000);
    }
});
