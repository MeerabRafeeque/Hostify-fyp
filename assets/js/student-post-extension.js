// student post-dashboard stay extension requests
document.addEventListener('DOMContentLoaded', function() {
    let studentData = null;
    let extensionRequests = [];
    
    // initialize extension requests page
    initializeExtensionRequests();
    
    async function initializeExtensionRequests() {
        try {
            await loadStudentData();
            await loadExtensionRequests();
            setupEventListeners();
            setupFormValidation();
        } catch (error) {
            console.error('Error initializing extension requests:', error);
            showNotification('Failed to load extension requests data', 'error');
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
            document.getElementById('studentId').value = studentData.student_id || '';
        } catch (error) {
            console.error('Error loading student data:', error);
            throw error;
        }
    }
    
    // load existing extension requests
    async function loadExtensionRequests() {
        try {
            const response = await fetch('/api/stay-extension-requests/', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to load extension requests');
            }
            
            const allRequests = await response.json();
            
            // filter requests for current student
            extensionRequests = allRequests.filter(request => 
                request.student == studentData.id
            );
            
            renderExtensionRequests();
        } catch (error) {
            console.error('Error loading extension requests:', error);
            throw error;
        }
    }
    
    // setup form validation
    function setupFormValidation() {
        // auto-fill student info
        const studentName = document.getElementById('studentName');
        const studentId = document.getElementById('studentId');
        
        if (studentName && studentData) {
            studentName.value = `${studentData.user?.first_name || ''} ${studentData.user?.last_name || ''}`;
        }
        
        if (studentId && studentData) {
            studentId.value = studentData.student_id || '';
        }
        
        // auto-fill request ID and date
        const reqId = document.getElementById('reqId');
        const reqDate = document.getElementById('reqDate');
        
        if (reqId) {
            reqId.value = generateReqId();
        }
        
        if (reqDate) {
            reqDate.value = new Date().toLocaleDateString();
        }
    }
    
    // generate request ID
    function generateReqId() {
        return "EXT-" + Math.floor(Math.random() * 10000);
    }
    
    // setup event listeners
    function setupEventListeners() {

        // extension request form submission
        const extensionForm = document.getElementById('extensionForm');
        if (extensionForm) {
            extensionForm.addEventListener('submit', handleExtensionSubmit);
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
    
    // handle extension request form submission
    async function handleExtensionSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const extensionData = {
            student: studentData.id,
            education_level: formData.get('inter/BS'),
            year_semester: formData.get('year/Semester'),
            duration: parseInt(formData.get('duration')),
            reason: formData.get('reason'),
            status: 'pending'
        };
        
        try {
            const response = await fetch('/api/stay-extension-requests/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                credentials: 'include',
                body: JSON.stringify(extensionData)
            });
            
            if (response.ok) {
                const newRequest = await response.json();
                showNotification('Extension request submitted successfully!', 'success');
                
                // reset form
                event.target.reset();
                document.getElementById('status').value = 'Pending';
                
                // reload requests to show the new one
                await loadExtensionRequests();
                
                // auto-fill student info again
                setupFormValidation();
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit extension request');
            }
        } catch (error) {
            console.error('Error submitting extension request:', error);
            showNotification(error.message || 'Failed to submit extension request', 'error');
        }
    }
    
    // render extension requests in the table
    function renderExtensionRequests() {
        const tbody = document.getElementById('extensionHistory');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (extensionRequests.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="no-records">No extension requests found.</td>
                </tr>
            `;
            return;
        }
        
        extensionRequests.forEach(request => {
            const row = createExtensionRow(request);
            tbody.appendChild(row);
        });
    }
    
    // create extension request table row
    function createExtensionRow(request) {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${request.id || '-'}</td>
            <td>${studentData.user?.first_name || ''} ${studentData.user?.last_name || ''}</td>
            <td>${studentData.student_id || '-'}</td>
            <td>${formatDate(request.created_at)}</td>
            <td>${request.duration || 0} days</td>
            <td>${request.reason || '-'}</td>
            <td class="status-${request.status?.toLowerCase() || 'pending'}">${request.status || 'Pending'}</td>
            <td>${request.admin_response || 'Awaiting response'}</td>
            <td>${request.education_level || '-'}</td>
            <td>${request.year_semester || '-'}</td>
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
        
        // Style the notification
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
