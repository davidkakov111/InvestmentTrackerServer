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
    // Extract JWT token from cookie header
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
        // Parse the cookie header to extract the JWT token
        const cookies = cookieHeader.split(';').reduce((cookiesObj, cookie) => {
            const [name, value] = cookie.trim().split('=');
            cookiesObj[name] = value;
            return cookiesObj;
        }, {});

        const jwtToken = cookies.JWTToken;
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
    } else {
        return 'Unauthorized';
    }
}

module.exports = {getJWT, createJWT};
