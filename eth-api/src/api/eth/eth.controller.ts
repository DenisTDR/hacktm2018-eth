import {Request, Response, NextFunction, Router} from 'express';
import {CallModifierFunctionRequestModel} from "../../models/call-modifier-function-request-model";
import ContractsProvider from "../../providers/contracts.provider";
import Web3Factory from "../../config/web3.factory";
import {CallViewFunctionRequestModel} from "../../models/call-view-function-request-model";

const BigNumber = require('bignumber.js');

export default class EthController {

    public router: Router;


    public initAndGetRouter(): Router {
        console.log("initialized EthController");
        this.router = Router();
        this.router.post('/createAccount', EthController.createAccount);
        this.router.post('/modifierFunction', EthController.callModifierFunction);
        this.router.get('/accounts', EthController.getAccounts);
        // this.router.post('/', Auth.isAuthenticated, ThingController.create);

        return this.router;
    }

    static async callModifierFunction(req: Request, res: Response, next: NextFunction) {
        const requestObject: CallModifierFunctionRequestModel = req.body;

        const contract = await ContractsProvider.getContractArtifacts(requestObject.contractName.toLowerCase()).at(requestObject.address);

        try {
            let result;

            if (requestObject.methodName) {
                result = await contract[requestObject.methodName](...requestObject.params, {
                    from: requestObject.from,
                    value: requestObject.value ? new BigNumber(requestObject.value).mul(new BigNumber(10).pow(18)) : undefined,
                    gas: requestObject.gas
                });
            }
            else {
                result = await contract.sendTransaction({
                    from: requestObject.from,
                    value: requestObject.value ? new BigNumber(requestObject.value).mul(new BigNumber(10).pow(18)) : undefined,
                    gas: requestObject.gas
                });
            }

            setTimeout(() => {
                res.send({
                    result: result
                });
            }, 2000);
        } catch (err) {
            console.error(err);
            res.status(400).send({
                result: err.message
            });
        }
    }


    static async callViewFunction(req: Request, res: Response, next: NextFunction) {
        const requestObject: CallViewFunctionRequestModel = req.body;
        const contract = await ContractsProvider.getContractArtifacts(requestObject.contractName.toLowerCase()).at(requestObject.address);
        let result = await contract[requestObject.methodName].call(...requestObject.params);
        if (result && result.constructor.name === 'BigNumber') {
            result = new BigNumber(result.toString(10))
                .div(new BigNumber(10).pow(18)).toNumber(10).toLocaleString();
        }
        res.send({
            result: result
        });
    }

    static async createAccount(req: Request, res: Response, next: NextFunction) {

        try {
            const password = req.body.password || undefined;

            const personal = Web3Factory.getPersonal();

            const address = await personal.newAccount(password);

            await personal.unlockAccount(address, password);
            await personal.lockAccount(address);

            res.send({
                status: "success",
                address: address,
                password: typeof password !== "undefined"
            });
        } catch (exc) {
            console.error(exc);
            res.status(500).send({
                status: "error"
            });
        }
    }

    static async getAccounts(req: Request, res: Response, next: NextFunction) {
        try {
            const web3 = Web3Factory.getWeb3();

            const accounts = web3.eth.accounts;
            res.send({result: accounts});
        }
        catch (e) {
            res.status(500).send({
                message: 'Could not get accounts',
                err: e
            });
        }
    }

}