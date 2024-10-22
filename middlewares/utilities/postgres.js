const { Client } = require('pg');
const dotenv = require('dotenv');

// Configure dotenv to load environment variables from the .env file
dotenv.config();

const { PG_HOST, PG_PASSWORD, PG_USER, PG_DB } = process.env

// postgresql://victor:c2Xbq6XfBROPXmiTiXZd48G2W7RdTDE8@dpg-cs0npqm8ii6s73cs0ecg-a/plaz_01d3
// postgresql://victor:c2Xbq6XfBROPXmiTiXZd48G2W7RdTDE8@dpg-cs0npqm8ii6s73cs0ecg-a.oregon-postgres.render.com/plaz_01d3

// Create a new client instance
const client = new Client({
  host: PG_HOST,     // Replace with your database host
  port: 5432,            // Default port for PostgreSQL
  user: PG_USER, // Replace with your database username
  password: PG_PASSWORD, // Replace with your database password
  database: PG_DB,  // Replace with your database name,
  ssl:true
});

// Connect to the database
client.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Connection error', err.stack));



const pg_query = async (query, values) => {
    try {
        // Use the client to perform database operations
        const res = await client.query(query, values)
  
        return res.rows
    } catch(e) {
        throw Error(`Error in postgres: ${e}`)
    }

}

module.exports = {
    pg_query
}