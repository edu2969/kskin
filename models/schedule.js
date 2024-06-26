import mongoose, { Schema, models } from "mongoose";

const noAvailableSchema = new Schema({
    repeat: {
        type: Boolean,
        required: true,
    },
    days: { type: [Number], required: true },
    dateFrom: { type: Date, required: true },
    dateTo: { type: Date, required: true }
}, { _id: false });

const scheduleSchema = new Schema({
    specialistId: {
        type: mongoose.Types.ObjectId,
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
    noAvailables: {
        type: noAvailableSchema,
    },
},
    { timestamps: true }
);

const Schedule = models.Schedule || mongoose.model("Schedule", scheduleSchema);
export default Schedule;