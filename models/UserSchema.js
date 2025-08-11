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

userSchema.index({ email: 1 });                          // Optional: For fast lookup by email
userSchema.index({ apiKey: 1 });                         // Optional: For looking up by API key


const User = mongoose.model('User', userSchema)
module.exports = User;
