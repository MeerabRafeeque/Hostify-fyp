
// deputy RT attendance management with shift-based scenario
let students = [];
let attendanceData = [];
let penalties = [];
let selectedDate = new Date().toISOString().split('T')[0];

// ensure arrays are always arrays
if (!Array.isArray(students)) students = [];
if (!Array.isArray(attendanceData)) attendanceData = [];
if (!Array.isArray(penalties)) penalties = [];

// load data on page load
document.addEventListener('DOMContentLoaded', async function() {

    // load data in sequence
    await loadStudents();
    await loadPenalties();
    setupEventListeners();
    
    // set today's date as default
    document.getElementById('attendance-date').value = selectedDate;
    await loadAttendanceForDate(selectedDate);
});

// setup event listeners
function setupEventListeners() {
    // date selector
    document.getElementById('load-attendance').addEventListener('click', function() {
        selectedDate = document.getElementById('attendance-date').value;
        loadAttendanceForDate(selectedDate);
    });
    
    // save attendance
    document.getElementById('save-attendance').addEventListener('click', saveAttendance);
    
    // add student form
    document.getElementById('add-student-form').addEventListener('submit', addNewStudent);
}

// load students assigned rooms by admin
async function loadStudents() {
    try {
        const response = await fetch('/api/students/?has_room=true');
        if (response.ok) {
            const data = await response.json();
            console.log('Raw students data:', data);
            // Handle paginated response - check for results array
            if (data.results && Array.isArray(data.results)) {
                students = data.results;
            } else if (Array.isArray(data)) {
                students = data;
            } else {
                students = [];
                console.error('Unexpected students data structure:', data);
            }
            console.log('Loaded students:', students.length);
            if (students.length > 0) {
                console.log('Sample student:', students[0]);
            }
        } else {
            console.error('Failed to load students, status:', response.status);
            showNotification('Failed to load students', 'error');
            students = [];
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showNotification('Error loading students', 'error');
        students = [];
    }
}

// load attendance for specific date
async function loadAttendanceForDate(date) {
    try {
        const response = await fetch(`/api/attendance/?date=${date}`);
        if (response.ok) {
            const data = await response.json();
            console.log('Raw attendance data:', data);

            // handle paginated response - check for results array
            if (data.results && Array.isArray(data.results)) {
                attendanceData = data.results;
            } else if (Array.isArray(data)) {
                attendanceData = data;
            } else {
                attendanceData = [];
                console.error('Unexpected attendance data structure:', data);
            }
            console.log('Loaded attendance records:', attendanceData.length);
            renderAttendanceTable();
        } else {
            console.error('Failed to load attendance, status:', response.status);
            showNotification('Failed to load attendance', 'error');
            attendanceData = [];
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
        showNotification('Error loading attendance', 'error');
        attendanceData = [];
    }
}

// load penalties
async function loadPenalties() {
    try {
        const response = await fetch('/api/penalties/?penalty_type=night_shift');
        if (response.ok) {
            const data = await response.json();
            console.log('Raw penalties data:', data);

            // handle paginated response - check for results array
            if (data.results && Array.isArray(data.results)) {
                penalties = data.results;
            } else if (Array.isArray(data)) {
                penalties = data;
            } else {
                penalties = [];
                console.error('Unexpected penalties data structure:', data);
            }
            console.log('Loaded penalties:', penalties.length);
            renderPenaltyTable();
        } else {
            console.error('Failed to load penalties, status:', response.status);
            showNotification('Failed to load penalties', 'error');
            penalties = [];
        }
    } catch (error) {
        console.error('Error loading penalties:', error);
        showNotification('Error loading penalties', 'error');
        penalties = [];
    }
}

// render attendance table with shift-based interface
function renderAttendanceTable() {
    const tbody = document.getElementById('attendance-tbody');
    if (!tbody) {
        console.error('Attendance tbody not found');
        return;
    }

    tbody.innerHTML = '';

    // ensure students is an array
    if (!Array.isArray(students)) {
        console.error('Students is not an array:', students);
        students = [];
    }

    // ensure attendanceData is an array
    if (!Array.isArray(attendanceData)) {
        console.error('AttendanceData is not an array:', attendanceData);
        attendanceData = [];
    }

    console.log('Rendering attendance table with', students.length, 'students and', attendanceData.length, 'attendance records');

    // create attendance entries for all students
    students.forEach(student => {
        const existingAttendance = attendanceData.find(a => a.student === student.id);
        const row = createAttendanceRow(student, existingAttendance);
        tbody.appendChild(row);
    });

    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No students found</td></tr>';
    }
}

// create attendance row with shift dropdowns
function createAttendanceRow(student, existingAttendance) {
    const row = document.createElement('tr');
    row.dataset.studentId = student.id;
    
    const shiftOptions = '<option value="Null">Null</option><option value="Present">Present</option><option value="Absent">Absent</option><option value="Holiday">Holiday</option><option value="Leave">Leave</option>';
    
    // safely get student name
    let studentName = 'Unknown';
    try {
        if (student.user && student.user.first_name && student.user.last_name) {
            studentName = `${student.user.first_name} ${student.user.last_name}`;
        } else if (student.first_name && student.last_name) {
            studentName = `${student.first_name} ${student.last_name}`;
        } else if (student.name) {
            studentName = student.name;
        }
    } catch (error) {
        console.error('Error getting student name:', error);
        studentName = 'Unknown';
    }
    
    // safely get student ID
    const studentId = student.student_id || student.id || 'Unknown';
    
    row.innerHTML = `
        <td>${studentId}</td>
        <td>${studentName}</td>
        <td>
            <select class="morning-shift" onchange="handleShiftChange(${student.id}, 'morning')">
                ${shiftOptions}
            </select>
        </td>
        <td>
            <select class="evening-shift" onchange="handleShiftChange(${student.id}, 'evening')">
                ${shiftOptions}
            </select>
        </td>
        <td>
            <select class="night-shift" onchange="handleShiftChange(${student.id}, 'night')">
                ${shiftOptions}
            </select>
        </td>
        <td class="summary-cell">Null</td>
        <td>
            <input type="text" class="remarks" placeholder="Remarks" value="${existingAttendance?.remarks || ''}">
        </td>
    `;

    // set existing values if attendance exists
    if (existingAttendance) {
        row.querySelector('.morning-shift').value = existingAttendance.morning_shift || 'Null';
        row.querySelector('.evening-shift').value = existingAttendance.evening_shift || 'Null';
        row.querySelector('.night-shift').value = existingAttendance.night_shift || 'Null';
        row.querySelector('.summary-cell').textContent = existingAttendance.summary || 'Null';
    }

    return row;
}

// handle shift changes with complex logic
function handleShiftChange(studentId, shiftType) {
    const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
    if (!row) return;

    const morningShift = row.querySelector('.morning-shift').value;
    const eveningShift = row.querySelector('.evening-shift').value;
    const nightShiftSelect = row.querySelector('.night-shift');
    const summaryCell = row.querySelector('.summary-cell');

    // apply shift logic: if morning & evening are present, night should be null
    if (shiftType === 'morning' || shiftType === 'evening') {
        if (morningShift === 'Present' && eveningShift === 'Present') {
            nightShiftSelect.value = 'Null';
        }
    }

    // update summary
    const summary = calculateSummary(morningShift, eveningShift, nightShiftSelect.value);
    summaryCell.textContent = summary;

    // handle night shift penalty
    handleNightShiftChange(studentId, nightShiftSelect.value);
}

// calculate summary based on shifts
function calculateSummary(morning, evening, night) {

    // if both morning and evening are present, summary is present
    if (morning === 'Present' && evening === 'Present') {
        return 'Present';
    }

    // if both morning and evening are absent, summary is absent
    else if (morning === 'Absent' && evening === 'Absent') {
        return 'Absent';
    }

    // if both morning and evening are holiday, summary is holiday
    else if (morning === 'Holiday' && evening === 'Holiday') {
        return 'Holiday';
    }

    // if both morning and evening are leave, summary is leave
    else if (morning === 'Leave' && evening === 'Leave') {
        return 'Leave';
    }

    // mixed shifts - default to present if at least one is present
    else if (morning === 'Present' || evening === 'Present') {
        return 'Present';
    }
    else {
        return 'Absent';
    }
}

// handle night shift penalty logic
function handleNightShiftChange(studentId, nightShiftValue) {
    if (nightShiftValue === 'Present') {

        // create penalty for night shift presence
        createNightPenalty(studentId);
    } else if (nightShiftValue === 'Null') {

        // remove penalty if night shift is null
        removeNightPenalty(studentId);
    }
}

// create night shift penalty
async function createNightPenalty(studentId) {
    try {
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        const response = await fetch('/api/penalties/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                student: studentId,
                penalty_type: 'night_shift',
                amount: 500,
                reason: 'Present during night shift (after 8 PM)'
            })
        });

        if (response.ok) {
            showNotification('Night shift penalty created', 'success');

            // refresh penalty table
            loadPenalties(); 
        } else {
            showNotification('Failed to create penalty', 'error');
        }
    } catch (error) {
        console.error('Error creating penalty:', error);
        showNotification('Error creating penalty', 'error');
    }
}

