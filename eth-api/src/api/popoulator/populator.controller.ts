import {Request, Response, NextFunction, Router} from 'express';
import * as rp from "request-promise";

export default class PopulatorController {

    public router: Router;


    public initAndGetRouter(): Router {
        console.log("initialized EthController");
        this.router = Router();
        this.router.post('/populate', PopulatorController.populate);

        return this.router;
    }

    public static async populate(req: Request, res: Response, next: NextFunction) {
        const url = "http://localhost:9040/eth";
        let accounts: { account: string, profile: string }[] = [];
        let articles: string[] = [];
        const accountNumber = 15;
        const articlesNumber = 5;
        for (let i = 0; i < accountNumber; i++) {
            console.log("request #" + i);
            const result = await rp({
                uri: url + "/eth/createAccount",
                method: 'POST',
                body: {
                    password: "parola01"
                },
                json: true
            });
            accounts.push({account: result.address, profileAddress: result.profileAddress});
        }


        for(let i = 0; i < articlesNumber; i++) {
            console.log("request #" + i);
            const result = await rp({
                uri: url + "/article/new",
                method: 'POST',
                body: {
                    hash: "jsfghjsdjkfgdshfljsldsf"
                },
                json: true
            });
            articles.push(result.model.ethAddress);
        }

        let c  = 0;
        try {
            for (let article of articles) {
                for (let account of accounts) {
                    console.log("vote #" + (c++));

                    const result = await rp({
                        uri: url + "/article/vote",
                        method: 'POST',
                        body: {
                            articleAddress: article,
                            voterAddress: account.account,
                            profileAddress: account.profileAddress,
                            vote: Math.random() > 0.5,
                            password: "parola01"
                        },
                        json: true
                    });

                }
            }
        }catch (e) {
            console.error(e.message);

            res.send({
                status: "error",
                result: e.message
            });
            return;
        }

        res.send({
            status: "success",
            result: {accounts: accounts, articles: articles}
        });
    }
}