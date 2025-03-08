import * as ay from "@alloy-js/core";
/**
 * Recursively collects and returns the file contents from an ay.OutputDirectory.
 */
function collectFileContents(dir: ay.OutputDirectory): string {
  let result = "";

  for (const sub of dir.contents) {
    // If `sub.contents` is an array, then `sub` is another directory
    if (Array.isArray(sub.contents)) {
      result += collectFileContents(sub as ay.OutputDirectory);
    } else {
      // Otherwise, `sub.contents` should be a string (file contents)
      // Append a newline or any delimiter as needed
      result += `${sub.contents}\n`;
    }
  }

  return result;
}

/**
 * Renders the given root component into an ay.OutputDirectory,
 * and then retrieves a concatenation of all file contents within.
 */
export async function renderToMemory(
  rootComponent: ay.Children,
): Promise<string> {
  // If ay.render is async, we await it; if it's sync, remove `await`
  const tree = ay.render(rootComponent);

  return collectFileContents(tree);
}

// Usage example:
// const allContents = await getAllFileContents(rootComponent);
// console.log(allContents);
