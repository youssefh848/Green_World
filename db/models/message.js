import { model, Schema, Types } from "mongoose";

// Define the schema for Message
const messageSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Create and export the Message model
export const Message = model("Message", messageSchema);
