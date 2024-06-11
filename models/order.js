import mongoose, { Schema, models } from "mongoose";

const orderSchema = new Schema(
    {
        catalogId: {
            type: mongoose.Types.ObjectId,
            ref: "Catalog",
        },
        price: {
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
            required: true,
        },
    },
    { timestamps: true }
);

const Order = models.Order || mongoose.model("Order", orderSchema);
export default Order;

export const ORDER_STATUS = {
    created: "CRE",
    confirmed: "CON",
    error: "ERR",
}