const express = require('express');
const app=express()
const bp=require("body-parser")
const route=require("./API_Routs_1")
app.use(bp.json())
require('dotenv').config()
app.use("/api",route)

"old Password != New Password"



app.listen(3000)