const bcrypt = require('bcrypt');

const enteredPassword = "new      123"; // password you're trying to test
const storedHash = "$2b$10$pAEbpCYgHC4fgmfxBZDd7Oq5rntc0jolhP69ixWR2HVpONsX0EIn2"; // hashed password from DB

bcrypt.compare(enteredPassword, storedHash).then(match => {
  console.log("Password match:", match);
});
