import {NextFunction, Request, Response, Router} from 'express';
import ContractsProvider from "../../providers/contracts.provider";
import Web3Factory from "../../config/web3.factory";
import StorageProvider from "../../providers/storage.provider";
import EthProvider from "../../providers/eth.provider";

const BigNumber = require('bignumber.js');

export default class ArticleController {

    public router: Router;


    public initAndGetRouter(): Router {
        console.log("initialized ArticleController");
        this.router = Router();
        this.router.post('/new', ArticleController.new);
        this.router.post('/vote', ArticleController.vote);
        this.router.get('/voteOf', ArticleController.voteOf);
        this.router.get('/state', ArticleController.state);
        this.router.get('/userArticles', ArticleController.userArticles);

        return this.router;
    }


    /**
     * Create
     * @param {*} req
     * @param {*} res
     * @param {*} next
     */
    public static async new(req: Request, res: Response, next: NextFunction) {
        const model = {
            hash: req.body.hash,
            ethAddress: ""
        };
        console.log("creating article with hash: " + model.hash);

        const contract = await ContractsProvider.getContractArtifacts("article");
        // const web3 = Web3Factory.getWeb3();
        // const accounts = web3.eth.accounts;

        try {
            if (process.env.MAIN_ACCOUNT_PASSWORD) {
                const personal = Web3Factory.getPersonal();
                await personal.unlockAccount(process.env.MAIN_ACCOUNT, process.env.MAIN_ACCOUNT_PASSWORD);
            }
            const contractInstance = await contract.new(model.hash, {
                from: process.env.MAIN_ACCOUNT,
                gas: 3 * 1000 * 1000
            });

            model.ethAddress = contractInstance.address;

            new StorageProvider().addOne(contractInstance.address);

            res.send({
                message: 'success',
                model: model
            });
            console.log("created article with hash: " + model.hash);
        } catch (exc) {

            res.status(500).send({
                message: 'error',
                model: exc.message
            });
            console.log("error creating article with hash: " + model.hash)
        }
    }

    public static async vote(req: Request, res: Response, next: NextFunction) {
        const model = {
            articleAddress: req.body.articleAddress,
            vote: req.body.vote,
            weight: req.body.weight,
            from: req.body.voterAddress,
            password: req.body.password
        };
        console.log("voting: " + JSON.stringify(model));


        if (!model.articleAddress || typeof model.vote !== "boolean" || !model.from || !model.password || !model.weight) {
            res.status(400).send({
                status: "error",
                reason: "invalid request object. example: {articleAddress: string, vote: boolean, voterAddress: string, password: string, weight: number}"
            });
            return;
        }


        try {

            if (!EthProvider.isAddress(model.articleAddress)) {
                res.status(400).send({
                    status: "error",
                    state: "chestia asta '" + model.articleAddress + "' nu e o adresă"
                });
                console.log("mi-a dat chestia asta '" + model.articleAddress + "' nesimțitu'");
                return;
            }

            const contract = await ContractsProvider.getContractArtifacts("article").at(model.articleAddress);
            const personal = Web3Factory.getPersonal();

            const alreadyVoted = await contract.didVote.call(model.from);
            if (alreadyVoted) {
                res.status(400).send({
                    status: "error",
                    reason: "You already voted for this article"
                });
                return;
            }

            await personal.unlockAccount(model.from, model.password);
            const weightNumber = Math.round(model.weight * 1000);
            await contract.doVote(model.vote, weightNumber, {from: model.from, gas: 1000 * 1000});

            res.send({
                status: "success"
            });
        }
        catch (e) {
            res.status(400).send({
                status: "error",
                reason: e.message
            });
        }
    }

    public static async voteOf(req: Request, res: Response, next: NextFunction) {


        const model = {articleAddress: req.query.articleAddress, voterAddress: req.query.voterAddress};

        if (!model.articleAddress || !model.voterAddress) {
            res.status(400).send({
                status: "error",
                reason: "No articleAddress or voterAddress provided!"
            });
            return;
        }

        if (!EthProvider.isAddress(model.articleAddress)) {
            res.status(400).send({
                status: "error",
                state: "chestia asta '" + model.articleAddress + "' nu e o adresă"
            });
            console.log("mi-a dat chestia asta '" + model.articleAddress + "' nesimțitu'");
            return;
        }

        const contract = await ContractsProvider.getContractArtifacts("article").at(model.articleAddress);
        const didVote = await contract.didVote.call(model.voterAddress);
        if (!didVote) {
            res.send({
                status: "success",
                didVote: false
            });
        }
        else {
            const vote = await contract.voteOf.call(model.voterAddress);
            let weight = await contract.weights.call(model.voterAddress);
            weight = parseInt(weight) / 1000;
            res.send({
                status: "success",
                didVote: true,
                vote: vote,
                weight: weight
            });
        }
    }


    public static async state(req: Request, res: Response, next: NextFunction) {
        const model = {articleAddress: req.query.articleAddress};

        if (!EthProvider.isAddress(model.articleAddress)) {
            res.status(400).send({
                status: "error",
                state: "chestia asta '" + model.articleAddress + "' nu e o adresă"
            });
            console.log("mi-a dat chestia asta '" + model.articleAddress + "' nesimțitu'");
            return;
        }

        const contract = await ContractsProvider.getContractArtifacts("article").at(model.articleAddress);

        const state = {
            up: await contract.up.call(),
            upW: parseInt(await contract.upW.call()) / 1000,
            down: await contract.down.call(),
            downW: parseInt(await contract.downW.call()) / 1000
        };

        res.send({
            status: "success",
            state: state
        });
    }

    public static async userArticles(req: Request, res: Response, next: NextFunction) {
        const model = {userAddress: req.query.userAddress};

        if (!model.userAddress) {
            res.status(400).send({
                status: "error",
                reason: "No userAddress provided!"
            });
            return;
        }

        const contract = await ContractsProvider.getContractArtifacts("article");

        const articleAddresses = new StorageProvider().getAll();
        const result = [];
        for (let articleAddress of articleAddresses) {
            try {
                let contractInstance;
                try {
                    contractInstance = await new Promise((resolve, reject) => {
                        contract.at(articleAddress)
                            .then(instance => {
                                resolve(instance)
                            })
                            .catch(err => {
                                reject(err);
                            });
                    });
                } catch (e) {
                    console.error("error: " + e.message + " ->" + articleAddress);
                    continue;
                }
                const userDidVote = await contractInstance.didVote.call(model.userAddress);

                if (!userDidVote) {
                    continue;
                }
                const obj: any = {};
                obj.state = {
                    up: await contractInstance.up.call(),
                    upW: parseInt(await contractInstance.upW.call()) / 1000,
                    down: await contractInstance.down.call(),
                    downW: parseInt(await contractInstance.downW.call()) / 1000
                };
                obj.userVote = await contractInstance.voteOf.call(model.userAddress);
                obj.userVoteWeight = parseInt(await contractInstance.weights.call(model.userAddress)) / 1000;
                obj.articleAddress = articleAddress;
                result.push(obj);
            }
            catch (e) {
                console.error(e.message);
            }
        }
        res.send({
            status: "success",
            result: result
        })
    }
}