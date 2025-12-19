import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MockInteropHandlerModule", (m) => {
  const ih = m.contract("MockInteropHandler");

  return { ih };
});
