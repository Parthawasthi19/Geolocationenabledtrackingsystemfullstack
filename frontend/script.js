const apiUrl = "http://localhost:3000/attendance"; 
let geolocationData = [];
let teacherDetails;
let attendanceInterval;

const teacherForm = document.getElementById("teacherForm");
const startAttendance = document.getElementById("startAttendance");
const stopAttendance = document.getElementById("stopAttendance");

teacherForm.addEventListener("submit", (e) => {
    e.preventDefault();

    teacherDetails = {
        teacherName: document.getElementById("name").value,
        teacherID: document.getElementById("id").value,
        email: document.getElementById("email").value,
        lessonNumber: document.getElementById("lesson").value,
        course: document.getElementById("course").value,
        subject: document.getElementById("subject").value,
    };

    alert("Logged in successfully!");
    startAttendance.disabled = false;
    teacherForm.reset();
});

startAttendance.addEventListener("click", () => {
    if (navigator.geolocation) {
        alert("Starting attendance...");
        startAttendance.disabled = true;
        stopAttendance.disabled = false;

        attendanceInterval = setInterval(async () => {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const timestamp = new Date().toLocaleString();
                const address = await fetchAddress(latitude, longitude);

                geolocationData.push({
                    timestamp,
                    latitude,
                    longitude,
                    address,
                });
            });
        }, 5000);
    } else {
        alert("Geolocation not supported by this browser.");
    }
});

stopAttendance.addEventListener("click", async () => {
    clearInterval(attendanceInterval);
    stopAttendance.disabled = true;

    await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            teacherData: teacherDetails,
            geolocationData,
        }),
    });

    alert("Attendance data sent to admin.");
    geolocationData = [];
});

async function fetchAddress(latitude, longitude) {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    );
    const data = await response.json();
    return data.display_name;
}
