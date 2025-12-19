// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import {FinalizeL1DepositParams} from "../Messaging.sol";
import {L1ShadowAccount} from "./L1ShadowAccount.sol";

contract MockInteropHandler {
    struct ShadowAccountOp {
        address target;
        uint256 value;
        bytes data;
        uint256 saveReturnAsIdx;
    }

    function executeBundleWithdrawal(
        address _shadowAccount,
        ShadowAccountOp[] memory ops
    ) external {
        uint256 length = ops.length;
        for (uint256 i = 0; i < length; ++i) {
            L1ShadowAccount(payable(_shadowAccount)).executeFromIH(
                ops[i].target,
                ops[i].value,
                ops[i].data,
                ops[i].saveReturnAsIdx
            );
        }
    }
}
