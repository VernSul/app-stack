const { getPrintImagePrompt, generateImage, getEtsyMetadata } = require('./openai')
const { save_image } = require('./db_logger');
const { createDraft, uploadImage } = require('./etsy');
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

const getImageBinary = async (url) => {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');
      console.log("Image binary data retrieved successfully");
      return imageBuffer;
    } catch (error) {
      console.error("Error fetching image:", error.message);
    }
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

const get_etsy_listing_metadata = async (path) => {
    const etsyGenData = await getEtsyMetadata(path) 
    console.log({etsyGenData})

    const product_data = {
        "quantity": 999,
        "title": etsyGenData["title"][0],
        "description": etsyGenData["description"] + "\n\n" +  PRINT_DIGITAL_DESCRIPTION,
        "price": 1.5,
        "who_made": "i_did",
        "when_made": "2020_2024",
        "taxonomy_id": 119,
        "type": "download"
    }

    return product_data

}


const publish_on_etsy = async (req, res) => {

    const { path } = req.body
    const product_data = await get_etsy_listing_metadata(path)
    const etsy_resp = await createDraft(product_data)
    const image_binary = await getImageBinary(path)
    const etsy_image_resp = await uploadImage(etsy_resp["listing_id"], image_binary)
    const final_resp = {...etsy_resp, ...etsy_image_resp}

    res.json(final_resp)

}

module.exports = {
    generatePrintImages,
    paceImageGeneration,
    parsePrompt,
    publish_on_etsy
}