// warden deputy attendance functions
document.addEventListener("DOMContentLoaded", () => {
    initializeDeputyAttendance();
});

let deputies = [];
let attendanceRecords = [];
let penalties = [];

async function initializeDeputyAttendance() {
    try {
        await loadDeputies();
        await loadAttendanceRecords();
        await loadPenalties();
        setupEventListeners();
        renderAttendanceTable();
        renderPenaltyTable();
    } catch (error) {
        console.error('Error initializing deputy attendance:', error);
        // errors are already handled in individual load functions
    }
}

async function loadDeputies() {
    try {
        console.log('Loading deputies...');
        const response = await fetch('/api/staff/?staff_type=deputy_rt', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load deputies: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Staff response:', data);
        
        // handle response
        const staffData = data.results || data;
        console.log('Staff data loaded:', staffData.length);
        
        deputies = staffData.filter(staff => staff.staff_type === 'deputy_rt');
        console.log('Deputies found:', deputies.length);
    } catch (error) {
        console.error('Error loading deputies:', error);
        showNotification('Error loading deputy attendance data', 'error');
    }
}

async function loadAttendanceRecords() {
    try {
        const response = await fetch('/api/attendance/', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load attendance records');
        }
        
        const data = await response.json();

        // handle response
        attendanceRecords = data.results || data;
    } catch (error) {
        console.error('Error loading attendance records:', error);
        throw error;
    }
}

async function loadPenalties() {
    try {
        const response = await fetch('/api/penalties/', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load penalties');
        }
        
        const data = await response.json();

        // handle response
        penalties = data.results || data;
    } catch (error) {
        console.error('Error loading penalties:', error);
        throw error;
    }
}

function setupEventListeners() {
    const addDeputyForm = document.getElementById("add-deputy-form");
    if (addDeputyForm) {
        addDeputyForm.addEventListener("submit", handleAddDeputy);
    }
}

async function handleAddDeputy(event) {
    event.preventDefault();
    
    const name = document.getElementById("deputy-name").value.trim();
    const staffId = document.getElementById("deputy-id").value.trim();
    
    if (!name || !staffId) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/staff/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            credentials: 'include',
            body: JSON.stringify({
                staff_id: staffId,
                staff_type: 'deputy_rt',
                department: 'Hostel Management',
                hire_date: new Date().toISOString().split('T')[0],
                salary: 0,
                user: {
                    username: staffId.toLowerCase(),
                    email: `${staffId.toLowerCase()}@hostify.com`,
                    first_name: name.split(' ')[0],
                    last_name: name.split(' ').slice(1).join(' '),
                    role: 'deputy_rt',
                    password: 'deputy123'
                }
            })
        });
        
        if (response.ok) {
            showNotification('Deputy added successfully', 'success');
            await loadDeputies();
            renderAttendanceTable();
            event.target.reset();
        } else {
            throw new Error('Failed to add deputy');
        }
    } catch (error) {
        console.error('Error adding deputy:', error);
        showNotification('Error adding deputy', 'error');
    }
}

function renderAttendanceTable() {
    const attendanceTbody = document.getElementById("attendance-tbody");
    if (!attendanceTbody) return;
    
    attendanceTbody.innerHTML = '';
    
    deputies.forEach(deputy => {
        const row = createAttendanceRow(deputy);
        attendanceTbody.appendChild(row);
    });
}

function createAttendanceRow(deputy) {
    const tr = document.createElement("tr");
    const today = new Date().toISOString().split("T")[0];
    
    tr.innerHTML = `
        <td>${deputy.staff_id}</td>
        <td>${deputy.user_name || 'Unknown'}</td>
        <td>
            <select data-shift="morning" data-deputy="${deputy.id}">
                <option value="">Null</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="leave">Leave</option>
                <option value="holiday">Holiday</option>
            </select>
        </td>
        <td>
            <select data-shift="evening" data-deputy="${deputy.id}">
                <option value="">Null</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="leave">Leave</option>
                <option value="holiday">Holiday</option>
            </select>
        </td>
        <td>
            <select data-shift="night" data-deputy="${deputy.id}">
                <option value="">Null</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="leave">Leave</option>
                <option value="holiday">Holiday</option>
            </select>
        </td>
        <td>
            <select data-marked-by data-deputy="${deputy.id}">
                <option value="Warden 1">Warden 1</option>
                <option value="Warden 2">Warden 2</option>
                <option value="Warden 3">Warden 3</option>
            </select>
        </td>
        <td><input type="date" value="${today}" data-date data-deputy="${deputy.id}"></td>
        <td class="summary-cell" data-deputy="${deputy.id}">Present:0, Absent:0, Leave:0, Holiday:0</td>
    `;
    
    // add event listeners
    setupAttendanceRowListeners(tr, deputy);
    
    return tr;
}

function setupAttendanceRowListeners(row, deputy) {
    const nightSelect = row.querySelector("select[data-shift='night']");
    const eveningSelect = row.querySelector("select[data-shift='evening']");
    const markedBySelect = row.querySelector("select[data-marked-by]");
    const dateInput = row.querySelector("input[data-date]");
    const summaryCell = row.querySelector(".summary-cell");
    
    // update summary when any shift changes
    row.querySelectorAll("select[data-shift]").forEach(select => {
        select.addEventListener("change", () => {
            updateSummary(row, deputy);
            handleNightShiftChange(row, deputy);
        });
    });
    
    // disable night if evening is present
    eveningSelect.addEventListener("change", () => {
        if (eveningSelect.value === "present") {
            nightSelect.disabled = true;
            nightSelect.value = "";
            removeNightPenalty(deputy.id, dateInput.value);
        } else {
            nightSelect.disabled = false;
        }
        updateSummary(row, deputy);
    });
    
    // handle night shift penalty
    nightSelect.addEventListener("change", () => {
        handleNightShiftChange(row, deputy);
        updateSummary(row, deputy);
    });
    
    // save attendance when any field changes
    row.querySelectorAll("select, input").forEach(element => {
        element.addEventListener("change", () => {
            saveAttendance(row, deputy);
        });
    });
}

