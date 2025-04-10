import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";
import { isValid } from "../../middleware/validation.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { addMyPlant, deleteMyPlant, getMyPlantById, getMyPlants } from "./myPlants.Controller.js";
import { addMyPlantVal, deleteMyPlantVal, getMyPlantByIdVal } from "./myPlants.Validation.js";


const myPlantRouter = Router();
// addMyPlant
myPlantRouter.post('/add-my-plant/:plantId',
    isAuthenticated(),
    isAuthorized([roles.USER , roles.ADMIN]),
    isValid(addMyPlantVal),
    asyncHandler(addMyPlant)
)

// deleteMyPlant
myPlantRouter.delete('/:plantId',
    isAuthenticated(),
    isAuthorized([roles.USER , roles.ADMIN]),
    isValid(deleteMyPlantVal),
    asyncHandler(deleteMyPlant)
)

// get my plants
myPlantRouter.get('/my-plants',
    isAuthenticated(),
    isAuthorized([roles.USER , roles.ADMIN]),
    asyncHandler(getMyPlants)
)

// get specific plant
myPlantRouter.get('/:plantId',
    isAuthenticated(),
    isAuthorized([roles.USER , roles.ADMIN]),
    isValid(getMyPlantByIdVal),
    asyncHandler(getMyPlantById)
)
export default myPlantRouter;