import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

// add Plant Val
export const addPlantVal = joi.object({
    name : generalFields.name.required(),
    scientificName : generalFields.scientificName.required(),
    category : generalFields.category.required(),
    origin : generalFields.origin.required(),
    description : generalFields.description.required(),
    wateringFrequency : generalFields.wateringFrequency.required(),
    temperatureRange : generalFields.temperatureRange.required(),
    soilType : generalFields.soilType.required(),
    
});

// update Plant Val
export const updatePlantVal = joi.object({
    name : generalFields.name.optional(),
    scientificName : generalFields.scientificName.optional(),
    category : generalFields.category.optional(),
    origin : generalFields.origin.optional(),
    description : generalFields.description.optional(),
    wateringFrequency : generalFields.wateringFrequency.optional(),
    temperatureRange : generalFields.temperatureRange.optional(),
    soilType : generalFields.soilType.optional(),
    plantId : generalFields.objectId.required()

})

// get specific plant Val
export const getSpecificPlantVal = joi.object({
    plantId : generalFields.objectId.required()
})


// get all plants Val
export const getAllPlantsVal = joi.object({
    name : generalFields.name.optional(),
    category : generalFields.category.optional(),
    origin : generalFields.origin.optional(),
    soilType : generalFields.soilType.optional(),
    wateringFrequency : generalFields.wateringFrequency.optional()
})

// delete plant Val
export const deletePlantVal = joi.object({
    plantId : generalFields.objectId.required()
})

// get plant by category Val
export const getPlantsByCategoryVal = joi.object({
    category : generalFields.category.required()
})