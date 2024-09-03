// Import the necessary modules
const express = require('express');
const dotenv = require('dotenv');
const { search } = require('./middlewares/openai')

// Configure dotenv to load environment variables from the .env file
dotenv.config();
// Initialize an Express application
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());



// Set up a basic route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// new spot search
app.post('/search', search)

// Start the server on a specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});