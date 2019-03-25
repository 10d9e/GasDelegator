const Tx = require('ethereumjs-tx')

var GasDelegator = artifacts.require("./GasDelegator.sol")
var HelloWorld = artifacts.require("./HelloWorld.sol")
var FixedSupplyToken = artifacts.require("./FixedSupplyToken.sol")

contract('Delegate Tests [testDelegate2.js]', async (accounts) => {
	var user = accounts[1]
    var relayer = accounts[2]

    let accountUser = {	address: '0x3f080D29D96df203bBbd86fC2a2a4c73ab078FcA', 
						privateKey: '705a6cdf0971421a29c9fc32ca446f96eb185d35b4532ce7d8f40db8f738e9ae' }

    it("should test sendTxn no parameters", async () => {
	    
		let hello = await HelloWorld.deployed()
		let gasDelegator = await GasDelegator.deployed()
		let token = await FixedSupplyToken.deployed()

		console.log('balances: ', (await token.balanceOf(accountUser.address)).toString(), (await token.balanceOf(relayer)).toString()  )
		console.log('allowance: ', (await gasDelegator.allowance(accountUser.address)).toString() )

		// Step 1 - User creates builds transaction
		let txn = await buildRawTxnNoParams('emitSender()', {
			account: accountUser,
			delegator: gasDelegator.address,
			target: hello.address,
			relayer: relayer,
			fee: 500
		})
		
		// Step 2 - relayer receives packet and transmits to contract
		let txnResult = await web3.eth.sendSignedTransaction(txn, {from: relayer})
		//console.log('RESULT: ', txnResult)

		console.log('balances: ', (await token.balanceOf(accountUser.address)).toString(), (await token.balanceOf(relayer)).toString()  )
		console.log('allowance: ', (await gasDelegator.allowance(accountUser.address)).toString() )

	});

	it("should test sendTxn with parameters", async () => {
	    
		let hello = await HelloWorld.deployed()
		let gasDelegator = await GasDelegator.deployed()
		let token = await FixedSupplyToken.deployed()

		console.log('balances: ', (await token.balanceOf(accountUser.address)).toString(), (await token.balanceOf(relayer)).toString()  )
		console.log('allowance: ', (await gasDelegator.allowance(accountUser.address)).toString() )

		// Step 1 - User creates builds transaction
		let txn = await buildRawTxn('echo(string)', ['string'], ['Hello!!'], {
			account: accountUser,
			delegator: gasDelegator.address,
			target: hello.address,
			relayer: relayer,
			fee: 500
		})

		// Step 2 - relayer receives packet and transmits to contract
		let txnResult = await web3.eth.sendSignedTransaction(txn, {from: relayer})
		//console.log('RESULT: ', txnResult)

		//let res = await web3.eth.getTransaction(txnResult.transactionHash)

		//let res = await web3.eth.getTransactionReceiptMined(txnResult.transactionHash, 5)
		//console.log('Result: ', res)

		console.log('balances: ', (await token.balanceOf(accountUser.address)).toString(), (await token.balanceOf(relayer)).toString()  )
		console.log('allowance: ', (await gasDelegator.allowance(accountUser.address)).toString() )

	});

	it("should test echo2 with parameters", async () => {
	    
		let hello = await HelloWorld.deployed()
		let gasDelegator = await GasDelegator.deployed()
		let token = await FixedSupplyToken.deployed()

		console.log('balances: ', (await token.balanceOf(accountUser.address)).toString(), (await token.balanceOf(relayer)).toString()  )
		console.log('allowance: ', (await gasDelegator.allowance(accountUser.address)).toString() )

		// Step 1 - User creates builds transaction
		let txn = await buildRawTxn('echo2(string,uint256,bool,bytes32)', ['string', 'uint256', 'bool', 'bytes32'], 
			['Hello!!', 42, true, '0x00000000000000000000000000000000000000000000000000000000000001f4'], {
			account: accountUser,
			delegator: gasDelegator.address,
			target: hello.address,
			relayer: relayer,
			fee: 500
		})

		// Step 2 - relayer receives packet and transmits to contract
		let txnResult = await web3.eth.sendSignedTransaction(txn, {from: relayer})

		console.log('balances: ', (await token.balanceOf(accountUser.address)).toString(), (await token.balanceOf(relayer)).toString()  )
		console.log('allowance: ', (await gasDelegator.allowance(accountUser.address)).toString() )

	});

	it("should test token transfer", async () => {
	    
		let hello = await HelloWorld.deployed()
		let gasDelegator = await GasDelegator.deployed()
		let token = await FixedSupplyToken.deployed()

		console.log('balances: ', (await token.balanceOf(accountUser.address)).toString(), (await token.balanceOf(relayer)).toString()  )
		console.log('allowance: ', (await gasDelegator.allowance(accountUser.address)).toString() )

		// Step 1 - User creates builds transaction
		let txn = await buildRawTxnDirect('transfer(address,uint256)', ['address', 'uint256'], ['0xbae665e566f67b0AD523e6b9C60E0b09112405d0', 77], {
			account: accountUser,
			delegator: gasDelegator.address,
			target: token.address,
			relayer: relayer,
			fee: 500
		})

		// Step 2 - relayer receives packet and transmits to contract
		let txnResult = await web3.eth.sendSignedTransaction(txn, {from: relayer})
		//console.log('RESULT: ', txnResult)

		console.log('balances: ', (await token.balanceOf(accountUser.address)).toString(), (await token.balanceOf(relayer)).toString()  )
		console.log('allowance: ', (await gasDelegator.allowance(accountUser.address)).toString() )

	});

	it("should test delegated token transfer", async () => {
	    
		let hello = await HelloWorld.deployed()
		let gasDelegator = await GasDelegator.deployed()
		let token = await FixedSupplyToken.deployed()

		console.log('balances: ', (await token.balanceOf(accountUser.address)).toString(), (await token.balanceOf(relayer)).toString()  )
		console.log('allowance: ', (await gasDelegator.allowance(accountUser.address)).toString() )

		// Step 1 - User creates builds transaction
		let txn = await buildRawTxn('transfer(address,uint256)', ['address', 'uint256'], ['0xbae665e566f67b0AD523e6b9C60E0b09112405d0', 77], {
			account: accountUser,
			delegator: gasDelegator.address,
			target: token.address,
			relayer: relayer,
			fee: 5
		})

		// Step 2 - relayer receives packet and transmits to contract
		let txnResult = await web3.eth.sendSignedTransaction(txn, {from: relayer})
		//console.log('RESULT: ', txnResult)

		console.log('balances: ', (await token.balanceOf(accountUser.address)).toString(), (await token.balanceOf(relayer)).toString()  )
		console.log('allowance: ', (await gasDelegator.allowance(accountUser.address)).toString() )

		//throw 'shyte'

	});

	async function _buildTxn(newData, metadata){
		const userAccount = metadata.account.address
		const privateKey = new Buffer(metadata.account.privateKey, 'hex')
		let txnCount = await web3.eth.getTransactionCount(userAccount);

		const rawTx = {
		  nonce: txnCount,
		  //gasPrice: '0x3B9ACA00',
		  //gasLimit: '0x6ACFC0',
		  gas: 2000000,
		  to: metadata.delegator,
		  value: '0x0',
		  data: newData
		}

		const tx = new Tx(rawTx);
		tx.sign(privateKey);
		const serializedTx = tx.serialize();

		return '0x' + serializedTx.toString('hex')
	}

	async function buildRawTxnNoParams(funcDef, metadata) {
		let func = web3.eth.abi.encodeFunctionSignature(funcDef)
		let target = metadata.target.substring(2)
		let relayer = metadata.relayer.substring(2)
		let fee = web3.eth.abi.encodeParameter('uint256', metadata.fee).substring(2)
		let newData = func + target + relayer + fee
		console.log('newData', newData)

		return _buildTxn(newData, metadata)
	}

	async function buildRawTxn(funcDef, paramTypes, paramValues, metadata) {
		let func = web3.eth.abi.encodeFunctionSignature(funcDef)
		let target = metadata.target.substring(2)
		let relayer = metadata.relayer.substring(2)
		let fee = web3.eth.abi.encodeParameter('uint256', metadata.fee).substring(2)
		let params = web3.eth.abi.encodeParameters(paramTypes, paramValues).substring(2)
		let newData = func + target + relayer + fee + params
		console.log('newData', newData)

		return _buildTxn(newData, metadata);
	}

	async function buildRawTxnDirect(funcDef, paramTypes, paramValues, metadata) {
		let func = web3.eth.abi.encodeFunctionSignature(funcDef)
		let target = metadata.target.substring(2)
		let relayer = metadata.relayer.substring(2)
		let fee = web3.eth.abi.encodeParameter('uint256', metadata.fee).substring(2)
		let params = web3.eth.abi.encodeParameters(paramTypes, paramValues).substring(2)
		let newData = func + params
		console.log('newData', newData)

		const userAccount = metadata.account.address
		const privateKey = new Buffer(metadata.account.privateKey, 'hex')
		let txnCount = await web3.eth.getTransactionCount(userAccount);

		const rawTx = {
		  nonce: txnCount,
		  //gasPrice: '0x3B9ACA00',
		  //gasLimit: '0x6ACFC0',
		  gas: 2000000,
		  to: metadata.target,
		  value: '0x0',
		  data: newData
		}

		const tx = new Tx(rawTx);
		tx.sign(privateKey);
		const serializedTx = tx.serialize();

		return '0x' + serializedTx.toString('hex')
	}


});