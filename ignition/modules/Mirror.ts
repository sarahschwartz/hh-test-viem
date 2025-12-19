import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ShadowMirrorModule", (m) => {
  const mirror = m.contract("ShadowMirror", ['0x5FbDB2315678afecb367f032d93F642f64180aa3']);

  return { mirror };
});
