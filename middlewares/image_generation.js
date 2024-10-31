const { getPrintImagePrompt, generateImage, getEtsyMetadata } = require('./openai')
const { save_image } = require('./db_logger');
const { createDraft } = require('./etsy');
const { uploadImageFromUrl } = require('./google')
const { PRINT_DIGITAL_DESCRIPTION } = require('./content')

const generatePrintImages = async (req, _, next) => {
    console.log("start generate images")
    let { prompt_amount, n } = req.query
    prompt_amount = parseInt(prompt_amount)
    req.n = parseInt(n)
    console.log({ prompt_amount, n })
    const { prompts }  = await getPrintImagePrompt(prompt_amount);
    req.prompts = prompts.slice(0, prompt_amount); // Attach prompts to req object
    next() 
}

const parsePrompt = (req, res, next) => {
    req.prompts = [req.body.prompt]
    req.n = parseInt(req.body.n)
    next()

}

const paceImageGeneration = (req, res) => {
    const prompts = req.prompts
    const promises = []
    let count = req.n
    let index = 0
    const refreshid = setInterval(async() => {
        if(count < 1) {
            count = req.n
            index++
        }
        if (index >= prompts.length) {
            const urls = await Promise.all(promises)
            urls.forEach(async({revised_prompt, url}) => {
                const gcs_url = await uploadImageFromUrl(url)
                save_image(revised_prompt, gcs_url)
        })

            clearInterval(refreshid)
            res.send(urls)
            return
            
        }
        const promise = generateImage(prompts[index])
        promises.push(promise)
        count--
        console.log({count, index, prompts})

    }, 13000) 

}


const publish_on_etsy = (req, res) => {

    const { path } = req.body

    const etsyGenData = getEtsyMetadata(path) 

    const product_data = {
        "quantity": 999,
        "title": etsyGenData["title"],
        "description": etsyGenData["description"] + "\n\n" +  PRINT_DIGITAL_DESCRIPTION,
        "price": 1.5,
        "who_made": "i_did",
        "when_made": "2020_2024",
        "taxonomy_id": ""

    }

    createDraft

}

module.exports = {
    generatePrintImages,
    paceImageGeneration,
    parsePrompt
}