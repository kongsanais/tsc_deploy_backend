const mongoose = require('mongoose')
const Schema = mongoose.Schema; 

const depSchema = new mongoose.Schema({
    dep_name:{
        type: String,
        unique: true,
        trim: true,
    },
    dep_quiz: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Quiz',
    }]
},{
    timestamps: true
})
 

const Dep = mongoose.model('Dep', depSchema ,'Deps')

module.exports = Dep