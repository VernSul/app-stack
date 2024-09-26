const dotenv = require('dotenv');
const axios = require('axios');
const Fuse = require('fuse.js');

dotenv.config();

const apiKey = process.env.GOOGLE_MAPS_KEY;



const approximateSim = (places, spot_name) => {
    const options = {
        includeScore: true, // Shows how well each match scored
        threshold: 0.3,     // Adjust the sensitivity (lower is more strict)
        keys: ['name']      // Key to search (if using objects, e.g., { name: 'Google' })
  };
  
  const fuse = new Fuse(places, options);
  
  // Perform fuzzy search
  const result = fuse.search(spot_name).sort((a, b) => a.score - b.score);
  console.log(result)
  if(result.length) {
    return result[0].item
  } else {
    return false
  }

}

// Function to call the Geocoding API
const validatePlaceAndAddress = async (placeName, address) => {
  
  // Geocode the address to get its coordinates
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  
  try {
    const geocodeResponse = await axios.get(geocodeUrl);
    
    if (geocodeResponse.data.status === 'OK') {
      const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
      
      // Now we use the coordinates to find places nearby with the Places API
      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&keyword=${encodeURIComponent(placeName)}&key=${apiKey}`;
      
      const placesResponse = await axios.get(placesUrl);
      
      if (placesResponse.data.status === 'OK') {
        // Check if the placeName is found within the nearby results
        const places = placesResponse.data.results;
        console.log(placeName, places)

        return approximateSim(places, placeName)

      } else {
        console.log('Error with Places API:', placesResponse.data.status);
        return false;
      }
      
    } else {
      console.log('Error with Geocoding API:', geocodeResponse.data.status);
      return false;
    }
  } catch (error) {
    console.error('Error making API request:', error.message);
    return false;
  }
}

const getAddressFromGeoloc = async (lat, lng) => {
  try {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_KEY}`
  const resp = await axios.get(url)
  console.log({resp})
  return resp.data.results[0].formatted_address
  } catch (e) {
     console.log(e)
    
  }
}

const getPlaceImagesUrl = (ref) => {
  const url_base = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=" 
  const url = url_base + ref + "&key=" + apiKey
  return url
  }

module.exports = {
    validatePlaceAndAddress,
    getAddressFromGeoloc,
    getPlaceImagesUrl
}
