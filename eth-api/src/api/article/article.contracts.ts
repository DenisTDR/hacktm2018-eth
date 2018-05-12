import {Request, Response, NextFunction, Router} from 'express';
import ContractsProvider from "../../providers/contracts.provider";
import Web3Factory from "../../config/web3.factory";

const BigNumber = require('bignumber.js');

export default class ArticleController {

    public router: Router;


    public initAndGetRouter(): Router {
        console.log("initialized ArticleController");
        this.router = Router();
        this.router.post('/new', ArticleController.new);
        this.router.post('/vote', ArticleController.vote);

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
            hash: req.body.hash,
            ethAddress: ""
        };


        const contract = await ContractsProvider.getContractArtifacts("article");
        const web3 = Web3Factory.getWeb3();
        const accounts = web3.eth.accounts;
        const contractInstance = await contract.new(model.hash, {from: accounts[0], gas: 500 * 1000});

        model.ethAddress = contractInstance.address;

        res.send({
            message: 'Created!',
            model: model
        });
    }

    public static async vote(req: Request, res: Response, next: NextFunction) {

        console.log(req.body);

        const model = {
            articleAddress: req.body.articleAddress,
            vote: req.body.vote,
            from: req.body.address,
            password: req.body.password
        };

        if(!model.articleAddress || !model.vote || !model.from || !model.password) {
            res.status(400).send({
               status: "error",
               reason: "invalid request object. example: {articleAddress: string, vote: boolean, address: string, password: string}"
            });
            return;
        }

        res.send({
            status: "success"
        });
    }
}