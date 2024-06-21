import mongoose, { Schema, models } from "mongoose";

const specialtySchema = new Schema({
        name: {
            type: String,
            required: true,
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
    },
    { timestamps: true }
);

const Specialty = models.Specialty || mongoose.model("Specialty", specialtySchema);
export default Specialty;