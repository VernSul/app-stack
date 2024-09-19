const OpenAI = require("openai");
const { SYSTEM_PROMPT, USER_PROMPT, PROMPT_SUGGESTION_PROMPT, SECOND_USER_PROMPT } = require('./prompt.js')
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

const generatePromptSuggestions = async (address) => {
    const final_prompt = PROMPT_SUGGESTION_PROMPT + address
    const resp = await openai.chat.completions.create({
        model:"gpt-4o",
        temperature: 0,
        messages: [{"role": "user", "content": final_prompt}]})
    
        console.log({resp})

    const json = JSON.parse(resp.choices[0].message.content.replace("```json", "").replace("```", ""))
    return json
    


}

const validate_adress = async (spot) => {
    const val_prompt = `Is there a place called ${spot.name} at this address ${spot.address}. Return exclusively a json with a boolean accessed by a key "doesExist" with true if Yes and False if no.`
    
    const resp = await openai.chat.completions.create({
        model:"gpt-4o",
        temperature: 0,
        messages: [{"role": "user", "content": val_prompt}]})

    console.log(resp.choices[0].message.content)
    try {
    
    const json = JSON.parse(resp.choices[0].message.content.replace("```json", "").replace("```", ""))

    return json.doesExist
    } catch(e) {
        print(`unable to parse validation response for ${spot}: `, e)
        return false
    }
}



const search = async (query, user_address) => {
    const prompt = USER_PROMPT + user_address + "\n\n\n" + query
    messages.push({"role": "user", "content": prompt})

    const resp = await openai.chat.completions.create({
        model:"gpt-4o",
        temperature: 0,
        messages})

    // const parsedResponse = resp.choices[0].message.content.replace("```json", "").replace("```", "")
    console.log(resp.choices[0].message.content.replace("```json", "").replace("```", ""))

    // messages.push({
    //     "role": "assistant",
    //     "content": resp.choices[0].message.content
    // })
    // messages.push({
    //     "role": "user",
    //     "content": SECOND_USER_PROMPT
    // })

    // const second_resp = await openai.chat.completions.create({
    //     model:"gpt-4o",
    //     temperature: 0,
    //     messages})

    const second_parsedResponse = resp.choices[0].message.content.replace("```json", "").replace("```", "")



    const spots = JSON.parse(second_parsedResponse)
    return spots.spots


}

module.exports = {
    search,
    validate_adress,
    generatePromptSuggestions
}