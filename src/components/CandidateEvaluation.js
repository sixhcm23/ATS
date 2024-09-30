import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Paper,
  Container,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";

// Updated helper function to calculate skill rating
const calculateSkillRating = (results) => {
  const totalRating = results.reduce((sum, result) => {
    // Safely check if the rating exists before adding to sum
    const rating = result.evaluation?.evaluation?.rating;
    return sum + (rating ? parseFloat(rating) : 0);
  }, 0);

  const totalPossibleScore = results.length * 5; // Each question is rated out of 5
  return totalPossibleScore > 0 ? ((totalRating / totalPossibleScore) * 5).toFixed(2) : 'N/A'; // Calculate rating out of 5, return 'N/A' if no valid ratings
};

const CandidateEvaluation = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [activeTab, setActiveTab] = useState(0); // To track active tab
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidateId, setCandidateId] = useState(""); // Store the candidate_id

  useEffect(() => {
    // Get candidate ID (email) from localStorage
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setCandidateId(storedEmail); // Set the candidateId to the email from local storage
    }
  }, []);

  useEffect(() => {
    if (candidateId) {
      // Fetch the evaluation data from the API
      axios
        .get(`http://127.0.0.1:5011/assessment/candidate/${candidateId}/evaluations`)
        .then((response) => {
          setEvaluations(response.data.evaluations);
          setLoading(false);
        })
        .catch((err) => {
          setError("Failed to fetch data.");
          setLoading(false);
        });
    }
  }, [candidateId]); // Fetch evaluations when candidateId is available

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", marginTop: "40px" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ textAlign: "center", marginTop: "40px" }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container sx={{ marginTop: "40px", textAlign: "center" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Evaluation Report
      </Typography>

      {/* Tabs for each skill */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        indicatorColor="primary"
        textColor="primary"
        sx={{ marginBottom: "20px" }}
      >
        {evaluations.map((evaluation, index) => (
          <Tab key={index} label={evaluation.skill} />
        ))}
      </Tabs>

      {/* Render the evaluation for the selected skill */}
      {evaluations.length > 0 && (
        <Paper
          elevation={3}
          sx={{ padding: "30px", marginBottom: "30px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
        >
          <Box
            sx={{
              backgroundColor: "#f5f5f5",
              padding: "15px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="h5" gutterBottom>
              Skill: {evaluations[activeTab].skill}
            </Typography>

            {/* Skill Rating */}
            <Typography
              variant="body1"
              sx={{ margin: "10px 0", fontWeight: "bold", color: "#1976d2" }}
            >
              Overall Rating:{" "}
              <strong>{calculateSkillRating(evaluations[activeTab].results)}</strong> / 5
            </Typography>
          </Box>

          {/* List of evaluation results */}
          <List>
            {evaluations[activeTab].results.map((result, idx) => (
              <Box
                key={idx}
                sx={{
                  padding: "15px",
                  marginBottom: "15px",
                  backgroundColor: "#fafafa",
                  borderRadius: "8px",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                }}
              >
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={`Q${idx + 1}: ${result.question}`}
                    secondary={
                      <>
                        <Typography variant="body2" color="textPrimary">
                          Candidate's Response: {result.candidate_response || "Not Attempted"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Expected Answer: {result.evaluation?.expected_answer || "N/A"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Feedback: {result.evaluation?.evaluation?.feedback || "No feedback provided"}
                        </Typography>
                        <Box mt={1}>
                          <Chip
                            label={`Rating: ${result.evaluation?.evaluation?.rating || "N/A"}`}
                            sx={{
                              backgroundColor:
                                parseInt(result.evaluation?.evaluation?.rating) >= 3 ? "#4caf50" : "#f44336",
                              color: "white",
                            }}
                          />
                        </Box>
                      </>
                    }
                  />
                </ListItem>
                {idx < evaluations[activeTab].results.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default CandidateEvaluation;
