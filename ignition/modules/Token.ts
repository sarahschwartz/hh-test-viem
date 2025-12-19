import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TokenModule", (m) => {
  const token = m.contract("Token", ['0x5FbDB2315678afecb367f032d93F642f64180aa3']);

  return { token };
});
