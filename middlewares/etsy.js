const axios = require('axios')



// Keystring  63pjadbmuzk8i0q1acnulphs
// Shared   secret4sw4k1hgrg





const createDraft = async (listing_data) => {
    const url = "https://openapi.etsy.com/v3/application/shops/{shop_id}/listings"
    const response = await axios.post(url, listing_data)
    return response
}


module.exports = {
    createDraft
}