// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(address _shadowAccount) ERC20("Gold", "GLD") {
        _mint(_shadowAccount, 1000000000000000000000);
    }
}