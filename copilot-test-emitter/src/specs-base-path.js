import { join } from "path";

export const basePath = join(
  process.cwd(), // Current working directory
  "node_modules",
  "@azure-tools",
  "cadl-ranch-specs"
);
