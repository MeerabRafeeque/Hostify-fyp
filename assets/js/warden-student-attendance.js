// warden student attendance functions
document.addEventListener("DOMContentLoaded", () => {
    initializeStudentAttendance();
});

async function initializeStudentAttendance() {
    try {
        await loadAttendanceRecords();
    } catch (error) {
        console.error('Error initializing student attendance:', error);
        // error is already handled in loadAttendanceRecords
    }
}

async function loadAttendanceRecords() {
    try {
        console.log('Loading attendance records...');
        const response = await fetch('/api/attendance/', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load attendance records: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Attendance response:', data);
        
        // handle paginated response
        const attendanceRecords = data.results || data;
        console.log('Attendance records loaded:', attendanceRecords.length);
        
        renderAttendanceRecords(attendanceRecords);
    } catch (error) {
        console.error('Error loading attendance records:', error);
        showNotification('Error loading attendance records', 'error');
    }
}

function renderAttendanceRecords(records) {
    const tableBody = document.getElementById('attendanceTableBody');
    if (!tableBody) return;
    
    if (records.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="no-records">No attendance records found</td>
            </tr>
        `;
        return;
    }
    
    // group records by student and date
    const groupedRecords = groupRecordsByStudentAndDate(records);
    
    tableBody.innerHTML = '';
    
    Object.keys(groupedRecords).forEach(key => {
        const [studentId, date] = key.split('-');
        const studentRecords = groupedRecords[key];
        
        // get student ID from the first record
        const actualStudentId = studentRecords[0].student ? 
            (studentRecords[0].student.student_id || studentRecords[0].student.id) : 
            studentId;
        
        // get student info from first record
        const firstRecord = studentRecords[0];
        const studentName = firstRecord.student && firstRecord.student.user 
            ? `${firstRecord.student.user.first_name} ${firstRecord.student.user.last_name}` 
            : 'Unknown Student';
        
        // create attendance row
        const row = createAttendanceRow(studentName, actualStudentId, date, studentRecords);
        tableBody.appendChild(row);
    });
}

function groupRecordsByStudentAndDate(records) {
    const grouped = {};
    
    records.forEach(record => {

        // use student ID instead of student object
        const studentId = record.student ? record.student.id || record.student : 'unknown';
        const key = `${studentId}-${record.date}`;
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(record);
    });
    
    return grouped;
}

function createAttendanceRow(studentName, studentId, date, records) {
    const tr = document.createElement('tr');
    
    // get shift statuses from the first record (since they're grouped by student and date)
    const firstRecord = records[0];
    const morningRecord = firstRecord.morning_shift === 'Present';
    const eveningRecord = firstRecord.evening_shift === 'Present';
    const nightRecord = firstRecord.night_shift === 'Present';
    
    // get marked by info (use first record)
    const markedBy = records[0].marked_by && records[0].marked_by.user 
        ? `${records[0].marked_by.user.first_name} ${records[0].marked_by.user.last_name}` 
        : 'Deputy RT';
    const remarks = records[0].remarks || '';
    
    // determine summary status
    const summary = determineSummaryStatus(morningRecord, eveningRecord, nightRecord);
    
    tr.innerHTML = `
        <td>${studentName}</td>
        <td>${studentId}</td>
        <td>${formatDate(date)}</td>
        <td><span class="status ${morningRecord ? 'present' : 'absent'}">${morningRecord ? 'Present' : 'Absent'}</span></td>
        <td><span class="status ${eveningRecord ? 'present' : 'absent'}">${eveningRecord ? 'Present' : 'Absent'}</span></td>
        <td><span class="status ${nightRecord ? 'present' : 'absent'}">${nightRecord ? 'Present' : 'Absent'}</span></td>
        <td><span class="status ${getSummaryStatusClass(summary)}">${summary}</span></td>
        <td>${markedBy}</td>
        <td>${remarks}</td>
    `;
    
    return tr;
}

function determineSummaryStatus(morning, evening, night) {
    const presentCount = [morning, evening, night].filter(Boolean).length;
    
    if (presentCount >= 2) return 'Present';
    if (presentCount === 1) return 'Partial';
    return 'Absent';
}

function getSummaryStatusClass(summary) {
    const classes = {
        'Present': 'present',
        'Partial': 'partial',
        'Absent': 'absent',
        'Leave': 'leave',
        'Holiday': 'holiday'
    };
    return classes[summary] || 'absent';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type = 'info') {

    // create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // add to page
    document.body.appendChild(notification);
    
    // auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}
