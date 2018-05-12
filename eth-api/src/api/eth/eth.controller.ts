import {Request, Response, NextFunction, Router} from 'express';
import {CallModifierFunctionRequestModel} from "../../models/call-modifier-function-request-model";
import ContractsProvider from "../../providers/contracts.provider";

const BigNumber = require('bignumber.js');

export default class EthController {

    public router: Router;


    public initAndGetRouter(): Router {
        console.log("initialized EthController");
        this.router = Router();
        this.router.post('/new', EthController.new);
        this.router.post('/modifierFunction', EthController.callModifierFunction);
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