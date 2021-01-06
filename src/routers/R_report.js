const express = require('express')
const moment  = require('moment')
const User = require('../models/M_user')
const auth_user = require('../middleware/auth')
const auth_admin = require('../middleware/admin_auth')
const router = new express.Router()
const formaidable  = require("formidable")
const path = require("path")
const fs  = require("fs-extra")
const { update } = require('../models/M_user')


//get all user list 
router.get('/report/alluser' ,async (req, res) => {
 try {
  let all_user = 
  await User.find({})
  .sort({createdAt: -1})
  res.send({all_user})
 } catch (e) {
    res.send({result:false})
 }
})


//get all engineer user
router.get('/report/alluser/engineer' ,async (req, res) => {
  let all_user = await User.find({})
                      .populate({ 
                        path: 'score_quiz',
                        populate: { path: 'quiz_id' , 
                        select  : 'quiz_name quiz_type' }
                      })
                      .where('role').equals('Engineer')
                      .sort({createdAt: -1})
  res.send({all_user})
})

//get all production user
router.get('/report/alluser/production' ,async (req, res) => {
  let all_user = await User.find({})
                      .where('role').equals('Production')
                      .sort({createdAt: -1})
  res.send({all_user})
})

//get all filter by date 
router.post('/report/alluserByDate', async (req, res) => {
  try {
     let all_user_bydate = await User.find({ reg_date: { $gte: req.body.date_start , $lte:req.body.date_end } }).sort({ createdAt: -1});
     res.send({all_user_bydate})
  } catch (e) {
     res.send({result:false})
  }
})


//get by status all  
router.get('/report/count_status', async (req, res) => {
  let count_status = await User.aggregate([
   {$group:{ _id:{reg_status:"$reg_status"},count:{$sum:1}}},
   {$sort: { count: -1 } }// -1  DESC    //  1 ASC  
  ]);
  res.json(count_status)
})

// get by status all engineer
router.get('/report/count_status/engineer', async (req, res) => {
  let count_status = await User.aggregate([
  { $match: { role: "Engineer" } },
  { $group:{ _id:{reg_status:"$reg_status"},count:{$sum:1}}}, 
  {$sort: { count: -1 } }// -1  DESC    //  1 ASC  
  ]);
  res.json(count_status)
})

// get by status all production 
router.get('/report/count_status/production', async (req, res) => {
  let count_status = await User.aggregate([
  { $match: { role: "Production" } },
  { $group:{ _id:{reg_status:"$reg_status"},count:{$sum:1}}}, 
  {$sort: { count: -1 } }// -1  DESC    //  1 ASC  
  ]);
  res.json(count_status)
})

