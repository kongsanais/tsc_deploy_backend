const mongoose = require('mongoose')
const Schema = mongoose.Schema; 

const quizSchema = new mongoose.Schema({
    quiz_name:{
        type: String,
        unique: true,
        trim: true
    },
    quiz_type:{
        type: String,
        trim: true
    },
    quiz_time:{
        type: String 
    }, 
    quiz_sequence:{
        type: String
    },
    quiz_question: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Question' 
    }]
},{
    timestamps: true
})
 

const Quiz = mongoose.model('Quiz', quizSchema ,'Quizs')
module.exports = Quiz