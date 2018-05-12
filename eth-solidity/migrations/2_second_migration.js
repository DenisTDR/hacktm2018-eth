var News = artifacts.require("./Article.sol");

module.exports = async (deployer) => {
    await deployer.deploy(News, "plmdemaimulteori");
};
