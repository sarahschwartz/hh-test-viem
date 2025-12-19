import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ShadowAccountModule", (m) => {
  const shadowAccount = m.contract("L1ShadowAccount");

  return { shadowAccount };
});
