import mongoose, { Schema, models } from "mongoose";

const purchaseOrderSchema = new Schema(
  {
    number: {
      type: Number,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: Number, /* 0. CHECKOUT, 1. OK, 99. PAYMENT_ERROR */
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    termsOfPayment: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    }
  },
  { timestamps: true }
);

const PurchaseOrder = models.PurchaseOrder || mongoose.model("PurchaseOrder", purchaseOrderSchema);
export default PurchaseOrder;