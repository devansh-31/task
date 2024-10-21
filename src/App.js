import React, { useState } from 'react';
import axios from 'axios';
import { 
  TextField, Button, CircularProgress, Container, Card, CardContent, Typography, Link, Select, MenuItem, FormControl, InputLabel, Snackbar, Alert
} from '@mui/material';
import './App.css'; // Custom CSS for additional styling

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortCriteria, setSortCriteria] = useState('relevance');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const handleSearch = async () => {
    if (query.trim() === '') {
      alert('Please enter a search term.');
      return;
    }

    setLoading(true); // Show loading indicator
    try {
      const response = await axios.get(`http://localhost:5000/search?query=${query}`);
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  const handleSortChange = (e) => {
    setSortCriteria(e.target.value);
  };

  const handleSendEmail = async () => {
    if (email.trim() === '') {
      setEmailError(true);
      return;
    }

    try {
      await axios.post('http://localhost:5000/send-email', {
        recipientEmail: email,
        results,
      });
      setEmailSent(true);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const sortedResults = results.sort((a, b) => {
    switch (sortCriteria) {
      case 'relevance':
        return 0; // Already sorted by relevance by APIs
      case 'date':
        return new Date(b.creationDate) - new Date(a.creationDate);
      case 'upvotes':
        return b.upvotes - a.upvotes;
      case 'comments':
        return b.commentCount - a.commentCount;
      default:
        return 0;
    }
  });

  return (
    <Container maxWidth="md" style={{ marginTop: '40px' }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
        Q&A Platform Search
      </Typography>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <TextField
          label="Enter Search Query"
          variant="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
      </div>

      {/* Email Section at the Top */}
      {results.length > 0 && (
        <div style={{ marginTop: '20px', marginBottom: '30px' }}>
          <Typography variant="h5" gutterBottom>
            Send Results to Your Email
          </Typography>
          <TextField
            label="Enter your email"
            variant="outlined"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(false);
            }}
            fullWidth
            margin="normal"
            error={emailError}
            helperText={emailError ? 'Please enter a valid email address' : ''}
          />
          <Button variant="contained" color="secondary" onClick={handleSendEmail}>
            Send Email
          </Button>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && <CircularProgress style={{ display: 'block', margin: '0 auto' }} />}

      {/* Sorting Dropdown */}
      {results.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <FormControl fullWidth>
            <InputLabel id="sort-label">Sort by</InputLabel>
            <Select
              labelId="sort-label"
              value={sortCriteria}
              onChange={handleSortChange}
              label="Sort by"
            >
              <MenuItem value="relevance">Relevance</MenuItem>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="upvotes">Upvotes</MenuItem>
              <MenuItem value="comments">Comments</MenuItem>
            </Select>
          </FormControl>
        </div>
      )}

      {/* Displaying Results */}
      <div className="results-container">
        {sortedResults.length > 0 && (
          <>
            {sortedResults.map((result, index) => (
              <Card key={index} variant="outlined" style={{ marginBottom: '20px' }}>
                <CardContent>
                  <Typography variant="h5" component="h2">
                    {result.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {result.summary}
                  </Typography>
                  <Link href={result.link} target="_blank" rel="noopener">
                    View Original Post
                  </Link>
                  <Typography variant="body1" style={{ marginTop: '10px' }}>
                    <strong>Upvotes:</strong> {result.upvotes} | <strong>Comments:</strong> {result.commentCount}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Date:</strong> {new Date(result.creationDate).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Snackbar for email sent */}
      <Snackbar
        open={emailSent}
        autoHideDuration={6000}
        onClose={() => setEmailSent(false)}
      >
        <Alert onClose={() => setEmailSent(false)} severity="success">
          Email sent successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
