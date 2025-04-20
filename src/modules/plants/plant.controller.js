import { Plant } from "../../../db/models/plants.model.js";
import { AppError } from "../../utils/appError.js";
import cloudinary, { deleteCloudImage } from "../../utils/cloud.js";
import { plantCategories } from "../../utils/constant/enums.js";
import { messages } from "../../utils/constant/messages.js";
import axios from "axios";
import requestIp from 'request-ip';


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

  // Validate temperatureRange
  if (
    !temperatureRange ||
    typeof temperatureRange !== "object" ||
    temperatureRange.min == null ||
    temperatureRange.max == null ||
    temperatureRange.min >= temperatureRange.max
  ) {
    return next(new AppError(messages.plant.invalidTemperatureRange, 400));
  }

  // Append "°C" to temperature values
  const formattedTemperatureRange = {
    min: `${temperatureRange.min}°C`,
    max: `${temperatureRange.max}°C`,
  };

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
    temperatureRange: formattedTemperatureRange,
    soilType,
    ceratedBy: req.authUser._id,
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
  const formattedScientificName = scientificName
    ? scientificName.toLowerCase()
    : undefined;

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

  // Validate temperatureRange if provided
  if (
    temperatureRange &&
    (typeof temperatureRange !== "object" ||
      temperatureRange.min == null ||
      temperatureRange.max == null ||
      temperatureRange.min >= temperatureRange.max)
  ) {
    return next(new AppError(messages.plant.invalidTemperatureRange, 400));
  }

  // Append "°C" to temperature values if temperatureRange is provided
  let formattedTemperatureRange = plant.temperatureRange; // Use existing value if not updated
  if (temperatureRange) {
    formattedTemperatureRange = {
      min: `${temperatureRange.min}°C`,
      max: `${temperatureRange.max}°C`,
    };
  }
  req.failImages = [];

  // Update Plant Image on Cloudinary
  if (req.files?.Image) {
    // Delete old image if exists
    if (plant.Image && plant.Image.public_id) {
      await deleteCloudImage(plant.Image.public_id);
    }

    // Upload new image
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.Image[0].path,
      {
        folder: "plants",
      }
    );

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
  if (temperatureRange) plant.temperatureRange = formattedTemperatureRange;
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
      noMatchMessage =
        messages.plant.noWateringFrequencyMatch(wateringFrequency);
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

// Get Plants By Category
export const getPlantsByCategory = async (req, res, next) => {
  const { category } = req.params; // category from URL parameter

  // Check if the provided category is valid
  if (!Object.values(plantCategories).includes(category)) {
    return next(new AppError(messages.plant.invalidCategory, 400));
  }

  // Fetch plants from the database by category
  const plants = await Plant.find({ category });

  // If no plants found, return a message
  if (!plants || plants.length === 0) {
    return next(new AppError(messages.plant.noCategoryMatch(category), 404));
  }

  // Return the plants in the response
  return res.status(200).json({
    success: true,
    message: messages.plant.fetchedSuccessfully,
    count: plants,
    data: plants,
  });
};

// Get plant by use weather 
export const suggestPlantsBasedOnWeather = async (req, res, next) => {
  // Get the user's IP address from the x-forwarded-for header
  // const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const ip = requestIp.getClientIp(req);
  // Fetch location data based on IP
  const locationResponse = await axios.get(`http://ip-api.com/json/${ip}`)
    .catch(err => next(new AppError(messages.plant.unableToGetLocation, 400)));
  
  if (locationResponse.data.status !== 'success') {
    return next(new AppError(messages.plant.unableToGetLocation, 400));
  }

  const { lat, lon, city } = locationResponse.data;

  // Fetch weather data based on location
  const weatherResponse = await axios.get(
    `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`
  ).catch(err => next(new AppError(messages.plant.unableToGetWeather, 400)));

  const currentTemperature = weatherResponse.data.main.temp;

  // Fetch all plants from the database
  const allPlants = await Plant.find()
    .catch(err => next(new AppError(messages.plant.failToFetch, 500)));

  // Filter plants based on temperatureRange
  const matchingPlants = allPlants.filter(plant => {
    const minTemp = parseFloat(plant.temperatureRange.min);
    const maxTemp = parseFloat(plant.temperatureRange.max);
    return currentTemperature >= minTemp && currentTemperature <= maxTemp;
  });

  const count = matchingPlants.length;

  // Check if any plants were found
  if (matchingPlants.length === 0) {
    return res.status(200).json({
      success: true,
      message: messages.plant.noSuitablePlants,
      count: 0,
      data: [],
    });
  }

  // Get only plant IDs
  const plantIds = matchingPlants.map(plant => plant._id);

  // Send response with matching plant IDs and count
  res.status(200).json({
    success: true,
    message: messages.plant.suggestedPlants,
    count: count,
    data: plantIds,
  });
};
