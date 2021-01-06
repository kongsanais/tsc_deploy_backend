const mongoose = require('mongoose')
const Schema = mongoose.Schema; 

const scoreSchema = new mongoose.Schema({
    score_data : {
        type: String,
    },
    score_full :{
        type: String
    },
    user_id :{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    quiz_id :
    { 
        type: Schema.Types.ObjectId, 
        ref: 'Quiz',
    },
},{
    timestamps: true
})

const Score = mongoose.model('Score', scoreSchema ,'Scores')
module.exports = Score