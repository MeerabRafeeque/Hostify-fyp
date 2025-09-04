// warden complaints and feedback functions
document.addEventListener("DOMContentLoaded", () => {
    initializeComplaintsFeedback();
});

let complaints = [];

async function initializeComplaintsFeedback() {
    try {
        await loadComplaints();
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing complaints feedback:', error);
        // error is already handled in loadComplaints
    }
}

async function loadComplaints() {
    try {
        console.log('Loading complaints...');
        const response = await fetch('/api/complaints/', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load complaints: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Complaints response:', data);
        
        // handle response
        complaints = data.results || data;
        console.log('Complaints loaded:', complaints.length);
        
        renderComplaints();
    } catch (error) {
        console.error('Error loading complaints:', error);
        showNotification('Error loading complaints', 'error');
    }
}

function renderComplaints() {
    const tableBody = document.querySelector(".complaintsTable tbody");
    if (!tableBody) return;
    
    tableBody.innerHTML = "";
    
    if (complaints.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8">No complaints yet</td></tr>`;
        return;
    }
    
    complaints.forEach((complaint, index) => {
        const tr = document.createElement("tr");

        // get student name from nested user object
        const studentName = complaint.student && complaint.student.user 
            ? `${complaint.student.user.first_name} ${complaint.student.user.last_name}` 
            : "Unknown";
        const studentId = complaint.student ? complaint.student.student_id : "N/A";
        
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${studentName}</td>
            <td>${studentId}</td>
            <td>${complaint.description}</td>
            <td>
                <select data-complaint-id="${complaint.id}" class="statusSelect">
                    <option value="pending" ${complaint.status === "pending" ? "selected" : ""}>Pending</option>
                    <option value="in_progress" ${complaint.status === "in_progress" ? "selected" : ""}>In Progress</option>
                    <option value="resolved" ${complaint.status === "resolved" ? "selected" : ""}>Resolved</option>
                    <option value="rejected" ${complaint.status === "rejected" ? "selected" : ""}>Rejected</option>
                </select>
            </td>
            <td>
                <input type="text" data-complaint-id="${complaint.id}" class="feedbackInput" 
                       placeholder="Write feedback..." value="${complaint.resolution || ""}">
            </td>
            <td>
                <select data-complaint-id="${complaint.id}" class="handledBySelect">
                    <option value="Warden 1(morning)" ${complaint.assigned_to === "Warden 1(morning)" ? "selected" : ""}>Warden 1(morning)</option>
                    <option value="Warden 2(evening)" ${complaint.assigned_to === "Warden 2(evening)" ? "selected" : ""}>Warden 2(evening)</option>
                    <option value="Warden 3(night)" ${complaint.assigned_to === "Warden 3(night)" ? "selected" : ""}>Warden 3(night)</option>
                </select>
            </td>
            <td>
                <button class="saveBtn btn btn-primary" data-complaint-id="${complaint.id}">Save</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
    
    attachSaveEvents();
}

function attachSaveEvents() {
    document.querySelectorAll(".saveBtn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const complaintId = e.target.getAttribute("data-complaint-id");
            await handleSaveComplaint(complaintId);
        });
    });
}

async function handleSaveComplaint(complaintId) {
    try {
        const statusSelect = document.querySelector(`.statusSelect[data-complaint-id="${complaintId}"]`);
        const feedbackInput = document.querySelector(`.feedbackInput[data-complaint-id="${complaintId}"]`);
        const handledBySelect = document.querySelector(`.handledBySelect[data-complaint-id="${complaintId}"]`);
        
        const status = statusSelect.value;
        const resolution = feedbackInput.value;
        const assignedTo = handledBySelect.value;
        
        const updateData = {
            status: status,
            resolution: resolution,
            assigned_to: assignedTo,
            resolved_at: status === 'resolved' ? new Date().toISOString() : null
        };
        
        const response = await fetch(`/api/complaints/${complaintId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            credentials: 'include',
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            showNotification('Complaint updated successfully!', 'success');
            
            // create notification for student
            await createStudentNotification(complaintId, status, resolution);
            
            // reload complaints to show updated data
            await loadComplaints();
        } else {
            throw new Error('Failed to update complaint');
        }
    } catch (error) {
        console.error('Error saving complaint:', error);
        showNotification('Error updating complaint', 'error');
    }
}

async function createStudentNotification(complaintId, status, resolution) {
    try {
        const complaint = complaints.find(c => c.id == complaintId);
        if (!complaint) return;
        
        let notificationTitle = '';
        let notificationMessage = '';
        
        switch (status) {
            case 'resolved':
                notificationTitle = 'Complaint Resolved';
                notificationMessage = `Your complaint "${complaint.title}" has been resolved. Response: ${resolution}`;
                break;
            case 'rejected':
                notificationTitle = 'Complaint Rejected';
                notificationMessage = `Your complaint "${complaint.title}" has been rejected. Reason: ${resolution}`;
                break;
            case 'in_progress':
                notificationTitle = 'Complaint In Progress';
                notificationMessage = `Your complaint "${complaint.title}" is being processed.`;
                break;
            default:
                return;
        }
        
        const response = await fetch('/api/notifications/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            credentials: 'include',
            body: JSON.stringify({
                recipient: complaint.student,
                notification_type: 'complaint',
                title: notificationTitle,
                message: notificationMessage,
                related_object_id: complaintId,
                related_object_type: 'complaint'
            })
        });
        
        if (!response.ok) {
            console.error('Failed to create student notification');
        }
    } catch (error) {
        console.error('Error creating student notification:', error);
    }
}

function setupEventListeners() {
    // add any additional event listeners here
}

function getCSRFToken() {
    const token = document.querySelector('[name=csrfmiddlewaretoken]');
    return token ? token.value : '';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}
