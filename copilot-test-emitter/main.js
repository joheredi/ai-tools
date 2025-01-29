import { discoverSpecs } from "./src/discover-specs.js";
import { basePath } from "./src/specs-base-path.js";
import { Chalk } from "chalk";
import { emitTest } from "./src/emit-test.js";
import { format } from "prettier";
import { writeFile, readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import ora from "ora";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Setup Chalk
const chalk = new Chalk();

// Use an environment variable to toggle between processing a single spec and all specs
const processAllSpecs = process.env.PROCESS_ALL_SPECS === "true";

const spinner = ora("Discovering specs...").start();

try {
  // Discover specs
  let specs = await discoverSpecs(["."], true);
  spinner.succeed(`✅ Discovered ${specs.length} specs.`);

  // Conditionally process only the first spec or all specs
  if (!processAllSpecs) {
    const testSpec = process.env["SPEC_TEST"];
    let specTestIndex = Math.floor(Math.random() * specs.length);

    if (testSpec) {
      const index = specs.findIndex((spec) => spec.fullPath.includes(testSpec));
      if (index !== -1) {
        specTestIndex = index;
      }
    }

    specs = [specs[specTestIndex]];
    spinner.info(
      `ℹ️ Processing only a single spec for demonstration. ${specs[0].fullPath}`
    );
  } else {
    spinner.info(`ℹ️ Processing all discovered specs.`);
  }

  for (const spec of specs) {
    const specSpinner = ora(`Processing spec: ${spec.fullPath}`).start();

    try {
      // Generate test content
      specSpinner.text = "🤖 Generating test content with Copilot...";
      const testContent = await emitTest(spec);

      // Format test content
      specSpinner.text = "🧹 Formatting test content...";
      const formattedContent = await format(testContent, {
        parser: "typescript",
      });

      // Determine output path
      const outputPath = getOutputFilePath(spec);

      // Write file with directory creation
      specSpinner.text = `💾 Writing test to ${outputPath}...`;
      await writeFileWithDirs(outputPath, formattedContent);

      specSpinner.succeed(`✅ Test successfully written to ${outputPath}`);
    } catch (error) {
      specSpinner.fail(`❌ Failed to process spec: ${spec.fullPath}`);
      console.error(chalk.red(`Error: ${error.message}`));
    }
  }
} catch (error) {
  spinner.fail("❌ Failed to discover specs.");
  console.error(chalk.red(`Error: ${error.message}`));
}

/**
 * Determines the output file path for the generated test.
 */
function getOutputFilePath(spec) {
  const { fullPath } = spec;
  const relativePath = fullPath
    .replace(`${basePath}/`, "")
    .replace(/\.tsp$/, ".test.ts");
  return path.join("output", relativePath); // Save all files under an 'output' directory
}

/**
 * Writes a file to disk, ensuring that the directory exists.
 */
async function writeFileWithDirs(outputPath, content) {
  try {
    // Get the directory path
    const dirPath = path.dirname(outputPath);

    // Ensure the directory exists
    await mkdir(dirPath, { recursive: true });

    // Write the file
    await writeFile(outputPath, content, { encoding: "utf-8" });

    console.log(chalk.green(`✅ File written successfully to ${outputPath}`));
  } catch (error) {
    console.error(chalk.red(`❌ Failed to write file: ${error.message}`));
    throw error;
  }
}
