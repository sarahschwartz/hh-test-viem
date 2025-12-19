// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

/// @author Matter Labs
/// @custom:security-contact security@matterlabs.dev
/// @dev The L1ShadowAccount contract.
contract L1ShadowAccount {
    // address public l1InteropHandlerAddress;
    // address public mirror;

    // constructor() {
    //     l1InteropHandlerAddress = msg.sender;
    // }

    error CallFailed();

    function executeFromIH(address target, uint256 value, bytes calldata data, uint256 saveReturnAsIdx) external returns (bytes memory ret) {
        // require(msg.sender == l1InteropHandlerAddress, "L1ShadowAccount: not authorized");
        (bool success, bytes memory r) = target.call{value: value}(data);
        require(success, CallFailed());

        if (saveReturnAsIdx != type(uint256).max) {
            bytes32 word;
            // store the first 32 bytes of returndata (or 0 if shorter)
            if (r.length >= 32) {
                assembly {
                    word := mload(add(r, 32))
                }
            }
            _tstoreWord(saveReturnAsIdx, word);
        }

        return r;
    }

    receive() external payable {}

    // function setMirror(address _mirror) external {
    //     // require(msg.sender == l1InteropHandlerAddress, "L1ShadowAccount: not authorized");
    //     mirror = _mirror;
    // }


    function executeFromMirror(address target, uint256 value, bytes calldata data)
        external
        returns (bytes memory ret)
    {
        // require(msg.sender == mirror, "L1ShadowAccount: not authorized");
        (bool ok, bytes memory r) = target.call{value: value}(data);
        if (!ok) revert CallFailed();
        return r;
    }


    // -------- transient return storage (word-sized) --------

    // A unique base slot (domain separator) for our transient keys.
    bytes32 private constant _RET_BASE = keccak256("L1ShadowAccount.transient.returns.v1");

    function _retKey(uint256 idx) private pure returns (bytes32 k) {
        // keccak256(BASE || idx) to avoid collisions
        k = keccak256(abi.encode(_RET_BASE, idx));
    }

    function _tstoreWord(uint256 idx, bytes32 value) private {
        bytes32 k = _retKey(idx);
        assembly {
            tstore(k, value)
        }
    }

    function _tloadWord(uint256 idx) private view returns (bytes32 value) {
        bytes32 k = _retKey(idx);
        assembly {
            value := tload(k)
        }
    }

    /// @notice Read the stored return word for idx (only meaningful within the same tx)
    function tLoadReturnWord(uint256 idx) external view returns (bytes32) {
        return _tloadWord(idx);
    }
}