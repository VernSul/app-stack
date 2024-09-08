

const SYSTEM_PROMPT = 
`
You are a specialist for a bar and restaurant throughout the world and give ideas spots that accomodate the best the user request in the language of the request. 
You will recommend 10 spots that match the query. Make sure those places exist. Please make sure the place in the location that is requested.
Your response will have the shape of a json object where a list of spots with the schema of name, address, description is accessed through the key spots.
`

const USER_PROMPT = 
`
Please make sure those spots exist and are not definitely closed. 
Also please double check the address and make sure you provided the correct one.
Please make sure those spots are in the locations that is requested.

Here is the user request:

`

const SECOND_USER_PROMPT = 
`
Please remove from this list the places that don't exist or are closed.
Please also check that the address is correct and replace it with the correct one.
Please also remove the spots which are not in the locations that were requested initially.
Return this new response in the exact same json schema as the previous one with a new key instagram which the exact instgram account of the place.

`



module.exports = {
    SYSTEM_PROMPT,
    USER_PROMPT,
    SECOND_USER_PROMPT
}