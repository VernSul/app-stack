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


const turnRespToJson = (string) => {
    try {
        const json = JSON.parse(string.replace("```json", "").replace("```", ""))
        return json
    } catch(e) {
        return false
    }
}

const generatePromptSuggestions = async (address) => {
    const final_prompt = PROMPT_SUGGESTION_PROMPT + address
    const resp = await openai.chat.completions.create({
        model:"gpt-4o",
        temperature: 0,
        messages: [{"role": "user", "content": final_prompt}]})
    
    
    return turnRespToJson(resp.choices[0].message.content) || generatePromptSuggestions(address)
    


}

const validate_adress = async (spot) => {
    const val_prompt = `Is there a place called ${spot.name} at this address ${spot.address}. Return exclusively a json with a boolean accessed by a key "doesExist" with true if Yes and False if no.`
    
    const resp = await openai.chat.completions.create({
        model:"gpt-4o",
        temperature: 0,
        messages: [{"role": "user", "content": val_prompt}]})


    return turnRespToJson(resp.choices[0].message.content) || validate_adress(spot)
}



const search = async (query, user_address) => {
    const prompt = USER_PROMPT + user_address + "\n\n\n" + query
    messages.push({"role": "user", "content": prompt})

    try {

        const resp = await openai.chat.completions.create({
            model:"gpt-4o-mini",
            temperature: 0,
            messages})
        
        console.log({resp})

    // const parsedResponse = resp.choices[0].message.content.replace("```json", "").replace("```", "")
    

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
        const openai_content = resp.choices[0].message.content

        return turnRespToJson(openai_content) 
        } catch(e) {
            console.log("error in openai api: ", {e})
            return false

        }
    // || search(query, user_address)





}

module.exports = {
    search,
    validate_adress,
    generatePromptSuggestions
}