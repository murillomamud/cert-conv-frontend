import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { useDropzone } from "react-dropzone";
import Box from "@mui/material/Box";
import { saveAs } from "file-saver";
import LinearProgress from "@mui/material/LinearProgress";
import Explanation from "./Explanation";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function FileUploadForm() {
  const [file, setFile] = React.useState(null);
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(""); 

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const onDrop = React.useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, maxFiles: 1 });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);

    let response;

    try {
      response = await fetch("https://pfxtopemapi.mamud.cloud/convert", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.log(error)
      const status = error.status;
      const errorMessage = error.message + " - Status: " + status + " - " + error.stack;
      setErrorMessage(errorMessage);
      handleClick();
      setLoading(false);
      return;
    }

    if(response.status !== 200) {
      const errorMessage = "Error: " + response.status + " - " + response.statusText;
      setErrorMessage(errorMessage);
      handleClick();
      setLoading(false);
      return;
    }

    const blob = await response.blob();
    saveAs(blob, "certificate.zip");
    setLoading(false);
  };

  return (
    <div className="App">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} direction="column" sx={{ width: "300px" }}>
            <Explanation />
            <div
              {...getRootProps()}
              style={{
                border: "1px solid #000",
                padding: "10px",
                cursor: "pointer",
                backgroundColor: "#f0f0f0",
              }}
            >
              <input {...getInputProps()} />
              {file ? (
                <p>Selected File: {file.name}</p>
              ) : (
                <p>
                  Drag 'n' drop a .pfx certificate file here, or click to select
                </p>
              )}
            </div>
            <TextField
              type="password"
              label="Cert Password"
              variant="outlined"
              fullWidth
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button variant="contained" type="submit" fullWidth>
              Convert to PEM
            </Button>
            {loading && <LinearProgress />}
          </Stack>
        </form>
      </Box>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity="error">
        {errorMessage} {/* Usa a mensagem de erro do estado */}
      </Alert>
      </Snackbar>
    </div>
  );
}
