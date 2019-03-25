pragma solidity ^0.5.0;

contract HelloWorld {
	
	function render () public pure returns (string memory) {
	   return 'helloWorld';
	}

	function throwError() public {
		require(true == false);
	}

	function echo(string memory _input) public pure returns (string memory) {
	   return _input;
	}
}