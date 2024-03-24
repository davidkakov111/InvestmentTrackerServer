const { getUserByEmail } = require('../database.js');
const bcrypt = require('bcrypt');

async function SignIn(newUser, res) {
    const dbResponse = await getUserByEmail(newUser.email)
    if (typeof dbResponse === 'string') return dbResponse;

    const passwordCorrect = await bcrypt.compare(newUser.password, dbResponse[0].password);

    if (passwordCorrect) {
        return "Success";
    } 
    return "Incorrect password";
}

module.exports = {SignIn};
