# Sample Hardhat 3 Beta Project (`node:test` and `viem`)

## Running Locally

Start a local anvil node:

```bash
anvil
```

Install deps with bun:

```bash
bun install
```

Compile contracts:

```bash
bun compile
```

Deploy shadow account and mock interop handler contracts:

```bash
bun deploy-shadow
bun deploy-ih
```

Update the shadow account address in `ignition/modules/Mirror.ts` and `ignition/modules/Token.ts`.

Deploy mirror and token contracts:

```bash
bun deploy-mirror
bun deploy-token
```

Update the contract addresses in `scripts/storage.ts`.
Then, run the script:

```bash
bun storage
```

The script should output:

```txt
initial shadow account balance:  1000000000000000000000n
initial wallet balance:  0n
Transaction sent successfully
final shadow account balance:  0n
final wallet balance:  1000000000000000000000n
```
