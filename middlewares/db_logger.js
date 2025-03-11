var fs = require('fs');

const { pg_query } = require('./utilities/postgres')

const save_places = async (places) => {
    const placesToUpsert = places.spots.map(x => ({...x.gObject,   
        name: x.name,
        address: x.address,
        description: x.description,
        instagram: x.instagram,
        location: x.geoloc
    }))

    const sql = fs.readFileSync('./middlewares/sql/upsert_places.sql').toString();

    const results = await Promise.all(placesToUpsert.map(obj => {

        const country = obj.address.split(',').pop()
        return pg_query(sql, 
        [
            obj.place_id, 
            obj.name, 
            obj.address, 
            country, 
            obj.location.lat,
            obj.location.lng,
            obj.types,
            obj.rating,
            obj.user_ratings_total,
            obj.price_level,
            "",
            "",
            obj.instagram,
            {},
            obj.photos.map(x => x.photo_reference),
            obj.description,
            obj.business_status
         ]
    )
    }))
    return results.map(a => a[0]["id"])

}

const save_query = async (spot_query, user_location, user_uuid, place_ids, platform) => {
    
    const sql = `
        INSERT INTO queries (text_query, user_uuid, places, user_location, platform)
        VALUES ($1, $2, $3, POINT($4, $5), $6);
    `

    pg_query(sql, [spot_query, user_uuid, place_ids, user_location.lat, user_location.lng, platform])
}

const save_image = (prompt, url) => {
    const sql = `
    INSERT INTO generated_images (prompt, url)
    VALUES ($1, $2);
    `
    pg_query(sql, [prompt, url])   

}


module.exports = {
    save_query,
    save_places,
    save_image
}