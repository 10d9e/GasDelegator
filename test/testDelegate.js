var ethers = require('ethers')
const Tx = require('ethereumjs-tx')

var GasDelegator = artifacts.require("./GasDelegator.sol")
var HelloWorld = artifacts.require("./HelloWorld.sol")
var FixedSupplyToken = artifacts.require("./FixedSupplyToken.sol")

const srcPath = __dirname + '/../build/contracts/HelloWorld.json';
const data = require(srcPath);

contract('Delegate Tests [testDelegate.js]', async (accounts) => {
	var user = accounts[1]
    var relayer = accounts[2]

    let accountUser = {	address: '0x3f080D29D96df203bBbd86fC2a2a4c73ab078FcA', 
						privateKey: '0x705a6cdf0971421a29c9fc32ca446f96eb185d35b4532ce7d8f40db8f738e9ae' }

    it("should test sendTxn no parameters", async () => {
	    
		let hello = await HelloWorld.deployed()
		let gasDelegator = await GasDelegator.deployed()
		let token = await FixedSupplyToken.deployed()

		console.log('balances: ', (await token.balanceOf(user)).toString(), (await token.balanceOf(relayer)).toString()  )
		console.log('allowance: ', (await gasDelegator.allowance(user)).toString() )

		// Step 1 - User creates builds and signs a packet
		let packet = buildPacket('render()', {
			user: accountUser,
			target: hello.address,
			origin: user,
			paymentTokens: 500
		})

		// Step 2 - relayer receives packet and transmits to contract
		let res = await sendTxn(packet, {from: relayer, to: gasDelegator.address})

		console.log('balances: ', (await token.balanceOf(user)).toString(), (await token.balanceOf(relayer)).toString()  )
		console.log('allowance: ', (await gasDelegator.allowance(user)).toString() )

	});

	it("should test sendTxn with parameters", async () => {
	    
		let hello = await HelloWorld.deployed()
		let gasDelegator = await GasDelegator.deployed()
		let token = await FixedSupplyToken.deployed()

		console.log('balances: ', (await token.balanceOf(user)).toString(), (await token.balanceOf(relayer)).toString()  )
		console.log('allowance: ', (await gasDelegator.allowance(user)).toString() )

		// Step 1 - User creates builds and signs a packet
		let packet = buildPacketWithParams('echo(string)', ['string'], ['jsd flk jsdf jlsksdfj!!'], {
			user: accountUser,
			target: hello.address,
			origin: user,
			paymentTokens: 500
		})
		
		// Step 2 - relayer receives packet and transmits to contract
		let res = await sendTxn(packet, {from: relayer, to: gasDelegator.address})

		console.log('balances: ', (await token.balanceOf(user)).toString(), (await token.balanceOf(relayer)).toString()  )
		console.log('allowance: ', (await gasDelegator.allowance(user)).toString() )

	});

	/*
	it("should test Delegate", async () => {
	    
		let hello = await HelloWorld.deployed()
		let gasDelegator = await GasDelegator.deployed()
		let token = await FixedSupplyToken.deployed()

		console.log(hello.address)
		console.log(gasDelegator.address)

		console.log(await hello.echo('Jay'))

		// build a contract with web3, using the HelloWorld abi, in order to have access to the methods
		// interface
		let helloWorldContract = new web3.eth.Contract(data.abi, hello.address)
		//await callMethodTxn(gasDelegator.address, hello.address, helloWorldContract.methods.echo('Hi there!'))

		//await sendMethodTxn(gasDelegator.address, hello.address, helloWorldContract.methods.echo('Hi there!'))

		//await sendMethodTxn(gasDelegator.address, hello.address, helloWorldContract.methods.echo('Hi there!'))

		// alternatively call send/call Txn with the delegator address, target contract address and 
		// encoded function and parameters
		// await sendTxn(gasDelegator.address, hello.address, 'echo(string)', ['string'], ['Hi there!'], {from: accounts[0]})

		//let res = await callTxn(user, gasDelegator.address, hello.address, 'echo(string)', ['string'], ['Hi there!'], metadata)
		//let results = web3.eth.abi.decodeParameter('string', res);
		//console.log(results)

	});
	*/

	// no parameters
	function buildPacket(funcDef, metadata) {
		let func = web3.eth.abi.encodeFunctionSignature(funcDef)
		var data = web3.utils.soliditySha3( func, metadata.target, metadata.origin, metadata.paymentTokens)
		console.log('soliditySha3', data)

		var sig = web3.eth.accounts.sign(data, metadata.user.privateKey )

		let encodedPaymentTokens = web3.eth.abi.encodeParameter('uint256', metadata.paymentTokens)

		let packet = {
			function: func,
			target: metadata.target,
			origin: metadata.origin,
			paymentTokens: encodedPaymentTokens,
			signature: sig.signature
		}

		console.log(JSON.stringify(packet, 0, 2))
		return packet
	}

	function buildPacketWithParams(funcDef, paramTypes, paramValues, metadata) {
		let func = web3.eth.abi.encodeFunctionSignature(funcDef)
		let params = web3.eth.abi.encodeParameters(paramTypes, paramValues).substring(2);
		
		let hParams = web3.utils.sha3( web3.utils.toHex( web3.eth.abi.encodeParameters(paramTypes, paramValues)) )
		console.log('hParams', hParams)

		var data = web3.utils.soliditySha3( func, metadata.target, metadata.origin, metadata.paymentTokens, hParams)
		console.log('soliditySha3', data)

		var sig = web3.eth.accounts.sign(data, metadata.user.privateKey )

		let encodedPaymentTokens = web3.eth.abi.encodeParameter('uint256', metadata.paymentTokens)

		let packet = {
			function: func,
			target: metadata.target,
			origin: metadata.origin,
			paymentTokens: encodedPaymentTokens,
			signature: sig.signature,
			params: params
		}

		console.log(JSON.stringify(packet, 0, 2))
		return packet
	}

	function packetToData(packet) {
		let params = packet.params|| ''
		return packet.function + packet.target.substring(2) + packet.origin.substring(2) 
			   + packet.paymentTokens.substring(2) + packet.signature.substring(2) + params
	}

	async function sendTxn(packet, metadata) {
		let newData = packetToData(packet)
		console.log('newData', newData)
		return await web3.eth.sendTransaction({
		    from: metadata.from,
		    to: metadata.to,
		    data: newData
		})
	}

	async function callTxn(packet, metadata) {
		let newData = packetToData(packet)
		console.log('newData', newData)
		return await web3.eth.call({
		    to: metadata.to,
		    data: newData
		})
	}

	async function sendMethodTxn(packet, method, metadata) {
		let encodedMethodABI = method.encodeABI()
		let func = encodedMethodABI.substring(0, 10)
		let params = encodedMethodABI.substring(10)
		let newData = packetToData(packet)
		console.log('newData', newData)
		
		let rval = await web3.eth.sendTransaction({
			from: metadata.from,
		    to: metadata.to,
		    data: newData
		})
		
		console.log(rval)
	}

	async function callMethodTxn(packet, method, metadata) {

		let encodedMethodABI = method.encodeABI()
		let func = encodedMethodABI.substring(0, 10)
		let params = encodedMethodABI.substring(10)
		let newData = packetToData(packet)
		console.log('newData', newData)
	
		let rval = await web3.eth.call({
		    to: metadata.to,
		   	data: newData
		})
		
		console.log(rval)
	}

	async function sendRawTxn(delegatorAddress, targetAddress, method) {

		let encodedMethodABI = method.encodeABI()
		let func = encodedMethodABI.substring(0, 10)
		let params = encodedMethodABI.substring(10)
		let newData = func + targetAddress.substring(2) + params
		console.log('newData', newData)

		const Tx = require('ethereumjs-tx');
		const userAccount = '0x72fF61EB8e9e55863d077Fe4944cEb26cFd49297'
		const privateKey = new Buffer('e0cd56fe80956d3d3546ffb83094e6aaa717c9d90cae7140d2f83ebf2fa56c87', 'hex')

		let txnCount = await web3.eth.getTransactionCount(userAccount);

		const rawTx = {
		  nonce: txnCount,
		  gasPrice: '0x3B9ACA00',
		  gasLimit: '0x6ACFC0',
		  to: delegatorAddress,
		  value: '0x0',
		  data: newData
		}

		const tx = new Tx(rawTx);
		tx.sign(privateKey);
		const serializedTx = tx.serialize();

		let txnResult = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
		console.log('RESULT: ', txnResult)
	}

});