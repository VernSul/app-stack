const mock_data = require('./mock_request.json')
const axios = require('axios')

const URL = "https://app-stack.onrender.com"
const CONCURRENT_REQUESTS = 60
// "http://localhost:3000"


const test_search = async () => {
    
    const promise_resp = []

    for(let i = 0; i < mock_data.length; i++) {
        const req = mock_data[i]
        promise_resp.push(axios.post(`${URL}/search`, req))
        if(i === 0){
            let j = CONCURRENT_REQUESTS
            while(j > 0) {
                promise_resp.push(axios.post(`${URL}/search`, req))
                j--
            }
        }     
    }
    const resps = await Promise.all(promise_resp)
    return resps
}

const test = async () => {
    const start = Date.now();
    const search_responses = await test_search()
    search_responses.forEach(x => {
        if(!x.data.spots) {
            console.log('\x1b[33m No response for query: \x1b[0m');
            console.log(x.config.data)
        }
        else if(!x.data.spots.length) {
            console.log("No locations for query: ", x.config.data)
        }
    })
    console.log((Date.now() - start) / 1000, 's')
}

test()