const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); 

const User = require("../models/User"); 
const Session = require("../models/Session");
 
const ACCESS_TOKEN_TTL = "30s";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 *60 * 1000; // 14 ngày

const signUp = async (req, res) => {
    try {
         const {username , password , email, firstName, lastName} = req.body;
        if ( !username || !password || !email || !firstName || !lastName) {
            return res.status(400).json({message: "Không thể thiếu username, password, email, firstName và lastName!"})
        }
        // 1. kiểm tra user tồn tại
        const duplicate = await User.findOne({username});
        if(duplicate){
            return res.status(409).json({message : "username đã tồn tại!"})
        }
        const hashedPassword = await bcrypt.hash(password, 10); // salt = 10

        // 2. tạo user mới
        await User.create({
            username,
            hashedPassword,
            email, 
            displayName: `${firstName} ${lastName}`
        })

        return res.sendStatus(204)
    } catch (error) {
        console.error("Lỗi khi gọi signUp", error);
        return res.status(500).json({message: "Lỗi hệ thống!"})
    }
}
const signIn = async (req, res) => {
    try {
        // 1. lấy input
        const {username, password} = req.body;
        if(!username || !password){
            return res.status(400).json({message: "Thiếu username hoặc password!"});
        }
        // 2. lấy hasdedPassword trong db => so sánh với password
        const user = await User.findOne({username});

        if(!user){
            return res.status(401).json({message: "username hoặc password không đúng!"})
        }

        // 3. kiểm tra password
        const correctPassword = await bcrypt.compare(password, user.hashedPassword);

        if(!correctPassword){
            return res.status(401).json({message: "user hoặc password khoong chính xác!"})
        }
        // 4. nếu khớp => tạo accessToken với JWT
        const accessToken = jwt.sign({userId: user._id}, 
            process.env.ACCESS_TOKEN_SECRET, 
            {expiresIn: ACCESS_TOKEN_TTL}
        );

        // 5. tạo refreshToken
        const refreshToken = crypto.randomBytes(64).toString("hex");
        await Session.create({
            userId : user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
        });
        res.cookie("refreshToken", refreshToken,{
            httpOnly:true,
            secure: true,
            sameSite: "none", // backend, frontend deloy riêng
            maxAge: REFRESH_TOKEN_TTL
        })
        // 6.
        return res.status(200).json({message: `User ${user.displayName} đã login`, accessToken});

    } catch (error) {
        console.error("Lỗi khi gọi signIN", error);
        return res.status(500).json({message: "Lỗi hệ thống!"})
    }

}
const signOut = async (req,res) => {
    try {
        // 1. lấy refresh token từ cookie
            const token = req.cookies?.refreshToken;

        // 2. xóa refresh token trong session +  xóa cookie
         if(token) {
                await Session.deleteOne({refreshToken: token})
                res.clearCookie("refreshToken");
            }
        return res.sendStatus(204);
    } catch (error) {
        console.error("Lỗi khi gọi signOut", error);
        return res.status(500).json({message: "Lỗi hệ thống!"})
    }
}
// tạo access token mới từ refresh token
const refreshToken = async (req,res) => {
    // 1. lấu refresh token từ cookie
    try {
        const token = req.cookies?.refreshToken;
        if( !token){
            return res.status(401).json({message : "Token không tồn tại!"})
        }
        // 2. so với refresh token trong db
        const session = await Session.findOne({refreshToken: token});
        if( !session) {
            return res.status(403).json({message: "Token không hợp lệ hoặc đã hết hạn!"})
        }
        // 3. kiểm tra hết hạn chưa
        if(session.expiresAt < new Date()){
            return res.status(403).json({message :"Token đã hết hạn!"})
        }
        // 4. tạo access token mới 
        const accessToken = jwt.sign(
            {userId: session.userId,},
            process.env.ACCESS_TOKEN_SECRET, 
            {expiresIn: ACCESS_TOKEN_TTL});

        // 5. return
        return res.status(200).json({accessToken});

    } catch (error) {
        console.error("Lỗi khi gọi refreshToken", error);
        return res.status(500).json({message: "Lỗi hệ thống!"})
    }
} 
module.exports = {
    signUp,
    signIn,
    signOut,
    refreshToken
}