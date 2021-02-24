const jwt=require("jsonwebtoken")
let salt=process.env.TOKEN_SALT
require('dotenv').config()
function createToken(data){
 return jwt.sign(data,salt)
}
function readToken(token,res){
    ErrorReadToken(token,err=>{
    if(err){
        res({state:false})
    }else{
        res({state:true,data:jwt.verify(token,salt)})
    }
    })

}
function ErrorReadToken(token,state){
     jwt.verify(token,salt,(err)=>{
        state(err)
     })
}
module.exports={createToken,readToken}