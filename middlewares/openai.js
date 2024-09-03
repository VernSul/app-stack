const OpenAI = require("openai");
const { SYSTEM_PROMPT } = require('./prompt.js')
const dotenv = require('dotenv');

// Configure dotenv to load environment variables from the .env file
dotenv.config();


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: "org-NoFd6Es8Ngh3KE2CCIS9vxqB",
    project: process.env.PROJECT_ID ,
});

let messages = [
    {
        "role": "system",
        "content": SYSTEM_PROMPT
    }
]

console.log()


const search = async (req, res, next) => {
    const query = req.body.spot_query
    messages.push({"role": "user", "content": query})
    const resp = await openai.chat.completions.create({
        model:"gpt-4o",
        messages})
    const parsedResponse = resp.choices[0].message.content.replace("```json", "").replace("```", "")
    console.log(parsedResponse)
    const spots = JSON.parse(parsedResponse)
    res.json(spots)

}

module.exports = {
    search
}