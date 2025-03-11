

const access_token = "EAAFRzx6IvnABO3G0mnRdG0yrK2NHzfYMzWcz0FziXXgzsi65kc2hp9GYJeyRY7sZBMSDN2QI7zLdTnoPBTcEF8P0QL8THUm1FP0Ftr2ctXdiIGQej1GWQW6WmhHluK9b4vU6ENZBOV7g2ZBP8bd8T7ZCD4AigQvg7WoW03aKhAuObUcNTinSj8ZCfitzKybJ81ZA61FPConfVIkysZD"


const post_meta_api = async (endpoint, body) => {
    const resp = await axios.post(`https://graph.facebook.com/v21.0/17841469958760894/${endpoint}`, body)
    return resp
}



const publish = async (media_url, caption) => {
    const body = {
        "image_url": media_url,
        "caption": caption,
        "access_token": access_token
    }

    const { id } = await post_meta_api("media", body)
    const publish_body = {
         "creation_id": id,
         "access_token": access_token
    }
    resp = await post_meta_api("media_publish", publish_body)

    return resp["id"]
}