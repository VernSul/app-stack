const { Storage } = require('@google-cloud/storage');
const axios = require('axios');
const crypto = require('crypto');

const generateRandomString = (length = 10) => {
  return crypto.randomBytes(length)
    .toString('base64')
    .slice(0, length)
    .replace(/\+/g, '0')
    .replace(/\//g, '0');
};


const storage = new Storage(); // Replace with your key file path

const uploadImageFromUrl = async (fileUrl) => {
    const destinationFileName = generateRandomString() + '.jpg'
    const bucketName = "app_stack_media"
  try {
    // Step 1: Fetch image from URL
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');
    const contentType = response.headers['content-type'];

    // Step 2: Define GCS bucket and file destination
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(destinationFileName);

    // Step 3: Upload to GCS
    await file.save(imageBuffer, {
      metadata: { contentType },
    });
    console.log(`Image uploaded to ${bucketName}/${destinationFileName}`);

    return `https://storage.googleapis.com/${bucketName}/${destinationFileName}`
  } catch (error) {
    console.error('Error uploading image:', error);
  }
}

module.exports = {
    uploadImageFromUrl          
};