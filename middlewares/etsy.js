const axios = require('axios')



// Keystring  63pjadbmuzk8i0q1acnulphs
// Shared   secret4sw4k1hgrg


const refreshEtsyToken = async () => {
    console.log({process.env.ETSY_REFRESH_TOKEN)
    const url = `https://api.etsy.com/v3/public/oauth/token?
      grant_type=refresh_token
      &client_id=63pjadbmuzk8i0q1acnulphs
      &refresh_token=${process.env.ETSY_REFRESH_TOKEN || '962014629.xYwypdNkTM3KmXZQEWfJhrREdbRTNXpA3Ns99c7_R1gM6oCS5RkHQfJaRbzKjd6syBcP6tYWaqXmlAkQ9C7IGf-ZCu'}`;
  
    const data = {
      grant_type: 'refresh_token',
      client_id: '63pjadbmuzk8i0q1acnulphs',         // Replace with your Etsy client ID
      refresh_token: process.env.ETSY_REFRESH_TOKEN || '962014629.xYwypdNkTM3KmXZQEWfJhrREdbRTNXpA3Ns99c7_R1gM6oCS5RkHQfJaRbzKjd6syBcP6tYWaqXmlAkQ9C7IGf-ZCu'
    };
  
    try {
      const response = await axios.post(url, {}, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
  
      // New access token and refresh token
      console.log('New Access Token:', response.data.access_token);
      console.log('New Refresh Token:', response.data.refresh_token);

      console.log(response.data)
  
      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error.response ? error.response.data : error.message);
    }
  }




const getToken = async () => {
    if(!process.env.ETSY_TOKEN_EXPIRATION || (Math.floor(Date.now() / 1000) < process.env.ETSY_TOKEN_EXPIRATION && process.env.ETSY_TOKEN)) {
        return process.env.ETSY_TOKEN
    } else {
        const refresh_resp = await refreshEtsyToken()
        process.env.ETSY_TOKEN = refresh_resp.access_token
        process.env.ETSY_REFRESH_TOKEN = refresh_resp.refresh_token
        process.env.ETSY_TOKEN_EXPIRATION = Math.floor(Date.now() / 1000) + refresh_resp.expires_in
        return refresh_resp.access_token
    }
}




const createDraft = async (listing_data) => {
    const url = "https://openapi.etsy.com/v3/application/shops/54149789/listings"
    const headers = { 
        "Authorization": `Bearer ${await getToken()}`,
        "Content-Type": "application/json", 
        "x-api-key": "63pjadbmuzk8i0q1acnulphs"
    }
    const response = await axios.post(url, listing_data, { headers })
    return response['data']
}

const uploadImage = async (listing_id, image_binary) => {
    const body = {
        image: image_binary
    } 
    const url = `https://openapi.etsy.com/v3/application/shops/54149789/listings/${listing_id}/images`
    const headers = { 
        "Authorization": `Bearer ${await getToken()}`,
        "Content-Type": "application/json", 
        "x-api-key": "63pjadbmuzk8i0q1acnulphs"
    }
    const response = await axios.post(url, body, { headers })
    return response['data']

}


module.exports = {
    createDraft,
    uploadImage
}
