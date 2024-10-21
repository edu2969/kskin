import mongoose, { Schema, models } from "mongoose";

const scheduleSchema = new Schema({
    specialistId: {
        type: [mongoose.Types.ObjectId],
        ref: "Specialist",
    },
    clientId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    catalogId: {
        type: mongoose.Types.ObjectId,
        ref: "Catalog",
    },
    startDate: {
        type: Date,
    },
    duration: {
        type: Number,
    },
    allDay: {
        type: Boolean,
    },
    noAvailable: {
        type: Boolean,
    }
},
    { timestamps: true }
);

const Schedule = models.Schedule || mongoose.model("Schedule", scheduleSchema);
export default Schedule;