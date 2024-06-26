import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["client", "admin", "specialist"],
      default: "client",
    },
    rut: {
      type: String,
    },
    gender: {
      type: String,
    },
    birthDate: {
      type: Date,
    },
    avatarImg: {
      type: String,
    },
    phone: {
      type: Number,
    },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);
export default User;