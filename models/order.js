import mongoose, { Schema, models } from "mongoose";
import { ORDER_STATUS } from "@/lib/constants"

const sessionSchema = new Schema({
    from: {
        type: Date,
    },
    to: {
        type: Date,
    },
    assist: {
        type: Boolean,
        required: true,
    }
});

const orderSchema = new Schema({
    number: {
        type: Number,
        required: true,
    },
    orderIdentification: {
        type: String,
        required: true,
    },
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
    clientId: {
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
    isGiftCard: {
        type: Boolean,
        default: false,
    },
    sessions: [sessionSchema]
},
    { timestamps: true }
);

const Order = models.Order || mongoose.model("Order", orderSchema);
export default Order;
