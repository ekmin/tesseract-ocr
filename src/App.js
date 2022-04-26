import { useState, useRef} from "react";
import Tesseract from "tesseract.js";
import "./App.css";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import RefreshIcon from '@mui/icons-material/Refresh';

function App() {
  const [imagePath, setImagePath] = useState("");
  const [text, setText] = useState("");
  const [head, setHead] = useState("");
  const [copy, setCopy] = useState("")

  const [query, setQuery] = useState("idle");
  const timerRef = useRef();

  const [details, setDetails] = useState({});

  const handleChange = (event) => {
    setImagePath(URL.createObjectURL(event.target.files[0]));
  };

  function refreshPage() {
    window.location.reload(false);
  }

  function copyText(entryText){
    navigator.clipboard.writeText(entryText);
    setCopy("Text Copied!")
  }

  const Input = styled("input")({
    display: "none",
  });

  const handleClick = () => {
    Tesseract.recognize(imagePath, "eng", {
      logger: (m) =>
        setDetails({
          status: m.status,
          progress: m.progress,
        }),
    })
      .catch((err) => {
        console.error(err);
      })
      .then((result) => {
        let text = result.data.text;
        setText(text);
      });
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (query !== "idle") {
      setQuery("idle");
      return;
    }

    setQuery("progress");
    setHead("set");
  };

  return (
    <div className="App">
      <main className="App-main">
        {(() => {
          if (imagePath === "") {
            return <h3>Upload Your Image</h3>;
          } else if (
            details.progress === 1 &&
            details.status === "recognizing text"
          ) {
            return <h3>Done!</h3>;
          } else if (query === "progress") {
            return <h3>Recognizing Text<h3>{details.progress*100}%</h3></h3>;
          } else {
            return <h3>Click on Convert to text button</h3>;
          }
        })()}
        {imagePath === "" ? (
          <Stack direction="row" alignItems="center" spacing={2}>
            <label htmlFor="contained-button-file">
              <Input
                accept="image/*"
                id="contained-button-file"
                multiple
                type="file"
                onChange={handleChange}
                required
              />
              <div className="btn">
                <Button variant="contained" component="span">
                  Upload
                  <Box sx={{ ml: 1 }}>
                    <CloudUploadIcon />
                  </Box>
                </Button>
              </div>
            </label>
          </Stack>
        ) : (
          <img src={imagePath} className="App-image" alt="logo" />
        )}

        {head === "set" ? <h3>Extracted text</h3> : null}

        {details.progress === 1 && details.status === "recognizing text" ? (
          <button className="copy-btn" onClick={() => copyText(text)}>

            <p title="Click here to copy the text"> {text} </p>
            </button>
        ) : (
          <Box sx={{ mb: 1 }}>
            <Fade
              in={query === "progress"}
              style={{
                transitionDelay: query === "progress" ? "800ms" : "0ms",
              }}
              unmountOnExit
            >
              <CircularProgress />
            </Fade>
          </Box>
        )}
        {(() => {
          if (imagePath !== "") {
            if (text === "") {
              return (
                <div className="btn">
                  <Button
                    onClick={handleClick}
                    variant="contained"
                    color="success"
                  >
                    Convert to text
                    <Box sx={{ ml: 1 }}>
                      <CompareArrowsIcon />
                    </Box>
                  </Button>
                </div>
              );
            } else {
              return (
                  <div className="btn">
                    <Button onClick={refreshPage} variant="contained" component="span">
                      Try Again <RefreshIcon />
                    </Button>
                  </div>
              );
            }
          } else {
            return null;
          }
        })()}
        <h3>{copy}</h3>
      </main>
    </div>
  );
}

export default App;
