import { Router, Request, Response, NextFunction } from 'express';
import EthController from "../api/eth/eth.controller";
import ArticleController from "../api/article/article.controller";
import UserController from "../api/user/user.controller";
import PopulatorController from "../api/popoulator/populator.controller";

export default class Routes {

    public router: Router;
    private app;


    /*--------  Constructor  --------*/


    constructor(app) {

        // 
        // Set router
        this.router = Router();

        // 
        // Set app
        this.app = app;

        // 
        // Set all routes
        this.setAllRoutes();
    }


    /*--------  Methods  --------*/


    /**
     * Set all app routes
     */
    setAllRoutes() {


        /*--------  Set all custom routes here  --------*/


        // 
        // Your routes goes here
        this.app.use('/eth/eth', new EthController().initAndGetRouter());
        this.app.use('/eth/article', new ArticleController().initAndGetRouter());
        this.app.use('/eth/user', new UserController().initAndGetRouter());
        this.app.use('/eth/populator', new PopulatorController().initAndGetRouter());


        /*--------  Main routes  --------*/


        // 
        // Set main route for any other route found
        this.setMainRoute();
    }

    /**
     * Set main route
     * this route will be used for all other routes not found before
     */
    private setMainRoute() {

        // 
        // All other routes should redirect to the index.html
        this.app.route('/*').get(this.index);
    }

    /**
     * Main route
     */
    private index(req: Request, res: Response, next: NextFunction) {
        res.json({
            message: 'Hello World!'
        });
    }

}