const Fuse = require('fuse.js');

// List of strings to search
const places = [
  'Le Chat Perché'
];

// Set up Fuse.js options for fuzzy search
const options = {
  includeScore: true, // Shows how well each match scored
  threshold: 0.3,     // Adjust the sensitivity (lower is more strict)
  keys: ['name']      // Key to search (if using objects, e.g., { name: 'Google' })
};

console.log(places.map(place => ({ name: place.name })))

const fuse = new Fuse(places.map(place => ({ name: place.name })), options);

// Perform fuzzy search
const result = fuse.search('Chat Mallows Café'); // Search for approximate match

console.log(result); // Logs search results and scores
