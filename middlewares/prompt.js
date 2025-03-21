

const SYSTEM_PROMPT = 
`
You are a specialist for a bar and restaurant throughout the world and give ideas spots that accomodate the best the user request in the language of the request. 
You will recommend 6 spots that match the query. Make sure those places exist. Please make sure the place in the location that is requested.
Your response will have the shape of a json object where a list of spots with the schema of name, address, description, instagram is accessed through the key spots.
`

const USER_PROMPT = 
`
Please make sure those spots are in the locations that is requested.

Here is the request for a user located at this address: `

const SECOND_USER_PROMPT = 
`
Please also remove the spots which are not in the locations that were requested initially.
Return this new response in the exact same json schema as the previous one with a new key instagram which the exact instgram account of the place.
`


const PROMPT_SUGGESTION_PROMPT =
`
Give me 3 suggestions of prompt for searching for a restaurant, a bar, a café, etc. Those suggestions should not exceed 10 words and be lead by a matching emoji. 
The response will be formatted as a json with a key suggestions accessing a list of prompt suggestions.
Here are a few examples:
- a cocktail bar for a first date with a romantic decor in West village.
- Give me a restaurant in Brooklyn that has a similar vibe as Thursday Kitchen, the restaurant in East Village in New York.
- an italian restaurant with a warm atmosphere for less than 50 dollars per person.
- A café where I can work all day surrounded by creative people.

Those prompts should match the location below and be in the tongue spoken in this city.

location: `



const PROMPT_PRINT_PROMPT_GENERATION = (amount=5) => 
`
give me ${amount} prompt(s) similar to this one used to generate an image, not reusing the saying "Not all who wander are lost". You could base it on a saying or no saying at all. Those prompts are meant to generate images that are beautiful, delicate, artful and inspiring. They relate to self-improvement or self-gratification:
"create a picture with no words that is a representation of "Not all who wander are lost" in the style of toile de jouy." It can ask to for an image in another art deco styles likes those ones: Art Nouveau, Chinoiserie, Japandi, Rococo, Aubusson Tapestry, Ottoman Iznik, Bauhaus, Gothic Revival, Arts and Crafts, Baroque, Renaissance Ornamentation, Victorian Botanical Illustration, Persian Miniature, Trellis Wallpaper, Egyptian Revival, Trompe-l'œil, Moorish Tilework, Indigo Shibori, Scandinavian Folk Art, Neoclassical Ornamentation, etc
Make this image publishable on instagram and with 600 dpi.
Return those prompts in a json list accessed through a key called "prompts".
`



module.exports = {
    SYSTEM_PROMPT,
    USER_PROMPT,
    SECOND_USER_PROMPT,
    PROMPT_SUGGESTION_PROMPT,
    PROMPT_PRINT_PROMPT_GENERATION
}