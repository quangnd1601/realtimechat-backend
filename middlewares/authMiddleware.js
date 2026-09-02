const jwt = require("jsonwebtoken");
const User = require("../models/User"); 

const protectedRoute = (req, res, next) => {
    try {
        // 1. lấy token từ header
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

        // 2. xác nhận token hợp lệ
        if(!token){
            return res.status(401).json({message: "Không tìm thấy access token!"})
        }
        // 3. xác nhận token có hợp lệ 
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async(err, decodedUser)=>{
            if(err){
                console.error(err);
                return res.status(403).json({message : "Access token hết hạn hoặc không đúng!"});  
            }
            // 4. tìm user
            const user = await User.findById(decodedUser.userId).select("-hashedPassword");
            if(!user){
                return res.status(404).json({message: "Người dùng không tồn tại!"})
            }
            req.user = user;
            next();
        })

    } catch (error) {
        console.error("Lỗi khi xác minh JWT trong authMiddleware", error);
        return res.status(500).json({message : "Lỗi hệ thông!"})
        
    }
}


module.exports = { protectedRoute }