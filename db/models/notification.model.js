import { model, Schema, Types } from "mongoose";

// Define the schema for Notification
const notificationSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: null, // Optional link to redirect the user
    },
    read: {
      type: Boolean,
      default: false, // Indicates whether the notification has been read
    },
    createdAt: {
      type: Date,
      default: Date.now, // Timestamp when the notification was created
    },
  },
  { timestamps: true }
);

// Create and export the Notification model
export const Notification = model("Notification", notificationSchema);
