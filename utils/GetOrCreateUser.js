const User = require("../models/UserSchema");
const generateApiKey = require("./GenerateApiKey");

const getOrCreateUser = async (clerkUserId, email) => {
    let user = await User.findOne({ clerkId: clerkUserId });
    if (!user) {
        user = new User({
            clerkId: clerkUserId,
            email: email,
            apiKey: generateApiKey()
        });
        await user.save();
    }
    return user;
}
module.exports = getOrCreateUser;