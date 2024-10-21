import mongoose, { Schema, models } from "mongoose";
import { ORDER_STATUS } from "@/lib/constants"

const sessionSchema = new Schema({
    from: {
        type: Date,
        required: true,
    },
    to: {
        type: Date,
        required: true,
    },
    assist: {
        type: Boolean,
        required: true,
    }
});

const orderSchema = new Schema(
    {
        catalogId: {
            type: mongoose.Types.ObjectId,
            ref: "Catalog",
        },
        amount: {
            type: Number,
            required: true,
        },
        remainingBalance: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            enum: [
                ORDER_STATUS.created,
                ORDER_STATUS.confirmed,
                ORDER_STATUS.attending,
                ORDER_STATUS.notAttending,
                ORDER_STATUS.error,
            ],
            default: ORDER_STATUS.created,
        },
        sessions: [sessionSchema]
    },
    { timestamps: true }
);

const Order = models.Order || mongoose.model("Order", orderSchema);
export default Order;
