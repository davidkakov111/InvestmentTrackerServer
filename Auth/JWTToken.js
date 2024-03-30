const jwt = require("jsonwebtoken");
require("dotenv").config();

function createJWT(email) {
    const token = jwt.sign(
        { email: email},
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
    );
    return token;
}

function getJWT(req) {
    const jwtToken = req.headers['authorization'];
    if (jwtToken) {
        try {
            const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET);
            return decodedToken.email;
        } catch (error) {
            console.error('Invalid token:', error);
            return 'Unauthorized';
        }
    } else {
        return 'Unauthorized';
    }
}

module.exports = {getJWT, createJWT};
