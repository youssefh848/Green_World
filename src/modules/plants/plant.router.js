import { Router } from "express";
import { addPlant, deletePlantById, getAllPlants, getPlantsByCategory,  getSpecificPlant, suggestPlantsBasedOnWeather, updatePlant } from "./plant.controller.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";
import { addPlantVal, deletePlantVal, getAllPlantsVal, getPlantsByCategoryVal, getSpecificPlantVal, updatePlantVal } from "./plant.validation.js";
import { isValid } from "../../middleware/validation.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { cloudUploads } from "../../utils/multer-cloud.js";

const plantRouter = Router();

// addPlant
plantRouter.post('/add-plant',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    cloudUploads({}).fields([{ name: 'Image', maxCount: 1 }]),
    isValid(addPlantVal),
    asyncHandler(addPlant)
)

// updatePlant
plantRouter.put('/:plantId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    cloudUploads({}).fields([{ name: 'Image', maxCount: 1 }]),
    isValid(updatePlantVal),
    asyncHandler(updatePlant)
)

// get specific plant
plantRouter.get('/get-specific/:plantId', 
    isAuthenticated(),
    isAuthorized([roles.ADMIN , roles.USER]),
    isValid(getSpecificPlantVal),
    asyncHandler(getSpecificPlant)
)

// get all plants
plantRouter.get('/',
    isAuthenticated(),
    isAuthorized([roles.ADMIN , roles.USER]),
    isValid(getAllPlantsVal),
    asyncHandler(getAllPlants)
)

// delete plant
plantRouter.delete('/:plantId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    isValid(deletePlantVal),
    asyncHandler(deletePlantById)
)

// get plant by category
plantRouter.get('/category/:category',
    isAuthenticated(),
    isAuthorized([roles.ADMIN , roles.USER]),
    isValid(getPlantsByCategoryVal),
    asyncHandler(getPlantsByCategory)
)

// suggest plant by weather 
plantRouter.get('/suggest',
    isAuthenticated(),
    isAuthorized([roles.ADMIN , roles.USER]),
    asyncHandler(suggestPlantsBasedOnWeather)
)

export default plantRouter;