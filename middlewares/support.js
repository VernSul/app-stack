const fs = require('fs')

const get_items = (_, res) => {
    const items = fs.readFileSync('./middlewares/support_items.json')
    const items_json = JSON.parse(items)
    console.log(items_json)
    res.send(items_json)

}

module.exports = {
    get_items
}