require('dotenv').config();

const config = {
    port: process.env.PORT,
    mongoUri: process.env.MONGO_URI,
    encryptionKey: process.env.ENCRYPTION_KEY,
}

module.exports = config