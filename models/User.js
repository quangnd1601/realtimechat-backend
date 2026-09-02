const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
    },
    hashedPassword: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
    },
    avatarUrl: {
        type: String, // Link CDN để hiển thị ảnh
    },
    avatarId: {
        type: String, // Cloudinary public_id để xóa ảnh
    },
    bio: {
        type: String,
        maxLength: 500,
    },
    phone: {
        type: String,
        sparse: true, // Cho phép null/undefined, nhưng nếu có nhập thì không được trùng
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);