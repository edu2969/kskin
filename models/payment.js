import mongoose, { Schema, models } from "mongoose";

const paymentSchema = new Schema(
    {
        gateway: {
            type: String,
            required: true,
        },        
        orderId: {
            type: mongoose.Types.ObjectId,
            ref: "Order",
        },
        cardNumber: {
            type: Number,
            required: true,
        },
        transactionDate: {
            type: Date,
            required: true,
        },
        orderNumber: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const Payment = models.Payment || mongoose.model("Payment", paymentSchema);
export default Payment;