//get register count this year in 12 month  all 
router.get('/report/count_reg_year', async (req, res) => {
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


 //get register count this year in 12 month engineer 
router.get('/report/count_reg_year/engineer', async (req, res) => {
  var date = new Date()
  var d_year =  date.getFullYear()
  let count_status = await User.aggregate([
    { $project: { createdAt: "$createdAt", year :{ "$year" : new Date()}, role: "$role"}},
    { $match: { $and: [{ role: 'Engineer' }, { year: d_year  }]}},
    { $group: { _id : {month: { $month: "$createdAt" }, year: { $year: new Date() }  }, count: { $sum: 1 } } },
    { $sort :{"_id.month":1}}
  ]);
  res.json(count_status)
 })

//get register count this year in 12 month production 
router.get('/report/count_reg_year/production', async (req, res) => {
  var date = new Date()
  var d_year =  date.getFullYear()
  let count_status = await User.aggregate([
    { $project: { createdAt: "$createdAt", year :{ "$year" : new Date()}, role: "$role"}},
    { $match: { $and: [{ role: 'Production' }, { year: d_year  }]}},
    { $group: { _id : {month: { $month: "$createdAt" }, year: { $year: new Date() }  }, count: { $sum: 1 } } },
    { $sort :{"_id.month":1}}
  ]);
  res.json(count_status)
 })

//get count all user  
router.get('/report/count_all_user', async (req, res) => {
  try {
    let count = await User.aggregate(
    [{ $count: "userCount" },])
      var value =  count[0].userCount
      res.json(value)
   } catch (e) {
    var userCount = 0 
    res.json(userCount)
   }
})


//get count all user  by role 
router.get('/report/count_all_user_by_role', async (req, res) => {
  try {
    let count = await User.aggregate(
      [
        { $group : {_id:"$role", count:{$sum:1}}},
        { $sort :{"_id": 1 }}
      ]
    )
    if(count.length == 0){
      count = [ { _id: 'Engineer', count: 0 }, { _id: 'Production', count: 0 } ]
    }
    res.json(count)
   } catch (e) 
   {
    console.log(e)
    res.json([ { _id: 'Engineer', count: 0 }, { _id: 'Production', count: 0 } ])
   }
})


//get json export production // 
router.post('/report/get_json_export/production', async (req, res) => {
  
 let field = req.body.field
 let data_gender = req.body.filter_data.gender
 let date_start = req.body.filter_data.date_start
 let date_end = req.body.filter_data.date_end
 var R_date_start = new Date(date_start); 
 var R_date_stop = new Date(date_end); 

 if (data_gender != null && date_start != null && date_end != null){
    var filter_data = {$and:[{role:'Production'},{gender:data_gender},{reg_date: { $gte: R_date_start, $lte: R_date_stop}}]}
 }else if (data_gender == null && date_start != null && date_end != null){
    var filter_data = {$and:[{role:'Production'},{reg_date: { $gte: R_date_start, $lte: R_date_stop}}]}
 }else {
    var filter_data = {$and:[{role:'Production'}]}
 }

 var data = await User.aggregate([
  { $match: filter_data},
  { $project: { 
    th_prefix : "$th_prefix",
    fullnameTH: { $concat: ["$th_firstname", " ", "$th_lastname" ] } ,
    eng_prefix : "$eng_prefix",
    fullnameENG: { $concat:["$eng_firstname", " ", "$eng_lastname" ] } ,
    phone_number: "$phone_number",
    phone_number_famaily: "$phone_number_famaily",
    person_relationship:"$person_relationship",
    eng_address:"$eng_address",
    age:"$age",
    degree_education:"$degree_education",
    majoy_education:"$majoy_education",
    gpa:"$gpa",
    job_skill:"$job_skill",
    reg_date: "$reg_date",
    }}
  ]);


  var filter_array  =  []
  for(var i = 0 ; i < field.length ;i++ )
  {
    filter_array.push(field[i].filed)
  }


  var real_data = []
  for(var i = 0 ; i < data.length ; i++)
  {
  var  filtered =  Object.keys(data[i]).filter(key => filter_array.includes(key))
  .reduce((obj, key) => {
    obj[key] = data[i][key];
    return obj;
  }, {});
      real_data.push(filtered)
  }/// for filter data

//  console.log(filter_array)
 res.send({real_data})
  
})

//get json export engineer // 
router.post('/report/get_json_export/engineer', async (req, res) => 
{
  let field  =  req.body.field
  let date_start = req.body.date_filter.date_start
  let date_end = req.body.date_filter.date_end
  var R_date_start = new Date(date_start); 
  var R_date_stop = new Date(date_end);

  let result_user  = await User.find({reg_date: { $gte: R_date_start, $lte: R_date_stop}})
    .populate({ 
        path: 'score_quiz',
        select : 'score_data -_id',
    populate: { 
        path: 'quiz_id', 
        select  : 'quiz_name quiz_type -_id' }
    })
    .populate({
        path: 'job_position',
        select: '-dep_quiz -_id -createdAt -updatedAt -__v',
          populate : { 
          path: 'dep_quiz',
        },
    })
    .where('role').equals('Engineer')
    .sort({createdAt: -1})
    
    var export_data = [];
    for(var i = 0 ; i < result_user.length ; i++) { 
    var  score_text =  ""
    for(var j = 0 ; j < result_user[i].score_quiz.length ; j++)
    {
    score_text  +=  j +1 + ")" + " "+ result_user[i].score_quiz[j].quiz_id.quiz_name + " " + "(" +result_user[i].score_quiz[j].score_data +")" + "\r\n"
    }

    export_data.push({
    email:result_user[i].email,
    th_prefix:result_user[i].th_prefix,
    th_fullname:result_user[i].th_firstname+" "+result_user[i].th_lastname,
    eng_prefix:result_user[i].eng_prefix,
    eng_fullname:result_user[i].eng_firstname+" "+result_user[i].eng_lastname,
    phone_number:result_user[i].phone_number,
    phone_famaily:result_user[i].phone_number_famaily + " " + "("+  result_user[i].person_relationship + ")",
    address:result_user[i].eng_address, 
    date_birthday: moment(result_user[i].date_birthday).format("ddd, ll"),
    age: result_user[i].age,
    job_level:result_user[i].job_level,
    job_position:result_user[i].job_position.dep_name,
    job_salary:result_user[i].job_salary,
    degree_education:result_user[i].degree_education,
    education:result_user[i].education,
    majoy_education:result_user[i].majoy_education,
    gpa: result_user[i].gpa,
    score_quiz: score_text,
    reg_date:moment(result_user[i].reg_date).format("ddd, ll"),
    })////obj push
    }///for 

    var filter_array  =  []
    for(var i = 0 ; i < field.length ;i++ )
    {
      filter_array.push(field[i].filed)
    }

    var real_data = []

    for(var i = 0 ; i < result_user.length ; i++)
    {
    var  filtered =  
    Object.keys(export_data[i]).filter(key => filter_array.includes(key))
    .reduce((obj, key) => {
      obj[key] = export_data[i][key];
      return obj;
    }, {});
        real_data.push(filtered)
    }/// for filter data

    res.send({real_data})

})

router.post('/report/allByDateEng', async (req, res) => {
  try {
     let all_user_bydate = await User.find({ reg_date: { $gte: req.body.date_start , $lte:req.body.date_end } })
     .populate({ 
      path: 'score_quiz',
      populate: { path: 'quiz_id' , 
      select  : 'quiz_name quiz_type' }
    })
    .where('role').equals('Engineer')
    .sort({ createdAt: -1})
     res.send({all_user_bydate})
  } catch (e) {
     res.send({result:false})
  }
})


router.post('/report/allByDatePro', async (req, res) => {
  try {
     let all_user_bydate = await User.find({ reg_date: { $gte: req.body.date_start , $lte:req.body.date_end } })
     .populate({ 
      path: 'score_quiz',
      populate: { path: 'quiz_id' , 
      select  : 'quiz_name quiz_type' }
    })
    .where('role').equals('Production')
    .sort({ createdAt: -1})
     res.send({all_user_bydate})
  } catch (e) {
     res.send({result:false})
  }
})





module.exports = router