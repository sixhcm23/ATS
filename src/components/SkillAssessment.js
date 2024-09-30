import React, { useEffect, useState } from 'react';
import { 
  Tabs, 
  Tab, 
  Typography, 
  Box, 
  Button, 
  Container, 
  Paper, 
  TextField, 
  FormControlLabel, 
  FormControl, 
  Slider, 
  Card, 
  CardContent, 
  CardActions, 
  RadioGroup,
  Radio
} from '@mui/material';
import axios from 'axios';
import ProctoringComponent from './ProctoringComponent'; // Import the ProctoringComponent

// Helper function to replace \n with <br />
const formatQuestionText = (text) => {
  return text.split('\n').join('<br />');
};

const SkillAssessment = () => {
  const [skills, setSkills] = useState([]);  // Holds the skills data
  const [activeTab, setActiveTab] = useState(0);  // Active tab (skill)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Current question slider index
  const [assessmentId, setAssessmentId] = useState(""); // Store the top-level _id
  const [candidateId, setCandidateId] = useState(""); // Store the candidate_id
  const [experience, setExperience] = useState(""); // Store the experience
  const [suspiciousActivity, setSuspiciousActivity] = useState(false); // Flag for suspicious activity

  // Callback for suspicious activity from the ProctoringComponent
  const handleSuspiciousActivity = (isSuspicious) => {
    setSuspiciousActivity(isSuspicious);
  };

  // Fetch candidate_id (email) from local storage
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setCandidateId(email); // Set the candidateId to the user's email
    }
  }, []);

  // Fetch assessment data
  useEffect(() => {
    if (candidateId) {
      fetch(`http://127.0.0.1:5011/assessment/candidate/${candidateId}`)
        .then((res) => res.json())
        .then((data) => {
          setAssessmentId(data._id); // Save the top-level _id
          setExperience(data.experience); // Save the experience
          // Initialize candidate responses as empty strings
          const updatedSkills = data.assessments.map((skill) => ({
            ...skill,
            assessment: skill.assessment.map((question) => ({
              ...question,
              candidate_response: "", // Initialize candidate response for each question
            })),
          }));
          setSkills(updatedSkills);
        })
        .catch((err) => console.error("Failed to fetch assessment data:", err));
    }
  }, [candidateId]); // Only fetch data when candidateId is available

  // Handle tab change (switching between skills)
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentQuestionIndex(0);  // Reset the question index when switching tabs
  };

  // Handle question slider change
  const handleSliderChange = (event, newValue) => {
    setCurrentQuestionIndex(newValue);
  };

  // Handle candidate response change for radio buttons
  const handleRadioChange = (event) => {
    const updatedSkills = [...skills];
    updatedSkills[activeTab].assessment[currentQuestionIndex].candidate_response = event.target.value;
    setSkills(updatedSkills);
  };

  // Handle other input types
  const handleResponseChange = (event) => {
    const updatedSkills = [...skills];
    updatedSkills[activeTab].assessment[currentQuestionIndex].candidate_response = event.target.value;
    setSkills(updatedSkills);
  };

  // Render questions dynamically based on their type
  const renderQuestionInput = (question) => {
    switch (question.type) {
      case "CODING_CHALLENGES":
      case "SHORT_ANSWER_QUESTIONS":
      case "SCENARIO_BASED_QUESTIONS":
      case "FILL_IN_THE_BLANK":
      case "CODE_OUTPUT_QUESTIONS": 
      case "CODE_COMPLETION": 
      case "CODE_DEBUGGING": 
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Enter your answer here"
            value={question.candidate_response}
            onChange={handleResponseChange} // Handle input change
            sx={{ mt: 2 }}
          />
        );
      case "TRUE_FALSE_QUESTIONS":
        return (
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <RadioGroup
              row
              value={question.candidate_response}
              onChange={handleRadioChange} // Handle radio change
            >
              <FormControlLabel
                value="true"
                control={<Radio />}
                label="True"
              />
              <FormControlLabel
                value="false"
                control={<Radio />}
                label="False"
              />
            </RadioGroup>
          </FormControl>
        );
      case "MULTIPLE_CHOICE_QUESTIONS":
        const options = Array.isArray(question.options)
          ? question.options
          : typeof question.options === 'string'
          ? question.options.split(',').map((option) => option.trim())
          : [];

        return (
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <RadioGroup
              value={question.candidate_response}
              onChange={handleRadioChange} // Handle radio change for multiple choice
            >
              {options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      default:
        return <Typography>{question.question}</Typography>;
    }
  };

  // Submit the modified data to the API
  const handleSubmit = () => {
    axios
      .post(`http://127.0.0.1:5011/assessment/candidate/${candidateId}`, {
        _id: assessmentId,  // Include the top-level _id in the submission
        candidate_id: candidateId, // Include the candidate_id in the submission
        experience: experience, // Include the experience in the submission
        assessments: skills, // Send the modified assessments with candidate responses
      })
      .then((response) => {
        console.log("Submitted successfully", response);
        alert("Assessment submitted successfully!");
      })
      .catch((error) => {
        console.error("Error submitting assessment", error);
        alert("Failed to submit assessment");
      });
  };

  return (
    <Container>
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Skill Assessment
        </Typography>

        {/* Conditionally render the ProctoringComponent */}
       {/*!suspiciousActivity && <ProctoringComponent onSuspiciousActivity={handleSuspiciousActivity} />*/}

        {/* Tabs for Skills */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ marginBottom: '20px' }}
        >
          {skills.map((skill, index) => (
            <Tab key={index} label={skill.skill} />
          ))}
        </Tabs>

        {skills.length > 0 && (
          <Card sx={{ boxShadow: 3, mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {skills[activeTab].skill} - Question {currentQuestionIndex + 1}/{skills[activeTab].assessment.length}
                </Typography>
              </Box>

              <Slider
                value={currentQuestionIndex}
                onChange={handleSliderChange}
                min={0}
                max={skills[activeTab].assessment.length - 1}
                valueLabelDisplay="auto"
                sx={{ my: 3 }}
              />

              <Typography variant="body1" sx={{ mb: 2 }}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: formatQuestionText(skills[activeTab].assessment[currentQuestionIndex].question),
                  }}
                />
              </Typography>

              {renderQuestionInput(skills[activeTab].assessment[currentQuestionIndex])}
            </CardContent>

            <CardActions sx={{ justifyContent: 'space-between', padding: '20px' }}>
              <Button
                variant="outlined"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={currentQuestionIndex === skills[activeTab].assessment.length - 1}
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(prev + 1, skills[activeTab].assessment.length - 1))}
              >
                Next
              </Button>
            </CardActions>
          </Card>
        )}

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            sx={{ width: '200px', padding: '10px' }}
          >
            Submit Assessment
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SkillAssessment;