// remove night shift penalty
async function removeNightPenalty(studentId) {
    try {
        const penalty = penalties.find(p => p.student === studentId && p.penalty_type === 'night_shift');
        if (!penalty) return;

        const response = await fetch(`/api/penalties/${penalty.id}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            showNotification('Night shift penalty removed', 'success');

            // refresh penalty table
            loadPenalties(); 
        } else {
            showNotification('Failed to remove penalty', 'error');
        }
    } catch (error) {
        console.error('Error removing penalty:', error);
        showNotification('Error removing penalty', 'error');
    }
}

// save attendance data
async function saveAttendance() {
    const attendanceRows = document.querySelectorAll('#attendance-tbody tr');
    const attendanceData = [];

    attendanceRows.forEach(row => {
        const studentId = parseInt(row.dataset.studentId);
        const morningShift = row.querySelector('.morning-shift').value;
        const eveningShift = row.querySelector('.evening-shift').value;
        const nightShift = row.querySelector('.night-shift').value;
        const remarks = row.querySelector('.remarks').value;

        attendanceData.push({
            student: studentId,
            morning_shift: morningShift,
            evening_shift: eveningShift,
            night_shift: nightShift,
            remarks: remarks
        });
    });

    try {
        const response = await fetch('/api/attendance/bulk_mark_attendance/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                date: selectedDate,
                attendances: attendanceData
            })
        });

        if (response.ok) {
            const result = await response.json();
            showNotification(result.message, 'success');
            loadAttendanceForDate(selectedDate);
            loadPenalties();
        } else {
            const error = await response.json();
            showNotification('Failed to save attendance: ' + JSON.stringify(error), 'error');
        }
    } catch (error) {
        console.error('Error saving attendance:', error);
        showNotification('Error saving attendance', 'error');
    }
}

// add new student to attendance table
async function addNewStudent(event) {
    event.preventDefault();
    
    const studentName = document.getElementById('student-name').value;
    const studentId = document.getElementById('student-id').value;

    if (!studentName || !studentId) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    try {
        // create user first
        const userResponse = await fetch('/api/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                username: `temp_${Date.now()}`,
                email: `${studentId.toLowerCase()}@hostify.com`,
                password: 'temp123',
                role: 'student',
                first_name: studentName.split(' ')[0],
                last_name: studentName.split(' ').slice(1).join(' ') || ''
            })
        });

        if (!userResponse.ok) {
            showNotification('Failed to create user', 'error');
            return;
        }

        const user = await userResponse.json();

        // create student profile
        const studentResponse = await fetch('/api/students/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                user: user.id,
                student_id: studentId,
                department: 'Computer Science',
                year_of_study: 1,
                parent_name: `Parent of ${studentName}`,
                parent_phone: '+92-300-000000',
                emergency_contact: '+92-300-000000',
                blood_group: 'A+'
            })
        });

        if (studentResponse.ok) {
            const student = await studentResponse.json();
            showNotification('Student added successfully', 'success');
            
            // clear form
            document.getElementById('add-student-form').reset();
            
            // reload students and attendance
            await loadStudents();
            renderAttendanceTable();
        } else {
            showNotification('Failed to create student profile', 'error');
        }
    } catch (error) {
        console.error('Error adding student:', error);
        showNotification('Error adding student', 'error');
    }
}

// render penalty table
function renderPenaltyTable() {
    const tbody = document.getElementById('penalty-tbody');
    if (!tbody) {
        console.error('Penalty tbody not found');
        return;
    }

    tbody.innerHTML = '';

    // ensure penalties is an array
    if (!Array.isArray(penalties)) {
        console.error('Penalties is not an array:', penalties);
        penalties = [];
    }

    console.log('Rendering penalty table with', penalties.length, 'penalties');

    if (penalties.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No penalties found</td></tr>';
        return;
    }

    penalties.forEach(penalty => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${penalty.student.student_id}</td>
            <td>${penalty.student.user.first_name} ${penalty.student.user.last_name}</td>
            <td>${new Date(penalty.issued_date).toLocaleDateString()}</td>
            <td>${penalty.amount}</td>
            <td>${penalty.issued_by ? penalty.issued_by.first_name + ' ' + penalty.issued_by.last_name : 'N/A'}</td>
            <td>${penalty.amount}</td>
        `;
        tbody.appendChild(row);
    });
}

// get CSRF token
function getCSRFToken() {
    const token = document.querySelector('[name=csrfmiddlewaretoken]');
    return token ? token.value : '';
}

// show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('.deputy-container') || document.body;
    container.insertBefore(notification, container.firstChild);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}
