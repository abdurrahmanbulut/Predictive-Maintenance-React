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
  LinearProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import * as XLSX from "xlsx";
import axios from "axios";
import "./background.css";
import Typing from "react-typing-animation";

function App() {
  const [fields, setFields] = useState([Array(5).fill(0)]);
  const [open, setOpen] = useState(false);
  const labels = ["Age", "Volt", "Pressure", "Rotation", "Vibration"];
  const [counts, setCounts] = useState({});

  const [c0Percentage, setC0Percentage] = useState(0);

  const text =
    "Enter values about each related part and click Predict button. If your file has multiple data of a machine, the program will " +
    "check all components but you will see only first row data in input fields. ";

  const age_of_machine = "Age: Age of the machine";
  const volt_info = "Volt: Voltage value of the machine";
  const pres_info = "Pressure: Pressure value of the machine";
  const rot_info = "Rotation: Rotation value of the machine";
  const vib_info = "Vibration: Vibration value of the machine";

  const handleChange = (index, event) => {
    const val = event.target.value;
    if (/^\d*\.?\d*$/.test(val)) {
      // Check if it's a valid number or with decimals
      if (index === 0 && parseFloat(val) < 0) {
        console.error("Age must be greater than or equal to 0");
        return; // Exit the function to prevent setting the state
      }
      const updatedFields = [...fields]; // Create a shallow copy of the fields state
      updatedFields[0][index] = parseFloat(val); // Update the specific input value
      setFields(updatedFields); // Update the state with the new fields
    }
  };

  const handleFileUpload = (event) => {
    setFields([Array(5).fill(0)]);
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const newFields = jsonData.slice(1).map((row) => row.slice(2)); // Skip the first row and the first two columns for each row
      setFields(newFields);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleClear = () => {
    setFields([Array(5).fill(0)]);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        //"https://abdurrahmanbulut.pythonanywhere.com/predict",
        "http://127.0.0.1:5000/predict",
        fields
      );
      const prediction = response.data.prediction;
      const counts = response.data.counts;

      console.log(prediction); // print the prediction
      console.log(counts); // print the prediction
      // Calculate percentage for c0
      const totalCount = Object.values(counts).reduce(
        (acc, val) => acc + val,
        0
      );
      const newC0Percentage = Math.round((counts["c0"] / totalCount) * 100);
      console.log(counts["c0"]);
      console.log(totalCount);
      setC0Percentage(newC0Percentage);

      // Update counts based on conditions
      Object.entries(counts).forEach(([key, value]) => {
        if (value > 1) {
          counts[key] = 2;
        } else if (value === 1) {
          counts[key] = 1;
        } else {
          counts[key] = 0;
        }
      });

      setCounts(counts);

      console.log(fields);

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
                value={fields[0][index]}
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
              flexDirection={"column"}
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
              <Typing>{age_of_machine}</Typing>
              <Typing>{volt_info}</Typing>
              <Typing>{pres_info}</Typing>
              <Typing>{rot_info}</Typing>
              <Typing>{vib_info}</Typing>
              <br></br>
              <Typing>{text}</Typing>
            </Box>
          </Grid>
        </Grid>

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>
            Risk Analysis
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
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="subtitle1" sx={{ mt: 4 }}>
              Health status of the machine: {c0Percentage}%
            </Typography>
            {Object.entries(counts).map(([key, value]) => (
              <div key={key}>
                {key === "c0" ? (
                  <>
                  
                    <LinearProgress
                      variant="determinate"
                      value={c0Percentage}
                      sx={{
                        height: "2rem",
                        borderRadius: "1rem",
                        mt: 2,
                        mb: 4,
                        backgroundColor: "white",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "green",
                        },
                      }}
                    />
                  </>
                ) : (
                  <>
                    <Typography>
                      {key === "c1"
                        ? value === 0
                          ? "Component 1 looks good!"
                          : value === 1
                          ? "Component 1 may have a problem."
                          : "Crucial, Check component 1 asap."
                        : key === "c2"
                        ? value === 0
                          ? "Component 2 looks good!"
                          : value === 1
                          ? "Component 2 may have a problem."
                          : "Crucial, Check component 2 asap."
                        : key === "c3"
                        ? value === 0
                          ? "component 3 looks good!"
                          : value === 1
                          ? "Component 3 may have a problem."
                          : "Crucial, Check component 3 asap."
                        : key === "c4"
                        ? value === 0
                          ? "Component 4 looks good!"
                          : value === 1
                          ? "Component 4 may have a problem."
                          : "Crucial, Check component 4 asap."
                        : null}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={value * 1000}
                      sx={{
                        height: "2rem",
                        borderRadius: "1rem",
                        mt: 2,
                        mb: 4,
                        backgroundColor:
                          value === 0
                            ? "green !important"
                            : value === 1
                            ? "orange !important"
                            : "red !important",
                      }}
                    />
                  </>
                )}
              </div>
            ))}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}

export default App;
