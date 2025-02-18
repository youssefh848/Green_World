import { Plant } from "../../../db/models/plants.model.js";
import { AppError } from "../../utils/appError.js";
import cloudinary, { deleteCloudImage } from "../../utils/cloud.js";
import { messages } from "../../utils/constant/messages.js";

// Add Plant
export const addPlant = async (req, res, next) => {
  // Get data from request body
  const {
    name,
    scientificName,
    category,
    origin,
    description,
    wateringFrequency,
    temperatureRange,
    soilType,
  } = req.body;

  // Convert name to lowercase for consistency
  const formattedName = name.toLowerCase();

  // Check if the plant already exists
  const existingPlant = await Plant.findOne({ name: formattedName, origin });
  if (existingPlant) {
    return next(new AppError(messages.plant.alreadyExist, 400));
  }

  // Handle image upload
  let Image = { secure_url: "", public_id: "" };
  if (req.files?.Image) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.Image[0].path,
      { folder: "plants" }
    );
    Image = { secure_url, public_id };
    req.failImages = [public_id]; 
  }

  // Prepare plant data
  const plant = new Plant({
    name: formattedName,
    scientificName,
    category,
    origin,
    description,
    Image,
    wateringFrequency,
    temperatureRange,
    soilType,
  });

  // Save the new plant
  const newPlant = await plant.save();
  if (!newPlant) {
    if (req.files?.Image) {
      await deleteCloudImage(req.failImages[0]); // Rollback if save fails
    }
    return next(new AppError(messages.plant.failToCreate, 500));
  }

  // Send response
  res.status(201).json({
    success: true,
    message: messages.plant.created,
    data: newPlant,
  });
};

// Update Plant
export const updatePlant = async (req, res, next) => {
  // Get plantId from params
  const { plantId } = req.params;
  const {
    name,
    scientificName,
    category,
    origin,
    description,
    wateringFrequency,
    temperatureRange,
    soilType,
  } = req.body;

  // Convert name and scientificName to lowercase for consistency (if provided)
  const formattedName = name ? name.toLowerCase() : undefined;
  const formattedScientificName = scientificName ? scientificName.toLowerCase() : undefined;

  // Check if the plant exists
  const plant = await Plant.findById(plantId);
  if (!plant) {
    return next(new AppError(messages.plant.notExist, 404));
  }

  // Check for duplicate plant (excluding current one)
  if (formattedName) {
    const existingPlant = await Plant.findOne({
      name: formattedName,
      _id: { $ne: plantId },
    });
    if (existingPlant) {
      return next(new AppError(messages.plant.alreadyExist, 400));
    }
  }

  req.failImages = [];

  // Update Plant Image on Cloudinary
  if (req.files?.Image) {
    // Delete old image if exists
    if (plant.Image && plant.Image.public_id) {
      await deleteCloudImage(plant.Image.public_id);
    }

    // Upload new image
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.Image[0].path, {
      folder: "plants",
    });

    // Assign new image
    plant.Image = { secure_url, public_id };
    req.failImages.push(public_id);
  }

  // Update Other Fields If Provided
  if (formattedName) plant.name = formattedName;
  if (formattedScientificName) plant.scientificName = formattedScientificName;
  if (category) plant.category = category;
  if (origin) plant.origin = origin;
  if (description) plant.description = description;
  if (wateringFrequency) plant.wateringFrequency = wateringFrequency;
  if (temperatureRange) plant.temperatureRange = temperatureRange;
  if (soilType) plant.soilType = soilType;

  // Save Updated Plant
  const updatedPlant = await plant.save();
  if (!updatedPlant) {
    return next(new AppError(messages.plant.failToUpdate, 500));
  }

  // Send Response
  return res.status(200).json({
    message: messages.plant.updated,
    success: true,
    data: updatedPlant,
  });
};

// get specific plant
export const getSpecificPlant = async (req, res, next) => {
  const { plantId } = req.params;

  // Find the plant by ID
  const plant = await Plant.findById(plantId);
  if (!plant) {
    return next(new AppError(messages.plant.notExist, 404));
  }

  // Return the plant data
  return res.status(200).json({
    message: messages.plant.fetchedSuccessfully,
    success: true,
    data: plant,
  });
};


// get all plants
export const getAllPlants = async (req, res, next) => {
  const { name, category, origin, soilType, wateringFrequency } = req.query;

  // Create a dynamic filter object based on query parameters
  const filter = {};

  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }
  if (category) {
    filter.category = { $regex: category, $options: "i" };
  }
  if (origin) {
    filter.origin = { $regex: origin, $options: "i" };
  }
  if (soilType) {
    filter.soilType = { $regex: soilType, $options: "i" };
  }
  if (wateringFrequency) {
    filter.wateringFrequency = { $regex: wateringFrequency, $options: "i" };
  }

  // Query the database using the filters
  const plants = await Plant.find(filter);

  // If no plants are found
  if (!plants || plants.length === 0) {
    let noMatchMessage = messages.plant.failToFetch;

    if (name) {
      noMatchMessage = messages.plant.noNameMatch(name);
    } else if (category) {
      noMatchMessage = messages.plant.noCategoryMatch(category);
    } else if (origin) {
      noMatchMessage = messages.plant.noOriginMatch(origin);
    } else if (soilType) {
      noMatchMessage = messages.plant.noSoilTypeMatch(soilType);
    } else if (wateringFrequency) {
      noMatchMessage = messages.plant.noWateringFrequencyMatch(wateringFrequency);
    }

    return next(new AppError(noMatchMessage, 404));
  }

  // Return the data
  res.status(200).json({
    success: true,
    message: messages.plant.fetchedSuccessfully,
    count: plants.length,
    data: plants,
  });
};

// Delete Plant
export const deletePlantById = async (req, res, next) => {
  const { plantId } = req.params;

  // Ensure plantId is provided
  if (!plantId) {
    return next(new AppError(messages.plant.notExist, 400));
  }

  // Find the plant by ID
  const plant = await Plant.findById(plantId);
  if (!plant) {
    return next(new AppError(messages.plant.notExist, 404));
  }

  // Delete the associated image from Cloudinary (if exists)
  if (plant.Image?.public_id) {
    await deleteCloudImage(plant.Image.public_id);
  }

  // Delete the plant from the database
  await plant.deleteOne();

  // Send response
  res.status(200).json({
    message: messages.plant.deleted,
    success: true,
  });
};