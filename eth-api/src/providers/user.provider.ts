import {NextFunction, Request, Response} from "express";
import ContractsProvider from "./contracts.provider";
import Web3Factory from "../config/web3.factory";
import StorageProvider from "./storage.provider";

export default class UserProvider {
    constructor() {

    }

    public static async createUserProfile(accountAddress: string, options: any) {
        const contract = await ContractsProvider.getContractArtifacts("userprofile");
        const contractInstance = await contract.new(accountAddress, options);

        return contractInstance.address;

    }

    public static async setArticleAsUsed(articleAddress: string, accountAddress: string, userProfileAddress: string, password?: string, res?: Response) {

        const contract = await ContractsProvider.getContractArtifacts("userprofile");

        const contractInstance: any = await new Promise((resolve, reject) => {
            contract.at(userProfileAddress).then(instance => {
                resolve(instance);
            }).catch(err => {
                reject(err);
            })
        });


        const alreadyUsed = await contractInstance.usedArticles.call(articleAddress);

        if (alreadyUsed) {

            res && res.status(400).send({
                status: "error",
                reason: "article already used for reputation"
            });
            return false;
        }

        await contractInstance.setArticleAsUsed(articleAddress, {from: process.env.MAIN_ACCOUNT, gas: 500 * 1000});


        res && res.send({
            status: "success"
        });
        return true;
    }

    public static async getReputation(userProfileAddress: string) {

        const contractInstance = await ContractsProvider.getContractArtifactsAt("userprofile", userProfileAddress);

        const reputation = parseInt(await contractInstance.reputation.call()) / 1000;

        return reputation;
    }

    public static async calcReputation(accountAddress: string, userProfileAddress: string) {

        const articleAddresses = new StorageProvider().getAll();
        const taken: string[] = [];

        const initialReputation = await UserProvider.getReputation(userProfileAddress);

        let inc = 0;

        const userProfileInstance = await ContractsProvider.getContractArtifactsAt("userprofile", userProfileAddress);

        for (let articleAddress of articleAddresses) {

            let articleInstance;
            try {
                articleInstance = await ContractsProvider.getContractArtifactsAt("article", articleAddress);
            } catch (e) {
                continue;
            }
            const didVote = await articleInstance.didVote.call(accountAddress);
            if (!didVote) {
                continue;
            }
            const alreadyUsed = await userProfileInstance.usedArticles.call(accountAddress);

            if (alreadyUsed) {
                continue;
            }

            const vote = await articleInstance.voteOf.call(accountAddress);
            const upW = parseInt(await articleInstance.upW.call()) / 1000;
            const downW = parseInt(await articleInstance.downW.call()) / 1000;
            const totalW = upW + downW;
            const proc = (upW / totalW) * 100;
            console.log("proc = " + proc);
            if (proc < 60 && proc > 40) {
                continue;
            }
            console.log("vote = " + vote);
            console.log("upW = " + upW);
            console.log("downW = " + downW);
            if (upW > downW && vote || upW < downW && !vote) {
                inc++;
            }
            else {
                inc--;
            }
            // if (upW)
            taken.push(articleAddress);
        }
        let reputation = initialReputation;
        if (inc) {
            if (inc > 0) {
                while (inc > 0) {
                    inc--;
                    reputation += 0.1;
                }
            }
            else {
                while (inc < 0) {
                    inc++;
                    reputation -= reputation / 10;
                }
            }
        }
        reputation = Math.round(reputation * 1000);
        console.log("initialReputation=" + initialReputation);
        console.log("reputation=" + reputation);
        if (taken.length) {
            // await userProfileInstance.setReputation(reputation, {from: process.env.MAIN_ACCOUNT, gas: 500 * 1000});
            for (let artAddr of taken) {
                await userProfileInstance.setArticleAsUsed(artAddr, {from: process.env.MAIN_ACCOUNT, gas: 500 * 1000});
                console.log(artAddr);
            }
        }

        return reputation / 1000;
    }
}