// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IShadowReturns {
    function tLoadReturnWord(uint256 idx) external view returns (bytes32);
    function executeFromMirror(address target, uint256 value, bytes calldata data) external returns (bytes memory);
}

contract ShadowMirror {
    IShadowReturns public immutable shadow;

    error BadPatch();

    constructor(address shadowAccount) {
        shadow = IShadowReturns(shadowAccount);
    }

    /// @notice Patch a uint256 into calldata at `offset` (32 bytes) and execute via shadow.
    /// @dev `offset` is in bytes from the start of `data`.
    function callWithSavedUint256(
        uint256 savedIdx,
        address target,
        uint256 value,
        bytes calldata data,
        uint256 offset
    ) external returns (bytes memory) {
        bytes32 w = shadow.tLoadReturnWord(savedIdx);
        bytes memory patched = _patchUint256(data, offset, uint256(w));
        return shadow.executeFromMirror(target, value, patched);
    }

    function _patchUint256(bytes calldata data, uint256 offset, uint256 v) internal pure returns (bytes memory out) {
        // Need 32 bytes space at offset
        if (offset + 32 > data.length) revert BadPatch();

        out = new bytes(data.length);

        // copy all
        for (uint256 i = 0; i < data.length; i++) {
            out[i] = data[i];
        }

        // write uint256 big-endian? ABI uses left-padded 32-byte word (standard)
        assembly {
            mstore(add(add(out, 32), offset), v)
        }
    }
}
