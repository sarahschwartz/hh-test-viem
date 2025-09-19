// scripts/increment.ts
import { network } from "hardhat";
import type { Abi } from "viem";
import { defineChain } from "viem";
import CounterArtifact from "../artifacts/contracts/Counter.sol/Counter.json" assert { type: "json" };

const CONTRACT_ADDRESS = "0x7Be3f2d08500Fe75B92b9561287a16962C697cb7" as `0x${string}`;

// we define the chain 
const zksyncOS = defineChain({
  id: 8022833,
  name: "ZKsync OS Testnet Alpha",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://zksync-os-testnet-alpha.zksync.dev"] } },
});

// connect to it
const { viem } = await network.connect("zksyncOS");
// get clients for it
const publicClient = await viem.getPublicClient({ chain: zksyncOS });
const [wallet] = await viem.getWalletClients({ chain: zksyncOS });
if (!wallet) throw new Error("No wallet client. Set TESTNET_PRIVATE_KEY in hardhat config.");

const abi = CounterArtifact.abi as Abi;
const initial = await publicClient.readContract({
  address: CONTRACT_ADDRESS,
  abi,
  functionName: "x",
});
console.log("Initial count:", initial);

const hash = await wallet.writeContract({
  address: CONTRACT_ADDRESS,
  abi,
  functionName: "inc",
  args: [],
});
await publicClient.waitForTransactionReceipt({ hash });
console.log("Transaction sent:", hash);

const after = await publicClient.readContract({
  address: CONTRACT_ADDRESS,
  abi,
  functionName: "x",
});
console.log("New count:", after);
