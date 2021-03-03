const express = require('express');
const app=express()
const bp=require("body-parser")
const route=require("./API_Routs_1")
const PORT = process.env.PORT ||  3000 ;
app.use(bp.json())
require('dotenv').config()
app.use("/api",route)




app.listen(PORT)
