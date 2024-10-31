const OpenAI = require("openai");
const { 
    SYSTEM_PROMPT, 
    USER_PROMPT, 
    PROMPT_SUGGESTION_PROMPT, 
    SECOND_USER_PROMPT, 
    PROMPT_PRINT_PROMPT_GENERATION } = require('./prompt.js')
const dotenv = require('dotenv');

// Configure dotenv to load environment variables from the .env file
dotenv.config();

const OPENAI_MODEL = 'gpt-4o'


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: "org-NoFd6Es8Ngh3KE2CCIS9vxqB",
    project: process.env.PROJECT_ID ,
    model: OPENAI_MODEL
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
        model:"gpt-4o-mini",
        temperature: 0,
        messages: [{"role": "user", "content": final_prompt}]})
    
    
    return turnRespToJson(resp.choices[0].message.content) || generatePromptSuggestions(address)
    


}

const validate_adress = async (spot) => {
    const val_prompt = `Is there a place called ${spot.name} at this address ${spot.address}. Return exclusively a json with a boolean accessed by a key "doesExist" with true if Yes and False if no.`
    
    const resp = await openai.chat.completions.create({
        model:OPENAI_MODEL,
        temperature: 0,
        messages: [{"role": "user", "content": val_prompt}]})


    return turnRespToJson(resp.choices[0].message.content) || validate_adress(spot)
}


const prompt = async (messages, params) => {
    const resp = await openai.chat.completions.create({
        ...params,
        messages})
    
    return turnRespToJson(resp.choices[0].message.content)

}

const getEtsyMetadata = async (path) => {
    const content = 
    `give a list of around 5 keywords that defines this image as it was sold as a print on etsy. 
    Those keywords should emulate the customers interested in buying this print would type. 
    Add in your response a brief descriptiom aiming at making the reader want to buy this print.
    Return the response as a json with two keys, description accessing a text, title accessing the list of keywords.`


    const messages = [{"role": "user", "content": content}]
    const params = {
        model:OPENAI_MODEL,
        temperature: 1.3,

    }


    const keywords = await prompt(messages)

    return keywords["words"]

}



const search = async (query, user_address) => {
    const prompt = USER_PROMPT + user_address + "\n\n\n" + query
    messages.push({"role": "user", "content": prompt})

    try {

        const resp = await openai.chat.completions.create({
            model:OPENAI_MODEL,
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


const getPrintImagePrompt = async (prompt_amount) => {
    console.log(PROMPT_PRINT_PROMPT_GENERATION(prompt_amount))
    const resp = await openai.chat.completions.create({
        model:"gpt-4o",
        temperature: 1.3,
        messages: [{"role": "user", "content": PROMPT_PRINT_PROMPT_GENERATION(prompt_amount)

        }]})
    
    
    return turnRespToJson(resp.choices[0].message.content)

}


const generateImage = async (prompt, resolution="1024x1024") => {
    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: resolution ,
      });
      console.log(response.data[0])

      return response.data[0];

}

module.exports = {
    search,
    prompt,
    validate_adress,
    generatePromptSuggestions,
    getPrintImagePrompt,
    generateImage,
    getEtsyMetadata
}