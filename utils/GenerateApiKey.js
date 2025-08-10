const crypto = require('crypto');

const generateApiKey = () => {
    return 'sh_sps_' + crypto.randomBytes(32).toString('hex');
}
module.exports = generateApiKey