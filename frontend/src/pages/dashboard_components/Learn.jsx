import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- DEPENDENCY CHECKLIST ---
// Ensure you have installed all necessary packages:
// npm install axios @mui/material @emotion/react @emotion/styled mermaid
// --------------------------

// --- MUI Component Imports ---
import { 
  Box, Button, Typography, Paper, CircularProgress, List,
  ListItem, ListItemButton, ListItemText, Divider, TextField,
  Radio, RadioGroup, FormControlLabel, FormControl
} from '@mui/material';

// The API URL for your backend
const API_BASE_URL = "https://hackwave-learnverse.onrender.com/api";

// --- Helper Components for Rendering Content ---

const Mermaid = ({ chart }) => {
  useEffect(() => {
    import('mermaid').then(mermaid => {
      mermaid.initialize({ startOnLoad: false, theme: 'default' });
      const element = document.querySelector(`.mermaid-container-${chart.replace(/\s/g, '')}`);
      if (element) {
        // FIX: Using a more robust method for generating a unique ID to prevent potential rendering bugs.
        const uniqueId = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
        mermaid.render(uniqueId, chart, (svgCode) => {
          element.innerHTML = svgCode;
        });
      }
    });
  }, [chart]);
  return <div className={`mermaid-container-${chart.replace(/\s/g, '')}`}>{chart}</div>;
};

const ContentRenderer = ({ content }) => {
  const parts = content.split(/(```mermaid.*?```)/gs);
  return (
    <Box sx={{ lineHeight: '1.6', typography: 'body1' }}>
      {parts.map((part, index) => {
        if (part.startsWith('```mermaid')) {
          const chart = part.replace(/```mermaid/g, '').replace(/```/g, '').trim();
          return <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }} key={index}><Mermaid chart={chart} /></Box>;
        }
        return <div key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br />') }} />;
      })}
    </Box>
  );
};

// --- Main App Component ---

