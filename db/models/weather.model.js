import { model, Schema, Types } from "mongoose";

// schema
const weatherSchema = new Schema(
  {
    city: {
      type: String,
      trim: true,
      required: true,
    },
    country: {
      type: String,
      trim: true,
      required: true,
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
      },
      lon: {
        type: Number,
        required: true,
      },
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    feelsLike: {
      type: Number,
    },
    humidity: {
      type: Number,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User", // reference to user who requested weather data
      required: false,
    },
  },
  { timestamps: true }
);

// model
export const Weather = model("Weather", weatherSchema);
