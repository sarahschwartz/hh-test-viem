import { network } from "hardhat";
import { encodeFunctionData, erc20Abi, maxUint256, type Address } from "viem";
import { anvil } from "viem/chains";

type ShadowAccountOp = {
  target: Address;
  value: bigint;
  data: `0x${string}`;
  saveReturnAsIdx: bigint;
};

const { viem } = await network.connect("anvil");

const publicClient = await viem.getPublicClient({ chain: anvil });
const [walletClient] = await viem.getWalletClients({ chain: anvil });
if (!walletClient)
  throw new Error("No wallet client. Set PRIVATE_KEY in hardhat config.");

const shadowAccount = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const token = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
const ih = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const mirror = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707';

const ihContract = await viem.getContractAt("MockInteropHandler", ih, {
  client: { public: publicClient, wallet: walletClient },
});

const mirrorContract = await viem.getContractAt("ShadowMirror", mirror, {
  client: { public: publicClient, wallet: walletClient },
});

// tokens are already minted to the shadow account
// get balance, and then approve the balance to send to default account

const initialShadowAccountBalance = await getTokenBalance(shadowAccount);
console.log("initial shadow account balance: ", initialShadowAccountBalance);

const initialWalletBalance = await getTokenBalance(walletClient.account.address);
console.log("initial wallet balance: ", initialWalletBalance);

// 0) balanceOf(shadow)
const balanceData = encodeFunctionData({
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [shadowAccount],
});

// 1) approve(spender, amountPlaceholder=0) -> will be patched by Mirror stored value
const approvePlaceholderData = encodeFunctionData({
  abi: erc20Abi,
  functionName: "approve",
  args: [walletClient.account.address, 0n],
});

// ABI calldata offset where the uint256 `amount` starts for approve(address,uint256)
const amountOffset = 36; // 4 + 32

// 2) Mirror call data that will patch approvePlaceholderData with saved return idx 0
const mirrorCallData = encodeFunctionData({
  abi: mirrorContract.abi,
  functionName: "callWithSavedUint256",
  args: [
    0n,                 // savedIdx (balance saved by op0)
    token,              // target to call after patch
    0n,                 // value
    approvePlaceholderData,
    BigInt(amountOffset),
  ],
});

// 2) transfer(to, amountPlaceholder=0) -> will be patched by Mirror
const transferPlaceholderData = encodeFunctionData({
  abi: erc20Abi,
  functionName: "transfer",
  args: [walletClient.account.address, 0n],
});

const transferMirrorCallData = encodeFunctionData({
  abi: mirrorContract.abi,
  functionName: "callWithSavedUint256",
  args: [
    0n,                    // savedIdx (balance)
    token,                 // target
    0n,                    // value
    transferPlaceholderData,
    BigInt(amountOffset),  // 36
  ],
});

// Bundle ops executed by IH via ShadowAccount
const ops: ShadowAccountOp[] = [
  {
    target: token,
    value: 0n,
    data: balanceData,
    saveReturnAsIdx: 0n,         // save balance to transient idx 0
  },
  {
    target: mirror,
    value: 0n,
    data: mirrorCallData,        // mirror will patch + call back into shadow
    saveReturnAsIdx: maxUint256, // don't save
  },
  {
    target: mirror,
    value: 0n,
    data: transferMirrorCallData, // patches transferPlaceholderData amount using idx 0
    saveReturnAsIdx: maxUint256, // don't save
  },
];

const tx = await walletClient.writeContract({
  address: ih,
  abi: ihContract.abi,
  functionName: "executeBundleWithdrawal",
  args: [shadowAccount, ops],
});
await publicClient.waitForTransactionReceipt({ hash: tx });
console.log("Transaction sent successfully");

const finalShadowAccountBalance = await getTokenBalance(shadowAccount);
console.log("final shadow account balance: ", finalShadowAccountBalance);

const finalWalletBalance = await getTokenBalance(walletClient.account.address);
console.log("final wallet balance: ", finalWalletBalance);

async function getTokenBalance(accountAdress: `0x${string}`){
    const balance = await publicClient.readContract({
    address: token,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [accountAdress],
})

return balance;
}