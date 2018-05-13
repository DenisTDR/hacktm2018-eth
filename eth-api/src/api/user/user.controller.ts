import {Request, Response, NextFunction, Router} from 'express';
import {CallModifierFunctionRequestModel} from "../../models/call-modifier-function-request-model";
import ContractsProvider from "../../providers/contracts.provider";
import Web3Factory from "../../config/web3.factory";
import {CallViewFunctionRequestModel} from "../../models/call-view-function-request-model";
import UserProvider from "../../providers/user.provider";
import StorageProvider from "../../providers/storage.provider";

const BigNumber = require('bignumber.js');

export default class UserController {

    public router: Router;


    public initAndGetRouter(): Router {
        console.log("initialized EthController");
        this.router = Router();
        this.router.post('/setArticleAsUsed', UserController.setArticleAsUsed);
        this.router.get('/getReputation', UserController.getReputation);
        this.router.post('/calcReputation', UserController.calcReputation);
        // this.router.post('/modifierFunction', EthController.callModifierFunction);
        // this.router.get('/accounts', EthController.getAccounts);
        // this.router.post('/', Auth.isAuthenticated, ThingController.create);

        return this.router;
    }

    static async setArticleAsUsed(req: Request, res: Response, next: NextFunction) {
        // articleAddress: string, accountAddress: string, userProfileAddress: string
        const model = {
            articleAddress: req.body.articleAddress,
            accountAddress: req.body.accountAddress,
            userProfileAddress: req.body.userProfileAddress,
            password: req.body.password
        };

        if (!model.articleAddress || !model.accountAddress || !model.userProfileAddress || !model.password) {
            res.status(400).send({
                status: "error",
                reason: "invalid request object. example: {articleAddress: string, accountAddress: string, userProfileAddress: string, password: string}"
            });
            return;
        }
        try {
            await UserProvider.setArticleAsUsed(model.articleAddress, model.accountAddress, model.userProfileAddress, model.password, res);
        } catch (e) {
            res.status(500).send({
                status: "error",
                reason: e.message
            });
            console.error(e);
            return;
        }
    }

    static async getReputation(req: Request, res: Response, next: NextFunction) {
        const model = {userProfileAddress: req.query.userProfileAddress};

        if (!model.userProfileAddress) {
            res.status(400).send({
                status: "error",
                reason: "No userProfileAddress provided!"
            });
            return;
        }

        try {
            const reputation = await UserProvider.getReputation(model.userProfileAddress);

            res.send({
                status: "success",
                reputation: parseFloat(reputation) / 1000
            });
        } catch (e) {
            res.status(400).send({
                status: "error",
                reason: e.message
            });
        }
    }

    static async calcReputation(req: Request, res: Response, next: NextFunction) {


        const model = {address: req.body.accountAddress, profile: req.body.userProfileAddress};
        if (!model.address || !model.profile) {
            res.status(400).send({
                status: "error",
                reason: "invalid request. Example: {accountAddress: string, userProfileAddress: string}"
            });
            return;
        }

        try{
            const reputation = await UserProvider.calcReputation(model.address, model.profile);
            res.send({
                status: "success",
                reputation: reputation
            });
        }catch (e) {
            res.status(400).send({
                status: "error",
                reason: e.message
            });
        }

    }
}