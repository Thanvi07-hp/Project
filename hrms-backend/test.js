// test.js
const bcrypt = require('bcrypt');

const storedHash = ""; // hash from DB
const testPassword = ""; // the password you want to test

async function checkPassword() {
  try {
    const isMatch = await bcrypt.compare(testPassword, storedHash);
    console.log("✅ Password match:", isMatch);
  } catch (err) {
    console.error("❌ Error comparing passwords:", err);
  }
}

checkPassword();
