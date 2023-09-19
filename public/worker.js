importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.0/full/pyodide.js");

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide();
  await self.pyodide.loadPackage(["micropip"]);
}
let pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
  await pyodideReadyPromise;
  const { id, python, ...context } = event.data;

  // The worker copies the context in its own "memory" (an object mapping name to values)
  // for (const key of Object.keys(context)) {
  //   self[key] = context[key];
  // }

let pyodide_context = self.pyodide.toPy(context);

  try {
    await self.pyodide.loadPackagesFromImports(python);
    let config = await self.pyodide.runPythonAsync(python, { globals: pyodide_context });
    let results = config.toJs();
    self.postMessage({ results, id });
  } catch (error) {
    self.postMessage({ error: error.message, id });
  }
};
