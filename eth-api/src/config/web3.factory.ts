const Web3 = require("web3");

export default class Web3Factory {
    private static provider: any = null;

    public static getProvider() {
        // console.log("Web3Factory.getProvider");
        if (Web3Factory.provider === null) {
            Web3Factory.provider = new Web3.providers.HttpProvider(process.env.NODE_URL);
        }
        return Web3Factory.provider;
    }

    private static web3 = null;

    public static getWeb3() {

        if (Web3Factory.web3 === null) {
            Web3Factory.web3 = new Web3(this.getProvider());
        }
        return Web3Factory.web3;
    }

    private static personal = null;

    public static getPersonal() {
        if (Web3Factory.personal === null) {
            const Personal = require('web3-eth-personal');
            Web3Factory.personal = new Personal(Web3Factory.getProvider());
        }
        return Web3Factory.personal;
    }
};