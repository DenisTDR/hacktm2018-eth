import {Request, Response, NextFunction, Router} from 'express';
import {CallModifierFunctionRequestModel} from "../../models/call-modifier-function-request-model";
import ContractsProvider from "../../providers/contracts.provider";
import Web3Factory from "../../config/web3.factory";
import {CallViewFunctionRequestModel} from "../../models/call-view-function-request-model";

const BigNumber = require('bignumber.js');

export default class UserController {

    public router: Router;


    public initAndGetRouter(): Router {
        console.log("initialized EthController");
        this.router = Router();
        this.router.post('/createAccount', UserController.setArticleAsUsed);
        // this.router.post('/modifierFunction', EthController.callModifierFunction);
        // this.router.get('/accounts', EthController.getAccounts);
        // this.router.post('/', Auth.isAuthenticated, ThingController.create);

        return this.router;
    }

    static async setArticleAsUsed(req: Request, res: Response, next: NextFunction) {

        const contract = await ContractsProvider.getContractArtifacts("userprofile");


    }
}