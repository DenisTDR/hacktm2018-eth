import {NextFunction, Request, Response} from "express";
import ContractsProvider from "./contracts.provider";

export default class UserProvider {
    constructor() {

    }

    public static async createUserProfile(accountAddress: string, options: any) {
        const contract = await ContractsProvider.getContractArtifacts("userprofile");
        const contractInstance = await contract.new(accountAddress, options);

        return contractInstance.address;

    }

    public static async setArticleAsUsed(articleAddress: string, accountAddress: string, userProfileAddress: string) {

        const contract = await ContractsProvider.getContractArtifacts("userprofile");


    }
}