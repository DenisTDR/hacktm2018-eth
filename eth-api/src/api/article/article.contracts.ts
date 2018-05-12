import {Request, Response, NextFunction, Router} from 'express';
import {CallModifierFunctionRequestModel} from "../../models/call-modifier-function-request-model";
import ContractsProvider from "../../providers/contracts.provider";

const BigNumber = require('bignumber.js');

export default class ArticleController {

    public router: Router;


    public initAndGetRouter(): Router {
        console.log("initialized EthController");
        this.router = Router();
        this.router.post('/new', ArticleController.new);
        // this.router.post('/', Auth.isAuthenticated, ThingController.create);

        return this.router;
    }


    /**
     * Create
     * @param {*} req
     * @param {*} res
     * @param {*} next
     */
    public static async new(req: Request, res: Response, next: NextFunction) {

        console.log(req.body);

        const model = {
            hash: req.body.hash
        };


        const contract = await ContractsProvider.getContractArtifacts("article");



        res.send({
            message: 'Created!',
            model: model
        });
    }
}