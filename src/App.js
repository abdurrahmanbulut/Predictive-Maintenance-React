import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import * as XLSX from "xlsx";
import axios from "axios";
import "./background.css";
import Typing from "react-typing-animation";

function App() {
  const [fields, setFields] = useState(Array(5).fill(""));
  const [open, setOpen] = useState(false);
  const labels = ["Age", "Volt", "Pressure", "Rotation", "Vibration"];
  const text = "Analyzing.. and done.. Your component1 and component2 seem to be broken soon. Check them please.";

  const handleChange = (index, event) => {
    const val = event.target.value;
    if (/^\d*\.?\d*$/.test(val)) {
      // Check if it's a valid number or with decimals
      setFields(fields.map((field, i) => (i === index ? val : field)));
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const newFields = jsonData[0].slice(2); // Skip the first two columns
      setFields(newFields);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleClear = () => {
    setFields(Array(5).fill(""));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "https://abdurrahmanbulut.pythonanywhere.com/predict",
        fields
      );
      const prediction = response.data.prediction;
      console.log(prediction); // print the prediction

      setOpen(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f5f5f5",
        minHeight: "96.6vh",
        p: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 15, textAlign: "center" }}>
          Predictive Maintenance
        </Typography>

        <Grid container spacing={19}>
          <Grid item xs={12} md={6}>
            {/* Left side */}
            {labels.map((label, index) => (
              <TextField
                key={label}
                fullWidth
                label={label}
                variant="outlined"
                value={fields[index]}
                onChange={(event) => handleChange(index, event)}
                sx={{ mb: 2 }}
              />
            ))}
            <Box display="flex" justifyContent="space-evenly" marginBottom={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Predict
              </Button>
              <Button variant="contained" color="primary" onClick={handleClear}>
                Clear
              </Button>
            </Box>

            <Box display="flex" justifyContent="center" marginTop={2}>
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="contained" color="secondary" component="span">
                  Upload File
                </Button>
              </label>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            {/* Right side */}
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{
                height: "65%",
                backgroundColor: "#eeeeee",
                padding: "24px",
                fontFamily: "Arial, sans-serif",
                fontSize: "18px",
                color: "#333",
                borderRadius: "2rem",
              }}
            >
              <Typing >
                {text}
              </Typing>
            </Box>
          </Grid>
        </Grid>

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle> 
            Input Values
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleClose}
              sx={{ position: "absolute", right: 20, top: 10 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            sx={{
              height: "40rem",
              backgroundColor: "#eee",
              padding: "24px",
              fontFamily: "Arial, sans-serif",
              fontSize: "18px",
              color: "#333",
            }}
          >
            {labels.map((label, index) => (
              <Typography key={label}>
                {label}: {fields[index]}
              </Typography>
            ))}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}

export default App;
