import chalk from "chalk";
import { globby } from "globby";
import { dirname, join } from "path";
import { resolve } from "path";
import { stat, access } from "fs/promises";
import { constants } from "fs";
import { basePath } from "./specs-base-path.js";
import dotenv from "dotenv";

dotenv.config();

// Recursively process paths (files or directories relative to basePath)
/**
 *
 * @param {string[]} paths
 * @param {boolean} mainOnly
 * @returns {Promise<{ fullPath: string, relativePath: string }[]>}
 */
export async function discoverSpecs(paths, mainOnly) {
  const ignoreList = [];
  const results = [];

  if (process.env["INCLUDE_AZURE"] !== true) {
    ignoreList.push("http/azure", "http/client");
  }

  for (const relativePath of paths) {
    const fullPath = resolve(basePath, relativePath);
    if (!(await pathExists(fullPath))) {
      console.warn(chalk.yellow(`Path not found: ${fullPath}`));
      continue;
    }

    const stats = await stat(fullPath);
    if (
      stats.isFile() &&
      (fullPath.endsWith("client.tsp") || fullPath.endsWith("main.tsp"))
    ) {
      // Add valid files directly
      results.push({ fullPath, relativePath });
    } else if (stats.isDirectory()) {
      // Discover files in the directory
      const patterns = mainOnly
        ? ["**/main.tsp"]
        : ["**/client.tsp", "**/main.tsp"];
      const discoveredPaths = await globby(patterns, { cwd: fullPath });
      const validFiles = discoveredPaths
        .map((p) => ({
          fullPath: join(fullPath, p),
          relativePath: join(relativePath, p),
        }))
        .filter(
          (file) =>
            !ignoreList.some((ignore) => file.relativePath.startsWith(ignore))
        );

      results.push(...validFiles);
    } else {
      console.warn(chalk.yellow(`Skipping unsupported path: ${relativePath}`));
    }
  }

  // Deduplicate and prioritize client.tsp over main.tsp
  const filesByDir = new Map();
  for (const file of results) {
    const dir = dirname(file.relativePath);
    const existing = filesByDir.get(dir);
    if (!existing || (!mainOnly && file.relativePath.endsWith("client.tsp"))) {
      filesByDir.set(dir, file);
    }
  }

  return Array.from(filesByDir.values());
}

async function pathExists(path) {
  try {
    await access(path, constants.F_OK);
    return true; // Path exists
  } catch {
    return false; // Path does not exist
  }
}
