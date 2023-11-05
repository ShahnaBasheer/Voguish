const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET,{ expiresIn: "15m"});
};
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET,{ expiresIn: "3d"});
};
const generateAdminToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_ADMIN_SECRET,{ expiresIn: "15m"});
};
const generateAdminRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_ADMIN_SECRET,{ expiresIn: "2d"});
};

module.exports ={ generateToken, generateRefreshToken, generateAdminToken, generateAdminRefreshToken } 