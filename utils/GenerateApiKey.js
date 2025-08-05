const generateApiKey = () => {
    return 'evmgr_' + crypto.randomBytes(32).toString('hex');
}
module.exports = generateApiKey