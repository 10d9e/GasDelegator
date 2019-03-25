pragma solidity ^0.5.0;

contract HelloWorld {

	event Echo2(string _input, uint256 _numberValue, bool _boolValue, bytes32 _hash);
	
	function render() public pure returns (string memory) {
	   return 'helloWorld';
	}

	function throwError() public {
		require(true == false);
	}

	function echo(string memory _input) public pure returns (string memory) {
	   return _input;
	}

	function echo2(string memory _input, uint256 _numberValue, bool _boolValue, bytes32 _hash) public returns (string memory) {
		emit Sender(msg.sender);
		emit Echo2(_input, _numberValue, _boolValue, _hash);
	    return _input;
	}

	event Sender(address sender);
	function emitSender() public {
		emit Sender(msg.sender);
	}
}