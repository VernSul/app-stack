// Import the necessary modules
const express = require('express');
const dotenv = require('dotenv');

const cors = require('cors');

const { searchQuery } = require('./middlewares/search')
const { getPromptSuggestions } = require('./middlewares/promptSuggestion')
const { get_items } = require('./middlewares/support')
const { generatePrintImages, paceImageGeneration, parsePrompt } = require('./middlewares/image_generation')


// Configure dotenv to load environment variables from the .env file
dotenv.config();
// Initialize an Express application
const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());



// Set up a basic route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// new spot search
app.post('/search', searchQuery)

// new spot search
app.get('/prompt', getPromptSuggestions)

// get support items
app.get('/support', get_items)

app.get('/generate_image', generatePrintImages, paceImageGeneration)

app.get('/generate_image_from_prompt', parsePrompt, paceImageGeneration)

app.post('/ig_publish', parsePrompt, paceImageGeneration)

// Start the server on a specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});