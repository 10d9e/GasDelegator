pragma solidity ^0.5.0;

import "./BytesLib.sol";
import "./ECDSA.sol";

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
  using ECDSA for bytes32;

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
  function () external {

    bytes memory func = msg.data.slice(0, 4);
    address targetAddress = msg.data.toAddress(4);
    address originAddress = msg.data.toAddress(24);
    uint tokenPayment = msg.data.toUint(44);
    bytes memory signature = msg.data.slice(76, 65);
    bytes memory params = msg.data.slice(141, msg.data.length - 141);

    bytes32 hashedTx;
    if(params.length > 0) {
      hashedTx = hashMetadata(func, targetAddress, originAddress, tokenPayment, params);
    } else {
      hashedTx = hashMetadata(func, targetAddress, originAddress, tokenPayment);
    }
    
    address originUser = hashedTx.toEthSignedMessageHash().recover(signature);    
    require(originUser == originAddress, "Origin address does not match recovered signature address");
    require(originUser != address(0), "Invalid address recovered from signature");
    require(token.allowance(originAddress, address(this)) >= tokenPayment, "Not enough token allowance from origin user permitted to the GasDelegator contract, call ERC20.approve() to increase amount");
    require(token.transferFrom(originAddress, msg.sender, tokenPayment) == true, "There was an error transfering tokens to sender");
    
    assembly {
      let ptr := mload(0x40)
      calldatacopy(ptr, 0, 4)
      calldatacopy(add(ptr,4), 141, sub(calldatasize, 141))
      let result := delegatecall(gas, targetAddress, ptr, sub(calldatasize, 20), 0, 0)

      let size := returndatasize
      returndatacopy(ptr, 0, size)

      switch result
      case 0 { revert(ptr, size) }
      default { return(ptr, size) }
    }
  }

  function hashMetadata(bytes memory _func, address _target, address _origin, uint _tokenPayment, bytes memory _params) 
      public pure returns (bytes32) {
      return keccak256(abi.encodePacked(_func, _target, _origin, _tokenPayment, keccak256(_params)));
  }

  function hashMetadata(bytes memory _func, address _target, address _origin, uint _tokenPayment) 
      public pure returns (bytes32) {
      return keccak256(abi.encodePacked(_func, _target, _origin, _tokenPayment));
  }

}