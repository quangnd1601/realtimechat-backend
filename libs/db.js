const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
        console.log("Kết nối với CSDL thành công!");
    } catch (error) {
        console.log("Kết nối với CSDL lỗi rồi!");
        process.exit(1);
    }
}

module.exports = {
    connectDB
}