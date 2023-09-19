import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { asyncRun } from "./py-worker";
import parser from "./py-libs/parser.py";
import Footer from "./Footer";

function App() {
  const [output, setOutput] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [filename, setFilename] = useState("");
  const [data, setData] = useState("");
  const [show, setShow] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.readAsText(file);

      reader.onload = async () => {
        const text = reader.result?.toString();
        if (text !== undefined) {
          setData(text);
        }
        setFilename(file.name);
        setOutput("");
        setShow(false);
      };
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, maxFiles: 1 });

  const handleClick = async () => {
    const script = await (await fetch(parser)).text();
    const context = { data: data };

    async function run_webworker() {
      try {
        const { results, error } = await asyncRun(script, context);
        if (results) {
          let tmp = [];
          for (let i = 0; i < results.length; i++) {
            let row = Object.fromEntries(results[i]);
            tmp.push(row);
          }
          let tmpFormat = "[";
          for (let i = 0; i < tmp.length; i++) {
            tmpFormat += JSON.stringify(tmp[0]) + ",";
          }
          tmpFormat = tmpFormat.slice(0, -1) + "]";

          setOutput(tmpFormat);
          setIsBusy(false);
        } else if (error) {
          console.log("pyodideWorker error: ", error);
        }
      } catch (e) {
        console.log(
          `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`
        );
      }
    }

    run_webworker();
  };

  const message =
    "File content is read as string, and sent to Pyodide to" +
    " parse using python code. Once processing is done, results will be send" +
    " back to JavaScript. All the Pyodide job is run on a separate webworker" +
    " thread, leaving main browser thread remains responsive at all times.";

  return (
    <div className="container">
      <div className="wrapper">
        <h3
          style={{
            color: "#15847b",
            textAlign: "center",
            paddingBottom: "0.5em",
          }}
        >
          Pyodide React Demo
        </h3>
        <p>
          This application takes VASP POTCAR file as input (a scientific data
          format used in DFT calculation, the specifics of file format is not
          important for this demo). You can find a fake POTCAR file{" "}
          <a href="/POTCAR" target="_blank">
            here
          </a>
          .
        </p>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          {filename ? (
            <div className="dropzone">
              <p>
                Selected file: <b>{filename}</b>
                <br />
              </p>
              <p style={{ color: "grey", fontSize: "0.9em" }}>
                <i>
                  (If required, you can drop a new file in this box again, or
                  click to browse)
                </i>
              </p>
            </div>
          ) : (
            <div
              className="dropzone"
              style={{ paddingTop: "5em", paddingBottom: "5em" }}
              data-cy="file-upload"
            >
              <p>
                <b>Drop</b> POTCAR file in this box, or <b>click</b> here to
                select.
              </p>
              <p style={{ color: "grey", fontSize: "0.9em" }}>
                <i>(Please drop or select a single file)</i>
              </p>
            </div>
          )}
        </div>
        {filename !== "" && data !== "" && (
          <button
            className="btn"
            onClick={() => {
              setIsBusy(true);
              setOutput("");
              setShow(true);
              handleClick();
            }}
          >
            Process
          </button>
        )}
        {show && <p>{message}</p>}
        {isBusy && <p>Please wait. Pyodide is busy...</p>}
        {output !== "" && (
          <>
            <p>Valence configuration:</p>
            <p>
              <code>{output}</code>
            </p>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default App;
