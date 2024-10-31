



const access_token = "EAAFRzx6IvnABO0ZBO5IA5kGCOageWgrRbG0IfZB6taOyRuNiZB1fEzHpKt6ZBPcSUb7CLUyASrYImmGzC6CnSrZBTZCZAQlEbZAQb4zez4xi0t5PD5GBvbU4wMdP0eV84rNNwNLUVLQsGXDoYefX0t8y0q15PPf10c05wU3eUcIqIM2kEZCMmLiJJzXmVgNtJ8sZC5dGMSeL6FRrFg8ZCgZD"


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