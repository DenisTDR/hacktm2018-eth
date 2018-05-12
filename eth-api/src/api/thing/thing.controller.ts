import {Request, Response, NextFunction, Router} from 'express';


export default class ThingController {

    public router: Router;


    public initAndGetRouter(): Router {
        console.log("initialized ThingController");
        this.router = Router();
        this.router.get('/', ThingController.getAll);
        // this.router.post('/', Auth.isAuthenticated, ThingController.create);

        return this.router;
    }

    /**
     * Get all
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    public static async getAll(req: Request, res: Response, next: NextFunction) {

        try {

            // 
            // Get data
            // let result = await Model.find().exec();
            let result = {plm: 123};

            // 
            // Response
            res.send({
                message: 'it works! We got all examples',
                result: result
            });
        } catch (err) {

            // 
            // Error response
            res.send({
                message: 'Could not get Examples',
                err: err
            });
        }
    }

    /**
     * Create
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    public static async create(req: Request, res: Response, next: NextFunction) {

        // 
        // Create model
        // let model = new Model({
        //     title: 'Test title',
        //     subtitle: 'test subtitle'
        // });

        // 
        // Save
        // await model.save();

        res.send({
            message: 'Created!',
            model: 'sdsad'
        });
    }
}