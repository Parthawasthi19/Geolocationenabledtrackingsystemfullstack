const adminUrl = "http://localhost:3000/admin/attendance";

async function fetchAttendance() {
    const response = await fetch(adminUrl);
    const data = await response.json();

    const tableBody = document.getElementById("adminTableBody");
    tableBody.innerHTML = "";

    data.forEach((record) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${record.teacherName}</td>
            <td>${record.teacherID}</td>
            <td>${record.lessonNumber}</td>
            <td>
                ${record.geolocations
                    .map(
                        (geo) =>
                            `<p>${geo.timestamp} - [${geo.latitude}, ${geo.longitude}] - ${geo.address}</p>`
                    )
                    .join("")}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

fetchAttendance();

document.getElementById('clearRecordsBtn').addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all records?')) {
        try {
            const response = await fetch('http://localhost:3000/clearRecords', {
                method: 'DELETE',
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                fetchAttendance(); 
            } else {
                alert('Failed to clear records: ' + result.message);
            }
        } catch (error) {
            console.error('Error clearing records:', error);
            alert('Error clearing records. Please try again.');
        }
    }
});

document.getElementById('downloadExcelBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/getAttendance');
        const data = await response.json();

        if (response.ok) {
            const formattedData = data.map((record) => ({
                Name: record.name,
                ID: record.id,
                Email: record.email,
                Course: record.course,
                Subject: record.subject,
                LessonNumber: record.lessonNumber,
                Coordinates: record.coordinates.join('; '),
                Timestamp: new Date(record.timestamp).toLocaleString(),
            }));

            const worksheet = XLSX.utils.json_to_sheet(formattedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Records');
            XLSX.writeFile(workbook, 'Attendance_Records.xlsx');
            alert('Excel file downloaded successfully!');
        } else {
            alert('Failed to fetch attendance data: ' + data.message);
        }
    } catch (error) {
        console.error('Error downloading Excel:', error);
        alert('Error occurred while downloading the Excel file. Please try again.');
    }
});
