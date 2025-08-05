const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    email: { type: String, required: true },
    apiKey: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema)
module.exports = User;
