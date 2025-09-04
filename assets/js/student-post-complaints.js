// student post-dashboard complaints
document.addEventListener('DOMContentLoaded', function() {
    let studentData = null;
    let complaints = [];
    
    // initialize complaints page
    initializeComplaints();
    
    async function initializeComplaints() {
        try {
            await loadStudentData();
            await loadComplaints();
            setupEventListeners();
            setupFormValidation();
        } catch (error) {
            console.error('Error initializing complaints:', error);
            showNotification('Failed to load complaints data', 'error');
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
            
            // auto-fill student info in form
            document.getElementById('studentName').value = `${studentData.user?.first_name || ''} ${studentData.user?.last_name || ''}`;
            document.getElementById('studentID').value = studentData.student_id || '';
        } catch (error) {
            console.error('Error loading student data:', error);
            throw error;
        }
    }
    
    // load existing complaints
    async function loadComplaints() {
        try {
            const response = await fetch('/api/complaints/', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to load complaints');
            }
            
            const allComplaints = await response.json();
            
            // filter complaints for current student
            complaints = allComplaints.filter(complaint => 
                complaint.student == studentData.id
            );
            
            renderComplaints();
        } catch (error) {
            console.error('Error loading complaints:', error);
            throw error;
        }
    }
    
    // setup form validation
    function setupFormValidation() {
        const complaintType = document.getElementById('complaintType');
        const otherTypeGroup = document.getElementById('otherTypeGroup');
        
        if (complaintType) {
            complaintType.addEventListener('change', function() {
                if (this.value === 'Other') {
                    otherTypeGroup.style.display = 'block';
                } else {
                    otherTypeGroup.style.display = 'none';
                }
            });
        }
        
        // auto-fill current date
        const submitDate = document.getElementById('submitDate');
        if (submitDate) {
            submitDate.value = new Date().toLocaleDateString();
        }
    }
    
    // setup event listeners
    function setupEventListeners() {

        // complaint form submission
        const complaintForm = document.getElementById('complaintForm');
        if (complaintForm) {
            complaintForm.addEventListener('submit', handleComplaintSubmit);
        }
        
        // logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleLogout();
            });
        }
    }
    
    // handle complaint form submission
    async function handleComplaintSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const complaintData = {
            complaint_type: formData.get('complaintType') === 'Other' ? 
                formData.get('otherType') : formData.get('complaintType'),
            description: formData.get('complaintDesc'),
            student: studentData.id
        };
        
        try {
            const response = await fetch('/api/complaints/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                credentials: 'include',
                body: JSON.stringify(complaintData)
            });
            
            if (response.ok) {
                const newComplaint = await response.json();
                showNotification('Complaint submitted successfully!', 'success');
                
                // reset form
                event.target.reset();
                document.getElementById('otherTypeGroup').style.display = 'none';
                document.getElementById('submitDate').value = new Date().toLocaleDateString();
                
                // reload complaints to show the new one
                await loadComplaints();
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit complaint');
            }
        } catch (error) {
            console.error('Error submitting complaint:', error);
            showNotification(error.message || 'Failed to submit complaint', 'error');
        }
    }
    
    // render complaints in the table
    function renderComplaints() {
        const tbody = document.getElementById('complaintHistory');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (complaints.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-records">No complaints found.</td>
                </tr>
            `;
            return;
        }
        
        complaints.forEach(complaint => {
            const row = createComplaintRow(complaint);
            tbody.appendChild(row);
        });
    }
    
    // create complaint table row
    function createComplaintRow(complaint) {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${studentData.student_id || '-'}</td>
            <td>${studentData.user?.first_name || ''} ${studentData.user?.last_name || ''}</td>
            <td>${complaint.complaint_type || '-'}</td>
            <td>${complaint.description || '-'}</td>
            <td>${formatDate(complaint.created_at)}</td>
            <td class="status-${complaint.status?.toLowerCase() || 'pending'}">${complaint.status || 'Pending'}</td>
            <td>${complaint.warden_response || 'Awaiting response'}</td>
        `;
        
        return tr;
    }
    
    // format date for display
    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // get CSRF token
    function getCSRFToken() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                return value;
            }
        }
        return '';
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
        
        //set background color based on type
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
