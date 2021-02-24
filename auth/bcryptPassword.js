const br = require("bcrypt");
require('dotenv').config()
let salt =process.env.PASSWORD_SALT;

 function HashPassword(string, result) {
  br.hash(string, salt, (err, value) => {
    result(err == true ? false : value);
  });
}
function ComparePassword(password,hash_password, result) {
  console.log(`password:${password} , hash:${hash_password}`)
  br.compare(password, hash_password, (err, state)=> {
    if(err){
      console.log(err)
  }else{
    result(state)
  }
});
 
  }
  
module.exports = { HashPassword, ComparePassword};
