import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

// add MyPlant Val
export const addMyPlantVal = joi.object({
  plantId: generalFields.objectId.required(),
});

// delete MyPlant Val
export const deleteMyPlantVal = joi.object({
  plantId: generalFields.objectId.required(),
});

// get MyPlant by ID Val
export const getMyPlantByIdVal = joi.object({
  plantId: generalFields.objectId.required(),
});
