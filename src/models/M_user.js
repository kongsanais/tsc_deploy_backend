const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Schema = mongoose.Schema; 

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    th_prefix: {
        type: String,
        trim:true
    },
    th_firstname: {
        type: String,
        trim:true
    },
    th_lastname: {
        type: String,
        trim:true
    },
    eng_prefix: {
        type: String,
        trim:true
    },
    eng_firstname: {
        type: String,
        trim:true
    },
    eng_lastname: {
        type: String,
        trim:true
    },
    nationality: {
        type: String,
        trim:true
    },
    phone_number: {
        type: String,
        trim:true
    },
    phone_number_famaily:{
        type: String,
        trim:true
    },
    person_relationship: {
        type: String,
        trim:true
    },
    gender: {
        type: String,
        trim:true
    },
    eng_address: {
        type: String,
        trim:true
    },
    date_birthday: {
        type: Date
    },
    age:{
        type: String,
    },
    imageURL:{
    },
    resumeURL:{
    },
    job_level:{
        type: String 
    },
    job_skill:{},
    job_exp:{type: String},
    job_position:{
        type: Schema.Types.ObjectId, 
        ref: 'Dep' 
    },  
    score_quiz :[{ 
        type: Schema.Types.ObjectId, 
        ref: 'Score' 
    }],
    job_salary:{
        type: String 
    },
    education:{
        type: String 
    },
    degree_education:{
        type: String  
    },
    majoy_education:{
        type: String
    },
    gpa:{
        type: String 
    },
    role:{
        type: String 
    },
    reg_status:{
        type: String,
        default: 'Waitting'
    },
    reg_date:{
        type:Date,
        default:  new Date().toISOString().slice(0, 10)
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})



userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}


userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewcourse')
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}


userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}


// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this    
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})





const User = mongoose.model('User', userSchema ,'Users')

module.exports = User