export default function Learn() {
  const [concepts, setConcepts] =useState([]);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [scenario, setScenario] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    
    setIsLoading(true);
    setLoadingMessage("AI is analyzing your PDF...");
    setError("");
    setConcepts([]);
    setSelectedConcept(null);
    setExplanation("");

    try {
      const res = await axios.post(`${API_URL}/analyze-pdf`, formData);
      setConcepts(res.data.concepts || []); // Guard against missing data
    } catch (err) {
      // FIX: Added console.error for easier debugging
      console.error("Error analyzing PDF:", err);
      setError(err.response?.data?.detail || "An unexpected error occurred while analyzing the PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConceptSelect = async (concept) => {
    if (isLoading) return;
    setSelectedConcept(concept);
    setIsLoading(true);
    setLoadingMessage("AI is generating your learning module...");
    setError("");
    setExplanation("");
    setScenario(null);
    setQuiz(null);

    const formData = new FormData();
    formData.append('concept', concept);

    try {
      const res = await axios.post(`${API_URL}/get-learning-module`, formData);
      // FIX: Added guards (e.g., "|| []") to prevent crashes if the API response is missing a key.
      setExplanation(res.data.explanation || "");
      setScenario(res.data.scenario || null);
      setQuiz(res.data.questions || []); 
    } catch (err) {
      // FIX: Added console.error for easier debugging
      console.error("Error fetching learning module:", err);
      setError(err.response?.data?.detail || "An unexpected error occurred while fetching the topic.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 48px)', gap: 3, p: 2, background: '#f4f6f8' }}>
      {/* Sidebar */}
      <Paper elevation={2} sx={{ width: '300px', p: 2, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <Typography variant="h5" gutterBottom>Topics</Typography>
        <Box>
          <Typography variant="subtitle1" gutterBottom>1. Upload Chapter PDF:</Typography>
          <Button variant="contained" component="label" disabled={isLoading} fullWidth>
            Upload File
            <input type="file" hidden onChange={handleFileUpload} accept=".pdf" />
          </Button>
        </Box>
        <Divider sx={{ my: 2 }} />
        {concepts.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>2. Select a Topic:</Typography>
            <List>
              {concepts.map((concept) => (
                <ListItem key={concept} disablePadding>
                  <ListItemButton
                    selected={selectedConcept === concept}
                    onClick={() => handleConceptSelect(concept)}
                    disabled={isLoading}
                  >
                    <ListItemText primary={concept} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>
      
      {/* Main Content */}
      <Paper elevation={2} sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>{loadingMessage}</Typography>
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : explanation ? (
          <Box>
            <Typography variant="h4" gutterBottom>{selectedConcept}</Typography>
            <ContentRenderer content={explanation} />
            <Divider sx={{ my: 3 }} />
            <ScenarioComponent scenario={scenario} explanation={explanation} />
            <Divider sx={{ my: 3 }} />
            <QuizComponent quiz={quiz} />
          </Box>
        ) : (
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            Please upload a chapter and select a topic to begin.
          </Typography>
        )}
      </Paper> {/* ✅ FIXED: Replaced the two </Box> tags with the correct closing </Paper> tag */}
    </Box>
  );
}

// --- Sub-Components ---

function ScenarioComponent({ scenario, explanation }) {
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);

  if (!scenario) return null;

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setIsEvaluating(true);
    setFeedback("");
    const formData = new FormData();
    formData.append('scenario', scenario);
    formData.append('user_answer', userAnswer);
    formData.append('explanation', explanation);
    try {
      const res = await axios.post(`${API_URL}/evaluate-answer`, formData);
      setFeedback(res.data.feedback);
    } catch (err) {
      console.error("Error evaluating answer:", err);
      setFeedback("Error: Could not evaluate your answer.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>🚀 Apply Your Knowledge!</Typography>
      <Paper variant="outlined" sx={{ p: 2, background: '#f3f6fb', mb: 2 }}>
        <Typography>{scenario}</Typography>
      </Paper>
      <form onSubmit={handleEvaluate}>
        <TextField
          value={userAnswer}
          onChange={e => setUserAnswer(e.target.value)}
          placeholder="Type your solution here..."
          multiline
          rows={4}
          fullWidth
          required
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={isEvaluating}>
          {isEvaluating ? <CircularProgress size={24} /> : 'Submit Solution'}
        </Button>
      </form>
      {feedback && (
        <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
          <div dangerouslySetInnerHTML={{ __html: feedback.replace(/\n/g, '<br />') }} />
        </Paper>
      )}
    </Box>
  );
}

function QuizComponent({ quiz }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isQuizStarted, setIsQuizStarted] = useState(false);

  if (!quiz || quiz.length === 0) return null;

  if (!isQuizStarted) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>✍️ Test Your Knowledge!</Typography>
        <Button variant="contained" onClick={() => setIsQuizStarted(true)}>Start Quiz</Button>
      </Box>
    );
  }

  if (currentQ >= quiz.length) {
    return (
      <Box>
        <Typography variant="h5">Quiz Complete!</Typography>
        <Typography variant="h6">Your final score: {score}/{quiz.length}</Typography>
      </Box>
    );
  }

  const handleSubmit = () => {
    if (!selectedOption) return;
    setShowFeedback(true);
    if (selectedOption?.trim() === quiz[currentQ].correct_answer?.trim()) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    setCurrentQ(q => q + 1);
  };
  
  const q = quiz[currentQ];

  const getLabelStyle = (option) => {
    if (!showFeedback) return {};
    if (option === q.correct_answer) return { color: 'success.main', fontWeight: 'bold' };
    if (option === selectedOption) return { color: 'error.main' };
    return {};
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>✍️ Test Your Knowledge!</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        <strong>Question {currentQ + 1}:</strong> {q.question_text}
      </Typography>
      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          value={selectedOption || ''}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          {q.options.map((opt, i) => (
            <FormControlLabel 
              key={i} 
              value={opt} 
              control={<Radio />} 
              label={<Typography sx={getLabelStyle(opt)}>{opt}</Typography>}
              disabled={showFeedback}
            />
          ))}
        </RadioGroup>
      </FormControl>
      <Box mt={2}>
        {!showFeedback ? (
          <Button variant="contained" onClick={handleSubmit} disabled={!selectedOption}>Submit</Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>Next Question</Button>
        )}
      </Box>
    </Box>
  );
}