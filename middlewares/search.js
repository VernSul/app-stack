const { search, validate_adress } = require('./openai')
const { validatePlaceAndAddress, getAddressFromGeoloc, getPlaceImagesUrl } = require('./google_maps')
const { save_query, save_places } = require('./db_logger');
const dotenv = require('dotenv');
const axios = require('axios')

// Configure dotenv to load environment variables from the .env file
dotenv.config();

const URL = "https://maps.googleapis.com/maps/api/geocode/json?address=314 W 52nd St, New York, NY 10019&key=AIzaSyD7DxPdzQ7PEox9UgkhokVhh5EcEJ92ixg"

const URL_BASE = "https://maps.googleapis.com/maps/api/geocode/json?address="

const getGeoLoc = async (spot) => {
    let url;
    if(spot.address) { 
        url = URL_BASE + spot.address.replace(" ", "+") + "&key=" + process.env.GOOGLE_MAPS_KEY
    } else if (spot.adress) {
        url = URL_BASE + spot.adress.replace(" ", "+") + "&key=" + process.env.GOOGLE_MAPS_KEY
    } else if (spot.addres) {
        url = URL_BASE + spot.addres.replace(" ", "+") + "&key=" + process.env.GOOGLE_MAPS_KEY
    }
    const resp = await axios.get(url)
    spot.geoloc =  { 
        lat: resp.data.results[0]["geometry"]["location"]["lat"], 
        lng: resp.data.results[0]["geometry"]["location"]["lng"]
    }
    return spot


}

const validate_address = async (spot) => {
    const isValid = await validate_adress(spot)
    return isValid

}


const getMapsElements = async (req) => {
    const query = req.body.spot_query
    if(!query) {
        throw new Error("query cannot be null")
    }
    const user_location = req.body.user_location

    const user_address = await getAddressFromGeoloc(user_location.lat, user_location.lng)


    const { spots } = await search(query, user_address)
    const doesExistMany =  await Promise.all(spots.map(x => validatePlaceAndAddress(x.name, x.address)))
    let validatedPlaces = []
    doesExistMany.forEach((x, i) => {
        if(x) {
            let obj = { ...spots[i] }
            obj.gObject = {
                place_id: x.place_id,
                price_level: x.price_level,
                rating: x.rating,
                types: x.types,
                opening_hours: x.opening_hours,
                photos: x.photos.map(y => getPlaceImagesUrl(y.photo_reference)),
                rating: x.rating,
                business_status: x.business_status,
                user_ratings_total: x.user_ratings_total

            }
            validatedPlaces.push(obj)
        }
    })
    const full_resp = await Promise.all(validatedPlaces.map(obj => getGeoLoc(obj)))
    let final_resp = {spots: full_resp, locations: full_resp.map(({geoloc}) => geoloc)}

    if(!final_resp.spots.length) {
        final_resp = await getMapsElements(req)
    }
    log_query(req, final_resp)
    return final_resp


}

const searchQuery = async (req, res) => {
    try {
        let mapElements = await getMapsElements(req)
        res.send(mapElements)
    } catch(e) {
        console.log("error in search openai: ", e)
        res.status(500);
        res.send('Server error: ', e);

    }
    
}

const log_query = async (req, places) => {
    const { spot_query, user_location, user_uuid, platform } = req.body
    const place_ids = await save_places(places)
    console.log({place_ids})
    await save_query(spot_query, user_location, user_uuid, place_ids, platform)


}

module.exports = {
    getMapsElements,
    searchQuery
}