function updateSummary(row, deputy) {
    const morning = row.querySelector("select[data-shift='morning']").value;
    const evening = row.querySelector("select[data-shift='evening']").value;
    const night = row.querySelector("select[data-shift='night']").value;
    
    let present = 0, absent = 0, leave = 0, holiday = 0;
    
    // rule 1 & 2: morning + evening or morning + night → 1 Present
    if ((morning === "present" && evening === "present") || 
        (morning === "present" && night === "present")) {
        present = 1;
    }
    // rule 3 & 4: morning + evening or morning + night → 1 Absent
    else if ((morning === "absent" && evening === "absent") || 
             (morning === "absent" && night === "absent")) {
        absent = 1;
    }
    // rule 5: at least 2 shifts leave → 1 leave
    else if ([morning, evening, night].filter(v => v === "leave").length >= 2) {
        leave = 1;
    }
    // rule 6: at least 2 shifts holiday → 1 holiday
    else if ([morning, evening, night].filter(v => v === "holiday").length >= 2) {
        holiday = 1;
    }
    
    const summaryCell = row.querySelector(".summary-cell");
    summaryCell.textContent = `Present:${present}, Absent:${absent}, Leave:${leave}, Holiday:${holiday}`;
}

function handleNightShiftChange(row, deputy) {
    const nightSelect = row.querySelector("select[data-shift='night']");
    const markedBySelect = row.querySelector("select[data-marked-by]");
    const dateInput = row.querySelector("input[data-date]");
    
    const status = nightSelect.value;
    const markedBy = markedBySelect.value;
    const date = dateInput.value;
    
    if (status === "present") {
        addNightPenalty(deputy.id, date, markedBy);
    } else {
        removeNightPenalty(deputy.id, date);
    }
}

async function addNightPenalty(deputyId, date, markedBy) {
    try {
        const response = await fetch('/api/penalties/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            credentials: 'include',
            body: JSON.stringify({

                // using student field for deputy
                student: deputyId, 
                penalty_type: 'night_shift',
                amount: 500,
                reason: 'Night shift attendance',
                marked_by: markedBy,
                date: date
            })
        });
        
        if (response.ok) {
            await loadPenalties();
            renderPenaltyTable();
        }
    } catch (error) {
        console.error('Error adding night penalty:', error);
    }
}

async function removeNightPenalty(deputyId, date) {
    try {

        // find and delete the penalty
        const penalty = penalties.find(p => p.student === deputyId && p.date === date);
        if (penalty) {
            const response = await fetch(`/api/penalties/${penalty.id}/`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (response.ok) {
                await loadPenalties();
                renderPenaltyTable();
            }
        }
    } catch (error) {
        console.error('Error removing night penalty:', error);
    }
}

async function saveAttendance(row, deputy) {
    const morning = row.querySelector("select[data-shift='morning']").value;
    const evening = row.querySelector("select[data-shift='evening']").value;
    const night = row.querySelector("select[data-shift='night']").value;
    const markedBy = row.querySelector("select[data-marked-by]").value;
    const date = row.querySelector("input[data-date]").value;
    
    try {
        const attendanceData = {

            // using student field for deputy
            student: deputy.id, 
            date: date,
            morning_shift: morning === "present",
            evening_shift: evening === "present",
            night_shift: night === "present",
            summary: determineSummary(morning, evening, night),
            marked_by: markedBy,
            remarks: `Deputy RT attendance marked by ${markedBy}`
        };
        
        const response = await fetch('/api/attendance/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            credentials: 'include',
            body: JSON.stringify(attendanceData)
        });
        
        if (response.ok) {
            await loadAttendanceRecords();
        }
    } catch (error) {
        console.error('Error saving attendance:', error);
    }
}

function determineSummary(morning, evening, night) {
    if ((morning === "present" && evening === "present") || 
        (morning === "present" && night === "present")) {
        return "Present";
    } else if ((morning === "absent" && evening === "absent") || 
               (morning === "absent" && night === "absent")) {
        return "Absent";
    } else if ([morning, evening, night].filter(v => v === "leave").length >= 2) {
        return "Leave";
    } else if ([morning, evening, night].filter(v => v === "holiday").length >= 2) {
        return "Holiday";
    }
    return "Mixed/Null";
}

function renderPenaltyTable() {
    const penaltyTbody = document.getElementById("penalty-tbody");
    if (!penaltyTbody) return;
    
    penaltyTbody.innerHTML = '';
    
    deputies.forEach(deputy => {
        const deputyPenalties = penalties.filter(p => p.student === deputy.id);
        const monthlyTotal = deputyPenalties.reduce((sum, p) => sum + p.amount, 0);
        
        deputyPenalties.forEach(penalty => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${deputy.staff_id}</td>
                <td>${deputy.user_name || 'Unknown'}</td>
                <td>${formatDate(penalty.date)}</td>
                <td>${penalty.amount}</td>
                <td>${penalty.marked_by || 'Unknown'}</td>
                <td>${monthlyTotal}</td>
            `;
            penaltyTbody.appendChild(tr);
        });
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
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
