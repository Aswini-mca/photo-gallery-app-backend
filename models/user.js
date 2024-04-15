import mongoose from "mongoose";

//user schema
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        trim: true
    },
    confirmPassword: {
        type: String,
        trim: true
    },
    resetToken: {
        type: String
    },
    resetTokenExpiresAt: {
        type: Date
    }
});

const User = mongoose.model("User", userSchema);
export { User };