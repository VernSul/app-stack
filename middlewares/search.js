const { search } = require('./openai')
const dotenv = require('dotenv');
const axios = require('axios')

// Configure dotenv to load environment variables from the .env file
dotenv.config();

const URL = "https://maps.googleapis.com/maps/api/geocode/json?address=314 W 52nd St, New York, NY 10019&key=AIzaSyD7DxPdzQ7PEox9UgkhokVhh5EcEJ92ixg"

const URL_BASE = "https://maps.googleapis.com/maps/api/geocode/json?address="

const getGeoLoc = async (spot) => {
    console.log({spot})
    let url;
    if(spot.address) { 
        url = URL_BASE + spot.address.replace(" ", "+") + "&key=" + process.env.GOOGLE_MAPS_KEY
    } else if (spot.adress) {
        url = URL_BASE + spot.adress.replace(" ", "+") + "&key=" + process.env.GOOGLE_MAPS_KEY
    } else if (spot.addres) {
        url = URL_BASE + spot.addres.replace(" ", "+") + "&key=" + process.env.GOOGLE_MAPS_KEY
    }
    const resp = await axios.get(url)
    spot.geoloc =  new google.maps.LatLng(
        resp.data.results[0]["geometry"]["location"]["lat"], 
        resp.data.results[0]["geometry"]["location"]["lng"])
    // { 
    //     lat: resp.data.results[0]["geometry"]["location"]["lat"], 
    //     lng: resp.data.results[0]["geometry"]["location"]["lng"]
    // }
    console.log(spot.geoloc)

    return spot


}

const getMapsElements = async (req, res) => {
    const query = req.body.spot_query
    console.log({query})

    try {
        const chatGptResp = await search(query)
        console.log({chatGptResp})
        const full_resp = await Promise.all(chatGptResp.map(obj => getGeoLoc(obj)))
        const final_resp = {spots: full_resp, locations: full_resp.map(({geoloc}) => geoloc)}
        res.send(final_resp)
    }
    catch(e) {
        console.log("error in search openai: ", e)
        res.status(500);
        res.send('Server error: ', e);
    }


}

module.exports = {
    getMapsElements
}