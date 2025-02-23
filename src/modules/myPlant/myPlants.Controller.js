import { Plant, User } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";

// Add My Plant
export const addMyPlant = async (req, res, next) => {
  const userId = req.authUser._id;
  const { plantId } = req.params;

  // Find the plant by ID
  const plant = await Plant.findById(plantId);
  if (!plant) {
    return next(new AppError(messages.plant.notFound, 404));
  }

  // Check if the user already has the plant
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError(messages.user.notExist, 404));
  }

  if (user.plants && user.plants.includes(plantId)) {
    return next(new AppError(messages.plant.alreadyAdded, 400));
  }

  // Add plant to user's list
  user.plants.push(plantId);
  await user.save();

  res.status(200).json({
    success: true,
    message: messages.plant.added,
    data: plant,
  });
};

// Delete My Plant
export const deleteMyPlant = async (req, res, next) => {
  const userId = req.authUser._id;
  const { plantId } = req.params;

  // Find the user
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError(messages.user.notExist, 404));
  }

  // Ensure `plants` is an array
  if (!Array.isArray(user.plants)) {
    user.plants = [];
  }

  // Check if the plant exists in the user's list
  const plantIndex = user.plants.indexOf(plantId);
  if (plantIndex === -1) {
    return next(new AppError(messages.plant.notFound, 404));
  }

  // Remove plant from user's list
  user.plants.splice(plantIndex, 1);
  await user.save();

  res.status(200).json({
    success: true,
    message: messages.plant.deleted,
  });
};

// Get My Plants
export const getMyPlants = async (req, res, next) => {
  const userId = req.authUser._id;

  // Find the user
  const user = await User.findById(userId).populate("plants");
  if (!user) {
    return next(new AppError(messages.user.notExist, 404));
  }

  res.status(200).json({
    success: true,
    message: messages.plant.fetchedSuccessfully,
    length: user.plants.length,
    data: user.plants,
  });
};


// get specific plant
export const getMyPlantById = async (req, res, next) => {
  const userId = req.authUser._id;
  const { plantId } = req.params;

  // Find the user and populate the plants
  const user = await User.findById(userId).populate("plants");
  if (!user) return next(new AppError(messages.user.notExist, 404));

  // Check if the plant exists in the user's list
  const plant = user.plants.find(plant => plant._id.toString() === plantId);
  if (!plant) return next(new AppError(messages.plant.notFound, 404));

  res.status(200).json({
    success: true,
    message: messages.plant.fetchedSuccessfully,
    data: plant,
  });
};
