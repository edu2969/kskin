import mongoose, { Schema, models } from "mongoose";

const availableSchema = new Schema({
    day: { type: String, required: true },
    msFrom: { type: Number, required: true },
    msTo: { type: Number, required: true }
  }, { _id: false });

const disableSchema = new Schema({
    dateFrom: { type: Date, required: true },
    dateTo: { type: Date, required: true },
  }, { _id: false });

const scheduleSchema = new Schema({
        specialistId: {
            type: mongoose.Types.ObjectId,
            ref: "Catalog",
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        active: {
            type: Boolean,
            required: true,
        },
        availables: {
            type: [availableSchema],
            required: true
        },
        disables: {
            type: [disableSchema],
            required: true
        },
    },
    { timestamps: true }
);

const Schedule = models.Schedule || mongoose.model("Schedule", scheduleSchema);
export default Schedule;