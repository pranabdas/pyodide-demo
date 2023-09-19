# Pyodide demo

This is a proof-of-concept react application to run virtually any python code in
the browser using Pyodide.

What does this application does?

1. It takes VASP POTCAR file as input (a scientific data format used in DFT
calculation. The specifics of this file format is not important for this demo).
2. Reads the POTCAR as string and sends over to Pyodide for parsing.
3. Once parsing is done in Pyodide, results are collected in browser/JavaScript.
4. All the Pyodide job is run on a separate [webworker](
https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
thread, so that main browser thread remains responsive at all times.

Live demo is available at - <https://pyodide.netlify.app>
