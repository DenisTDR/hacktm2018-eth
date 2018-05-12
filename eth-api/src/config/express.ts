import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import * as mongoose from "mongoose";
import Routes from "./routes";

import * as cors from "cors";


class Express {

    public app: express.Express;
    private envFile = 'src/.env';


    /*--------  Constructor  --------*/


    constructor() {

        // 
        // ENV
        this.setEnv();

        // 
        // Mongo
        this.connectToMongo();

        // 
        // Start App
        this.app = express();

        this.enableCors();
        // 
        // Set view engine
        // this.setViewEngine();

        // 
        // Middleware
        this.setMiddleware();

        // 
        // Set static files
        this.setStaticFiles();

        // 
        // Routes
        this.setRoutes();
    }


    /*--------  Methods  --------*/


    /**
     * Set env
     * Set env from .env or .env.${NODE_ENV} file using dotenv
     */
    private setEnv() {

        // 
        // Add NODE_ENV to path if is not production
        if (process.env.NODE_ENV !== 'production' && typeof process.env.NODE_ENV !== 'undefined') this.envFile += '.' + process.env.NODE_ENV;

        console.log(`using envFile: ${this.envFile}`);
        // 
        // Set env from file
        dotenv.config({path: this.envFile});
    }

    /**
     * Connect to mongo
     */
    private connectToMongo() {

        const options = {};

        // Connect to mongo using mongoose

        const mongoUri = process.env.MONGO_URI;

        if (typeof mongoUri === 'undefined' || !mongoUri) {
            console.error("invalid MONGO_URI");
            process.exit(-1);
        }

        mongoose.connect(process.env.MONGO_URI, options, (err => {
            if (err) {
                console.error("can't connect to mongo");
                console.error(err);
                process.exit(-1);
                return;
            }
            console.log("connected to MongoDB");
        }));
    }

    /**
     * Set view engine
     */
    private setViewEngine() {

        // 
        // Configure ejs as view engine
        this.app.set("views", path.join(__dirname, "../../src/views"));
        this.app.set("view engine", "ejs");
    }

    /**
     * Set middleware
     */
    private setMiddleware() {

        // 
        // Add logging
        this.app.use(logger("dev"));

        // 
        // Add body parser
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: false}));


        // 
        // Add cookie parser
        this.app.use(cookieParser());

    }

    /**
     * Set static files
     */
    private setStaticFiles() {

        // 
        // Set static route for public folder
        this.app.use(express.static(path.join(__dirname, "../../src/public")));
    }

    /**
     * Set routes
     */
    private setRoutes() {

        // 
        // Create Routes, and export its configured Express.Router
        new Routes(this.app);
    }

    private enableCors() {
        const corsOptions = {
            origin: [
                'http://localhost:4200',
                'http://localhost:4000',
                'https://opiria.io',
                'https://panel.opiria.io',
            ],
            credentials: true,
            optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
        };

        this.app.use(cors(corsOptions));
    }
}

export default new Express().app;