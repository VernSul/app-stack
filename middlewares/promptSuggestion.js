const { getAddressFromGeoloc } = require('./google_maps')
const { generatePromptSuggestions } = require('./openai')



const getPromptSuggestions = async (req, res) => {
    try {
        const { lat, lng } = req.query
        
        // if(typeof(lat) != 'float' || typeof(lng) != 'float') {
        //     res.status(400)
        //     res.send('params not formatted properly')
        // }
        console.log({lat, lng})
        const address = await getAddressFromGeoloc(lat, lng)
        const suggestions = await generatePromptSuggestions(address)
        console.log(suggestions)
        return res.send(suggestions)
    } catch(e) {
        console.log({e})
        res.status(500);
        return res.send(e);
    }


}

module.exports = { getPromptSuggestions } 