const { saveUser } = require("../database.js");
const bcrypt = require("bcrypt");

async function SignUp(newUser) {
  const hashedPassword = await bcrypt.hash(newUser.password, 10);
  const dbResponse = await saveUser({
    email: newUser.email,
    password: hashedPassword,
  });

  return dbResponse;
}

module.exports = { SignUp };
