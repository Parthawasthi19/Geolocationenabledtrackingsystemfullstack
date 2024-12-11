const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/teacherAttendance", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => console.log("Connected to MongoDB"));

const attendanceSchema = new mongoose.Schema({
    teacherName: String,
    teacherID: String,
    email: String,
    lessonNumber: String,
    course: String,
    subject: String,
    geolocations: [
        {
            timestamp: String,
            latitude: Number,
            longitude: Number,
            address: String,
        },
    ],
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

app.post("/attendance", async (req, res) => {
    try {
        const { teacherData, geolocationData } = req.body;

        let attendanceRecord = await Attendance.findOne({
            teacherID: teacherData.teacherID,
            lessonNumber: teacherData.lessonNumber,
        });

        if (!attendanceRecord) {
            attendanceRecord = new Attendance({
                ...teacherData,
                geolocations: [],
            });
        }

        attendanceRecord.geolocations.push(...geolocationData);
        await attendanceRecord.save();

        res.status(200).send("Attendance saved successfully");
    } catch (error) {
        res.status(500).send("Error saving attendance: " + error.message);
    }
});

app.get("/admin/attendance", async (req, res) => {
    try {
        const records = await Attendance.find({});
        res.status(200).json(records);
    } catch (error) {
        res.status(500).send("Error fetching attendance: " + error.message);
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.delete('/clearRecords', async (req, res) => {
    try {
        await Attendance.deleteMany({});
        res.status(200).send({ message: 'All records cleared successfully!' });
    } catch (err) {
        console.error('Error clearing records:', err);
        res.status(500).send({ message: 'Failed to clear records.' });
    }
});