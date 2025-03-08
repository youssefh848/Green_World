import cors from 'cors';
import { globalErrorHandling } from "./utils/appError.js";
import { authRouter, myPlantRouter, plantRouter } from './modules/index.js';

export const bootStrap = (app, express) => {
    // parse req
    app.use(express.json());
    // cors edit
    const corsOptions = {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    };
    app.use(cors(corsOptions));

    // routing
    app.use("/auth", authRouter);
    app.use("/plant", plantRouter);
    app.use("/my-plant", myPlantRouter);


    // global error
    app.use(globalErrorHandling);
};
