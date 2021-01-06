const mongoose = require('mongoose')
const Schema = mongoose.Schema; 

const historySchema = new mongoose.Schema({
    h_quiz_id : {
        type: Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    h_user_id : {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    h_ans_array: [{
        question_id: {
            type: Schema.Types.ObjectId,
            ref: 'Question'
        },
        ans_data : {
            type : String 
        }
    }]
})

const HistoryAns = mongoose.model('HistoryAns', historySchema ,'HistorysAns')
module.exports = HistoryAns