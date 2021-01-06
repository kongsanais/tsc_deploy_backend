const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/R_user')
const adminRouter = require('./routers/R_admin')
const reportRouter = require('./routers/R_report')
const departRouter  = require('./routers/R_department')
const quizRouter  =  require('./routers/R_quiz')
const app = express()
const cors = require('cors');
const { static } = require('express');
app.use(cors())

const port = process.env.PORT || 3000
app.use(express.json())

app.use("/api",userRouter)
app.use("/api",adminRouter)
app.use("/api",reportRouter)
app.use("/api",departRouter)
app.use("/api",quizRouter)

app.use(express.static(__dirname + "/uploaded"))

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

