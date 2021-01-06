const mongoose = require('mongoose')
const Schema = mongoose.Schema; 

const questionSchema = new mongoose.Schema({
    question:{
        type: String,
        trim: true
    },
    ans: {
        type: Array
    },
    ans_type:{
        type : String 
    },
    img:{
        type: String
    },
    Idquiz: { type: Schema.Types.ObjectId, ref: 'Quiz' },
},)
 

const Question = mongoose.model('Question', questionSchema ,'Questions')

module.exports = Question