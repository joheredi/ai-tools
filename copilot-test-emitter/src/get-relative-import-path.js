import path from "node:path";
import { basePath } from "./specs-base-path.js";

/**
 * Computes the correct import path based on the spec file location.
 *
 * @param {string} specFullPath - Full path to the spec file (e.g., "specs/http/routes/main.tsp").
 * @returns {string} - Correct relative import path (e.g., "../../generated/http/routes/http-client-javascript/src/index.js").
 */
export function getRelativeImportPath(specFullPath) {
  // Convert spec file path to relative path from 'specs/' root
  const relativeSpecPath = path.relative(basePath, specFullPath);

  // Extract the directory path only (omit the file name)
  const relativeDirPath = path.dirname(relativeSpecPath);

  // Determine how many levels deep the spec file is
  const depth = relativeDirPath.split(path.sep).length; // Count directories

  // Construct `../` sequence based on depth
  const relativePrefix = "../".repeat(depth);

  // Construct the correct import path
  const importPath = `${relativePrefix}generated/${relativeDirPath}/http-client-javascript/src/index.js`;

  return importPath;
}
