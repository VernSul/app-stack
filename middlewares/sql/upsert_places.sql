INSERT INTO places (
    google_id, name, address, country, location, types, rating, user_ratings_total, 
    price_level, phone_number, website, instagram, opening_hours, photos, 
    description, business_status, created_at, updated_at
) VALUES (
    $1, $2, $3, $4, POINT($5, $6), $7, $8, $9, 
    $10, $11, $12, $13, $14, $15, 
    $16, $17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (google_id) 
DO UPDATE SET
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    country = EXCLUDED.country,
    location = EXCLUDED.location,
    types = EXCLUDED.types,
    rating = EXCLUDED.rating,
    user_ratings_total = EXCLUDED.user_ratings_total,
    price_level = EXCLUDED.price_level,
    phone_number = EXCLUDED.phone_number,
    website = EXCLUDED.website,
    instagram = EXCLUDED.instagram,
    opening_hours = EXCLUDED.opening_hours,
    photos = EXCLUDED.photos,
    description = EXCLUDED.description,
    business_status = EXCLUDED.business_status,
    updated_at = CURRENT_TIMESTAMP
RETURNING id;