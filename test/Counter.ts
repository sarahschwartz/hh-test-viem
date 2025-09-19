// test/Counter.ts
import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import { network } from "hardhat";
import { defineChain, type Abi } from "viem";
import CounterArtifact from "../artifacts/contracts/Counter.sol/Counter.json" assert { type: "json" };

// same chain descriptor as your script
const zksyncOS = defineChain({
  id: 8022833,
  name: "ZKsync OS Testnet Alpha",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://zksync-os-testnet-alpha.zksync.dev"] } },
});

describe("Counter", () => {
  let viem: any;
  let publicClient: any;
  let wallet: any;
  let counterAddr: `0x${string}`;
  const abi = CounterArtifact.abi as Abi;
  const bytecode = CounterArtifact.bytecode as `0x${string}`;

  before(async () => {
    ({ viem } = await network.connect("zksyncOS"));

    publicClient = await viem.getPublicClient({ chain: zksyncOS });
    [wallet] = await viem.getWalletClients({ chain: zksyncOS });
    if (!wallet) throw new Error("No wallet client. Set TESTNET_PRIVATE_KEY for zksyncOS.");

    const deployHash = await wallet.deployContract({ abi, bytecode, args: [] });
    const rcpt = await publicClient.waitForTransactionReceipt({ hash: deployHash });
    if (!rcpt.contractAddress) throw new Error("Deployment failed: no contractAddress");
    counterAddr = rcpt.contractAddress;
  });

  it("The sum of the Increment events should match the current value", async () => {
    const fromBlock = await publicClient.getBlockNumber();

    // run a series of increments (explicit wallet writes, like your script)
    for (let i = 1n; i <= 10n; i++) {
      await wallet.writeContract({
        address: counterAddr,
        abi,
        functionName: "incBy",
        args: [i],
      });
    }

    // fetch Increment events since deployment
    const events = await publicClient.getContractEvents({
      address: counterAddr,
      abi,
      eventName: "Increment",
      fromBlock,
      strict: true,
    });

    // sum their 'by' values
    let total = 0n;
    for (const e of events) total += e.args.by;

    const current = await publicClient.readContract({
      address: counterAddr,
      abi,
      functionName: "x",
    });

    assert.equal(total, current);
  });
});
