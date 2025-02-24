import { model, Schema } from "mongoose";
import { plantCategories, soilTypes, wateringFrequencies } from "../../src/utils/constant/enums.js";

// schema
const plantSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    scientificName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(plantCategories),
      required: true,
    },
    origin: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    Image: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    wateringFrequency: {
      type: String,
      enum: Object.values(wateringFrequencies),
      required: true,
    },
    temperatureRange: {
      type: String,
      required: true,
    },
    soilType: {
      type: String,
      enum: Object.values(soilTypes),
      required: true,
    },
  },
  { timestamps: true }
);

// model
export const Plant = model("Plant", plantSchema);
