import Web3Factory from "../config/web3.factory";
import * as fs from "fs";
import {ContractConfig} from "../models/contract-config";

const contract = require("truffle-contract");
const BigNumber = require('bignumber.js');


export default class ContractsProvider {
    private static cache: { [key: string]: any } = {};


    public static async getContractAbiFields(contractConfig: ContractConfig) {
        const Contract = ContractsProvider.getContractArtifacts(contractConfig.name.toLowerCase());

        const deployedContract = await Contract.at(contractConfig.address);
        const viewMembersNames = [];
        const modifierFunctions = [];
        for (let memberInfo of deployedContract.abi) {
            if (memberInfo.stateMutability == "view") {
                viewMembersNames.push({
                    stateMutability: memberInfo.stateMutability,
                    name: memberInfo.name,
                    inputs: memberInfo.inputs,
                    type: memberInfo.type
                });
            }
            else if ((memberInfo.stateMutability === "nonpayable" || memberInfo.stateMutability === "payable") && memberInfo.type !== "constructor") {
                modifierFunctions.push({
                    stateMutability: memberInfo.stateMutability,
                    name: memberInfo.name,
                    inputs: memberInfo.inputs,
                    type: memberInfo.type
                });
            }
        }
        const fields = [];
        const viewMethods = [];
        for (let memberInfo of viewMembersNames) {
            const member = JSON.parse(JSON.stringify(memberInfo));

            member.displayName = ContractsProvider.getDisplayName(memberInfo.name);
            if (!memberInfo.inputs.length) {
                delete memberInfo.inputs;
                const value = await deployedContract[memberInfo.name].call();
                member.value = value;
                member.displayValue = value;
                if (memberInfo.name.indexOf("Time") !== -1) {
                    member.date = new Date(value * 1000);
                    member.displayValue = member.date;
                }
                else if (value.constructor.name === "BigNumber") {
                    member.number = value.toString(10);
                    if (new BigNumber(value.toString(10)).greaterThan(new BigNumber(10).pow(10))) {
                        member.displayValue = new BigNumber(value.toString(10))
                            .div(new BigNumber(10).pow(18)).toNumber(10).toLocaleString();
                    }
                    else {
                        member.displayValue = value;
                    }
                }
                fields.push(member)
            }
            else {
                viewMethods.push(member);
            }

        }
        const result = {
            fields: fields,
            viewMethods: viewMethods,
            modifierFunctions: modifierFunctions,
            address: deployedContract.address,
            contractName: contractConfig.name.toLowerCase()
        };
        return result;
    }


    public static getContractArtifacts(shortName: string): any {
        let csJsonArtifactsPath = process.env.JSON_ARTIFACTS_PATH + "/";
        if (this.cache[shortName]) {
            return this.cache[shortName];
        }

        csJsonArtifactsPath += process.env[shortName.toUpperCase() + "_CONTRACT_NAME"] + ".json";

        const Contract = ContractsProvider.getContractArtifactsFromPath(csJsonArtifactsPath);
        // this.cache[shortName] = Contract;
        if (!Contract) {
            console.error("Contract is undefined ....");
        }
        return Contract;
    }


    private static getContractArtifactsFromPath(csJsonArtifactsPath: string): any {
        if (!fs.existsSync(csJsonArtifactsPath)) {
            console.log(csJsonArtifactsPath);
            throw new Error("Didn't found contract json artifacts at: " + csJsonArtifactsPath);
        }
        const csJsonArtifacts = require(csJsonArtifactsPath);

        const Contract = contract({
            abi: csJsonArtifacts.abi,
            networks: csJsonArtifacts.networks,
            bytecode: csJsonArtifacts.bytecode
        });
        // console.log("bytecode length: " + Contract.bytecode.length);

        const provider = Web3Factory.getProvider();
        Contract.setProvider(provider);
        return Contract;
    }

    private static getDisplayName(str) {
        // str = str.replace(/([A-Z])/g, ' $1').trim();
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

}