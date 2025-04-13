// test.js
const bcrypt = require('bcrypt');

const storedHash = "$2b$10$YtOi4l6v/h2VXgVUSZ3.y.cDALacN6HccJGQHRrfsyc.83bV.BRPK"; // hash from DB
const testPassword = "t123"; // the password you want to test

async function checkPassword() {
  try {
    const isMatch = await bcrypt.compare(testPassword, storedHash);
    console.log("✅ Password match:", isMatch);
  } catch (err) {
    console.error("❌ Error comparing passwords:", err);
  }
}

checkPassword();
