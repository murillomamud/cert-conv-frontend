import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { useDropzone } from "react-dropzone";
import Box from "@mui/material/Box";
import { saveAs } from 'file-saver';
import LinearProgress from '@mui/material/LinearProgress';
import Explanation from './Explanation';



export default function FileUploadForm() {
  const [file, setFile] = React.useState(null);
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);


  const onDrop = React.useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, maxFiles: 1 });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
  
    const response = await fetch('https://pfxtopemapi.mamud.cloud/convert', {
      method: 'POST',
      body: formData,
    });
  
    const blob = await response.blob();
    saveAs(blob, 'certificate.zip');
    setLoading(false);
  };

  return (
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
  );
}
