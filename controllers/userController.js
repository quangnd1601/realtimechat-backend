
const authMe = async (req,res) => {
    try {
        const user = req.user; // authMiddleware
        return res.status(200).json({
            user
        })

    } catch (error) {
        console.error("Lỗi khi gọi authMe", error);
        return res.status(500).json({message: "Lỗi hệ thống!"})
    }
}

const test = async (req, res) => {
    return res.sendStatus(204);
}
module.exports = { authMe, test }