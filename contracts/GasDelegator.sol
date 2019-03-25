pragma solidity ^0.5.0;

import "./BytesLib.sol";

/**
 * @title ERC20 interface
 * @dev see https://eips.ethereum.org/EIPS/eip-20
 */
interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function totalSupply() external view returns (uint256);
    function balanceOf(address who) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title GasDelegator
 * @dev Gives the capability to delegate any call to a foreign implementation. This delegator
 * requires clients to encode a 20 byte target address after the function signature in order
 * to route calls dynamically
 */
contract GasDelegator {
  using BytesLib for bytes;

  IERC20 public token;

  constructor(address _token) public {
    token = IERC20(_token);
  }

  function allowance(address who) external view returns (uint256) {
    return token.allowance(who, address(this));
  }

  /**
  * @dev Fallback function allowing to perform a delegatecall to the given implementation.
  * This function will return whatever the implementation call returns
  */
  function() external {
    //bytes memory func = msg.data.slice(0, 4);
    address target = msg.data.toAddress(4);
    address relayer = msg.data.toAddress(24);
    uint256 fee = msg.data.toUint(44);

    //bytes memory params = msg.data.slice(74, msg.data.length - 74);
    //bytes memory payload = func.concat(params);

    require(token.allowance(msg.sender, address(this)) >= fee, "Not enough token allowance from origin user permitted to the GasDelegator contract, call ERC20.approve() to increase amount");
    require(token.transferFrom(msg.sender, relayer, fee) == true, "There was an error transfering tokens to sender");
    
    assembly {
      let ptr := mload(0x40)
      calldatacopy(ptr, 0, 4)
      calldatacopy(add(ptr, 4), 76, sub(calldatasize, 76))
      let result := delegatecall(gas, target, ptr, sub(calldatasize, 72), 0, 0)
      //let result := call(gas, target, 0, ptr, sub(calldatasize, 72), 0, 0) 
      //let result := callcode(gas, target, 0, ptr, sub(calldatasize, 72), 0, 0) 

      let size := returndatasize
      returndatacopy(ptr, 0, size)

      switch result
      case 0 { revert(ptr, size) }
      default { return(ptr, size) }
    }
  }

}