const express = require('express');
const axios = require('axios');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Stack Overflow & Reddit API Endpoints
app.get('/search', async (req, res) => {
  const query = req.query.query;

  try {
    // Fetch data from Stack Overflow
    const stackOverflowResponse = await axios.get(
      `https://api.stackexchange.com/2.2/search?order=desc&sort=activity&intitle=${query}&site=stackoverflow`
    );

    // Fetch data from Reddit
    const redditResponse = await axios.get(`https://www.reddit.com/search.json?q=${query}`);

    // Combine and format results
    const results = [];

    // Process Stack Overflow Results
    stackOverflowResponse.data.items.forEach((item) => {
      results.push({
        title: item.title,
        summary: item.body ? item.body.slice(0, 150) : 'No summary available',
        link: item.link,
        topAnswer: item.is_answered ? 'Answered' : 'Not Answered',
        upvotes: item.score,
        commentCount: item.answer_count,
        creationDate: item.creation_date * 1000 // Convert Unix timestamp to JavaScript date
      });
    });

    // Process Reddit Results
    redditResponse.data.data.children.forEach((item) => {
      results.push({
        title: item.data.title,
        summary: item.data.selftext ? item.data.selftext.slice(0, 150) : 'No summary available',
        link: `https://www.reddit.com${item.data.permalink}`,
        topAnswer: 'See comments on Reddit',
        upvotes: item.data.ups,
        commentCount: item.data.num_comments,
        creationDate: item.data.created_utc * 1000 // Convert Unix timestamp to JavaScript date
      });
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data from APIs' });
  }
});

// Email endpoint
app.post('/send-email', async (req, res) => {
  const { recipientEmail, results } = req.body;

  try {
    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'myemail@gmail.com', // Replace with your email
        pass: 'password',  // Replace with your email password or app-specific password
      },
    });

    // Generate email content
    const emailContent = results.map((result, index) => {
      return `
        <h3>${result.title}</h3>
        <p>${result.summary}</p>
        <a href="${result.link}" target="_blank">View Original Post</a>
        <p><strong>Upvotes:</strong> ${result.upvotes}, <strong>Comments:</strong> ${result.commentCount}, <strong>Date:</strong> ${new Date(result.creationDate).toLocaleDateString()}</p>
        <hr/>
      `;
    }).join('');

    // Email options
    const mailOptions = {
      from: 'devansh3131@gmail.com', // Sender's email address
      to: 'shahdevansh498@gmail.com',           // Recipient's email address
      subject: 'Your Search Results',
      html: `<div>${emailContent}</div>`, // HTML body containing the search results
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Error sending email' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
