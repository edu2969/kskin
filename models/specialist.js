import mongoose, { Schema, models } from "mongoose";

const specialistSchema = new Schema({
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
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
        specialtyIds: {
            type: [mongoose.Types.ObjectId],
            ref: "Specialty"
        }
    },
    { timestamps: true }
);

const Specialist = models.Specialist || mongoose.model("Specialist", specialistSchema);
export default Specialist;