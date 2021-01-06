const express = require('express')
const moment  = require('moment')
const User = require('../models/M_user')
const Score = require('../models/M_score.js')
const auth = require('../middleware/auth')
const auth_admin = require('../middleware/admin_auth')
const router = new express.Router()
const formaidable  = require("formidable")
const path = require("path")
const fs  = require("fs-extra")

const { update } = require('../models/M_user')


uploadImage = async (files, doc) => {
  if (files.imageURL != null) {
    var fileExtention = files.imageURL.name.split(".")[1];
    doc.imageURL = `${doc._id}.${fileExtention}`;
    var newpath = path.resolve("./uploaded/images/") + "/" + doc.imageURL;
    if (fs.exists(newpath)) {
      await fs.remove(newpath);
    }
    await fs.moveSync(files.imageURL.path, newpath);
    // Update database
    let result = User.findOneAndUpdate({ _id: doc._id }, {imageURL: doc.imageURL});
    return result;
  }
};

uploadResume = async (files, doc) => {
  if (files.resumeURL != null) {
    var fileExtention = files.resumeURL.name.split(".")[1];
    doc.resumeURL = `${doc._id}.${fileExtention}`;
    var newpath = path.resolve("./uploaded/resume/") + "/" + doc.resumeURL;
    if (fs.exists(newpath)) {
      await fs.remove(newpath);
    }
    await fs.moveSync(files.resumeURL.path, newpath);
    // Update database
    let result = User.findOneAndUpdate({ _id: doc._id }, {resumeURL: doc.resumeURL});
    return result;
  }
};

router.post('/users', async (req, res) => {
    try{
      const form = new formaidable.IncomingForm()
      form.parse(req, async (error,fields,files) =>
      {   
          console.log(fields)
          const user  = new User(fields)
          const user_file  = files ; 

          await User.find({email : user.email}, async function (err, docs) 
            {
            if (docs.length == 1) {
                 res.json({ result: false, message: JSON.stringify(error) }); 
            }else{              
                  let result =  await user.save();
                  await  uploadImage(user_file,result)
                  await  uploadResume(user_file,result)
                  res.json({result: true , message: JSON.stringify(result)})
            }
          });
      }
    )
    }catch(error){
      res.json({ result: false, message: JSON.stringify(error) });
    }
})


router.put("/users/update", auth , (req, res)=>{
  try {
    const form = new formaidable.IncomingForm()

    form.parse(req, async (error, fields, files) => 
    {
        const user  = new User(fields)
        const user_file  = files;
        

        let result = await User.findOneAndUpdate({ "_id": user._id }, 
        { "$set": { 
          "th_prefix"  :  user.th_prefix,
          "th_firstname": user.th_firstname,
          "th_lastname" : user.th_lastname,
          "eng_prefix"  : user.eng_prefix,
          "eng_firstname" : user.eng_firstname,
          "eng_lastname"  : user.eng_lastname, 
          "nationality"  : user.nationality,
          "phone_number" : user.phone_number,
          "phone_number_famaily" : user.phone_number_famaily,
          "person_relationship"  : user.person_relationship,
          "eng_address"   : user.eng_address,
          "date_birthday" : user.date_birthday,
          "age": user.age,
          "job_level" : user.job_level,
          "job_position" : user.job_position,
          "job_salary" : user.job_salary,
          "degree_education": user.degree_education,
          "education" : user.education,
          "majoy_education" :user.majoy_education,
          "gpa" : user.gpa

        }},{ new: true }) //new for return

        await uploadImage(user_file, fields);
        await uploadResume(user_file,fields);

        res.json({result: true , message: JSON.stringify(result)})

    }); 
  } catch (error) {
        res.json({result: false , message: JSON.stringify(result)})
  }
})


router.put("/users/update_reg_status", async (req, res)=>{
  try {
    let update_status = await User.findOneAndUpdate({ "_id": req.body.update_id}, 
    { "$set": { 
      "reg_status"  :  req.body.update_status,
    }},{ new: true })
        res.json({result: true , message: JSON.stringify(update_status)})
  } catch (error) {
        res.json({result: false , message: JSON.stringify(result)})
  }
})

router.post('/users/login', async (req, res) => {
  try {
      const user = await User.findByCredentials(req.body.email, req.body.password)
      const token = await user.generateAuthToken()
      res.send({result:true,user,token })
    } catch (e) {
      res.send({result:false})
  }
})


router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        let data = await req.user.save()
        res.send(data)
    } catch (e) {
        res.status(e).send()
    }
})

router.get('/users/profile', auth, async (req, res) => {
    let profile  = req.user;
    res.send({profile})
})

router.get('/users/get_appProfile/:_id', async (req, res) => {
  let one_user = await User.findOne({_id:req.params._id}).populate('job_position').populate({ 
    path: 'score_quiz',
    populate: { path: 'quiz_id' , 
    select  : 'quiz_name quiz_type _id'}
  })
  console.log(one_user)
  res.send({one_user})
  })

router.get('/users/count_status', async (req, res) => {
  let count_status = await User.aggregate([
  {
    $group:{
      _id:{reg_status:"$reg_status"},
      count:{$sum:1}
    }
  }, {$sort: { count: -1 } }// -1  DESC    //  1 ASC  
  ]);
  res.json(count_status)
})

router.get('/users/count_reg_year', async (req, res) => {
  var date = new Date()
  var d_year =  date.getFullYear()
  let count_status = await User.aggregate([
    { $project: { createdAt: "$createdAt", year :{ "$year" : new Date()}}},
    { $match: { year: d_year } },
    { $group: { _id : {month: { $month: "$createdAt" }, year: { $year: new Date() }  }, count: { $sum: 1 } } },
    { $sort :{"_id.month":1}}
  ]);
  res.json(count_status)
 })

 
router.post('/users/delete_user' , async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.body.id})
    const clear_score  = await Score.deleteMany({ user_id:req.body.id}) 
    res.send(user)
    } catch (e) {
    res.status(500).send()
    }
})



 
module.exports = router