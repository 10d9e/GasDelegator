var FixedSupplyToken = artifacts.require("./FixedSupplyToken.sol")
var GasDelegator = artifacts.require("./GasDelegator.sol")
var HelloWorld = artifacts.require("./HelloWorld.sol")

module.exports = function (deployer, network, accounts) {

  var contractDeployer = accounts[0]
  var user = accounts[1]
  var relayer = accounts[0]

  deployer.then(async () => {

    console.log('network: ' + network)
    console.log(accounts)
    const owner = accounts[0]
    console.log('owner: ' + owner)

    await deployer.deploy(HelloWorld)
    let token = await deployer.deploy(FixedSupplyToken)

    let delegator = await deployer.deploy(GasDelegator, token.address)

    // transfer some tokens to relayer
    await token.transfer(user, 1000000, {from: contractDeployer})
    // user approves delegator contract to spend tokens to pay relayers
    await token.approve(delegator.address, 1000000, {from: user})

  })

};
