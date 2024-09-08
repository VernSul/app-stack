const OpenAI = require("openai");
const { SYSTEM_PROMPT, USER_PROMPT,SECOND_USER_PROMPT } = require('./prompt.js')
const dotenv = require('dotenv');

// Configure dotenv to load environment variables from the .env file
dotenv.config();


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: "org-NoFd6Es8Ngh3KE2CCIS9vxqB",
    project: process.env.PROJECT_ID ,
    model: 'gpt-4o'
});

let messages = [
    {
        "role": "system",
        "content": SYSTEM_PROMPT
    }
]

const validate_adress = async (spot) => {
    const val_prompt = `Is there a place called ${spot.name} at this address ${spot.address}. Return a json with boolean acessed by a key "doesExist" with true if Yes and False if no.`
    
    const resp = await openai.chat.completions.create({
        model:"gpt-4o",
        temperature: 0,
        messages: [{"role": "user", "content": val_prompt}]})

    console.log(resp.choices[0].message.content)
    
    const json = JSON.parse(resp.choices[0].message.content.replace("```json", "").replace("```", ""))

    return json.doesExist
}



const search = async (query) => {
    const prompt = USER_PROMPT + query
    messages.push({"role": "user", "content": prompt})

    const resp = await openai.chat.completions.create({
        model:"gpt-4o",
        temperature: 0,
        messages})

    // const parsedResponse = resp.choices[0].message.content.replace("```json", "").replace("```", "")
    console.log(resp.choices[0].message.content.replace("```json", "").replace("```", ""))

    messages.push({
        "role": "assistant",
        "content": resp.choices[0].message.content
    })
    messages.push({
        "role": "user",
        "content": SECOND_USER_PROMPT
    })

    const second_resp = await openai.chat.completions.create({
        model:"gpt-4o",
        temperature: 0,
        messages})

    const second_parsedResponse = second_resp.choices[0].message.content.replace("```json", "").replace("```", "")



    console.log(second_parsedResponse)
    const spots = JSON.parse(second_parsedResponse)
    return spots.spots


}

module.exports = {
    search,
    validate_adress
}