const express = require('express')
const Quiz = require('../models/M_quiz.js')
const Question = require('../models/M_question.js')
const Score = require('../models/M_score.js')
const History = require('../models/M_history_ans.js')
const User = require('../models/M_user')
const auth = require('../middleware/auth.js')
const router = new express.Router()
const formaidable  = require("formidable")
const path = require("path")
const fs  = require("fs-extra")
const multer = require('multer')


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
        cb(null, path.resolve("./uploaded/quiz/"));
  },
  filename: (req, file, cb) => {
    var  timestamp =  + new Date()
    var  fileName = file.originalname.toLowerCase().split(' ').join('-');
    var  lastDot = fileName.lastIndexOf('.');
    var  onlyname = fileName.substring(0, lastDot);
    var  fileExtention = fileName.split(".")[1];
    var  temp  = `${onlyname}${timestamp}.${fileExtention}`;
    cb(null, temp)
  } 
});


var upload = multer({
  storage: storage
});


router.post('/quiz/add', upload.array('files',50), async (req,res)=>{
    try {

    const obj = JSON.parse(JSON.stringify(req.body));

    //insert quiz//
    const quiz  = new Quiz(obj)
    var result_q =  await quiz.save();
    let my_quiz_id = result_q._id;

    // only record quiz //
    const reqFiles = []
    for (var i = 0; i < req.files.length; i++) {
      if(req.files[i].size != 0){
        reqFiles.push(req.files[i].filename) 
      }else{
        reqFiles.push(null)
      }
    }

    // insert question //
    const ques_obj  =  JSON.parse(obj.ques);//convert to obj
    for(var i = 0 ; i < ques_obj.length ; i++)
    {
      const ques  = new Question({...ques_obj[i],Idquiz:my_quiz_id,img:reqFiles[i]})
      var result_qes =  await ques.save();
      let my_ques_id = result_qes._id

      Quiz.findOneAndUpdate(
        { _id: my_quiz_id }, 
        { $push: {quiz_question:my_ques_id }},
        function (error, success) {
        // console.log(error)
      });

    }

    res.send({ result: true, message: JSON.stringify(result_qes)}) 
  }
  catch(error){
    res.json({ result: false, message: JSON.stringify(error)});
  }
})



router.post('/quiz/remove', async (req, res) => {
  try {
      let q_id = req.body.quiz_id
      const quiz = await Quiz.findOneAndDelete({ _id: q_id})
      const question  = await Question.deleteMany({ Idquiz: q_id}) 
      res.json({ quiz: quiz, question: question,result: true});
  } catch (e) {
      res.status(500).send(e)
  }
})



router.get('/quiz/quiz_list', async (req,res)=>{
  let quiz_list  = await Quiz.find({}).sort({createdAt: -1})
  res.send({quiz_list})
})



router.post('/quiz/show', async (req,res)=>{
  let q_id = req.body.q_id;
  Quiz.findOne({_id : q_id})
  .populate('quiz_question')
  .exec(function (err, show_quiz) {
    if (err) return handleError(err);
    res.json({show_quiz})
  });
})


router.post('/quiz/edit_question', upload.single('file'), async (req,res) => {
  try {
    
    let temp_file
    temp_file = req.file == undefined || req.file == null ? temp_file = null : temp_file = req.file.filename
    
    const obj = JSON.parse(JSON.stringify(req.body));
    const ans_array = JSON.parse(obj.ans)
    const filter = { _id: req.body.question_id};
    var update;

    if(temp_file == null){
      update = { question: req.body.ques,ans_type: obj.ans_type ,ans:ans_array}
    }else{
      update = { question: req.body.ques,ans_type: obj.ans_type ,ans:ans_array,img:temp_file}
    }

    let data = await Question.findOneAndUpdate(filter, update,{new: true})

    res.send({ result: true, message: JSON.stringify(data)}) 

  }
  catch(error){
    console.log(error)
    res.json({ result: false, message: JSON.stringify(error)});
  }
})

router.post('/quiz/add_question', upload.single('file'), async (req, res) => {
  try {
    let temp_file
    temp_file = req.file === undefined ? temp_file = null : temp_file = req.file.filename;
    
    const obj = JSON.parse(JSON.stringify(req.body));
    const ans_array = JSON.parse(obj.ans)

    const ques  = new Question({question:obj.question,ans_type:obj.ans_type,ans:ans_array,img:temp_file,Idquiz:obj.quiz_id})
        
    Quiz.findOneAndUpdate(
      { _id: obj.quiz_id },
      { $push: {quiz_question:ques._id }},
     function (error, success) {
        if (error) {
           console.log(error);
        } else {
          console.log(success);
        }
    });

    var result_qes =  await ques.save();
    res.send({ result: true, message: JSON.stringify(result_qes)}) 
  } catch (e)
  {
     console.log(e)
     res.status(500).send(e)
  }
})


router.post('/quiz/remove_question', async (req, res) => {
  try {
      let quiz_id = req.body.quiz_id
      let ques_id = req.body.ques_id
      //for delete id in [quiz] //
      const quiz = await Quiz.updateOne({ "_id": quiz_id },{ "$pull": { "quiz_question": ques_id } })
      const question  = await Question.deleteOne({ _id: ques_id}) 
      res.json({result: true});

  } catch (e) {
    console.log(e)
      res.status(500).send(e)
  }
})


router.post('/quiz/save_score',  auth , async (req, res) => {
  try{   
    const  c_data = new Score({score_data: req.body.score ,score_full: req.body.score_full , user_id : req.user._id , quiz_id : req.body.quiz_id})
    const  c_value = await c_data.save(); 

    const  h_data = new History({h_quiz_id: req.body.quiz_id,h_user_id:req.user._id , h_ans_array:req.body.ans_history })
    const  h_value = await h_data.save(); 
    
    User.findOneAndUpdate(
      { _id: req.user._id },
      { $push: {score_quiz :c_value._id }},
     function (error, success) {
        if (error) {
           console.log(error);
        } else {
          console.log(success);
        }
      }
    );  
    res.json({result: true , message: JSON.stringify(value)})

  }catch(error)
  {
   res.json({ result: false, message: JSON.stringify(error) });
  }
})


router.post('/quiz/history_score', async (req, res) => {
  let user_id = req.body.id
  const result   = await Score.deleteMany({ user_id: user_id}) 
  res.json({result})

})


router.post('/quiz/get_all_score', async (req, res) => {
  let user_id =  req.body
  let Score_list  = await Score.find({})
  // .populate('quiz')
  // .where('user_id').equals("5f71633886680958609dcbesss8")
  .sort({createdAt: -1})
   var res_data = Score_list;
   res.json({res_data})
})


router.post('/quiz/get_history_ans', async (req, res) => {

  console.log(req.body)
  let ans_his  = await History.findOne({$and: [{h_quiz_id: req.body.quiz_id}, {h_user_id: req.body.q_id_user}]})
  .populate({ 
    path: 'h_ans_array.question_id',
    select : 'question ans_type img ans',
    })
    .populate(
    {
      path: 'h_quiz_id',
      select : 'quiz_name quiz_type',   
    }
    )
    .populate(
    {
    path: 'h_user_id',
    select : 'eng_prefix eng_firstname eng_lastname'
    })
    // .where('h_user_id._id').equals(req.body.q_id_user)
    // {h_quiz_id:req.body.quiz_id}
    //match: {_id:req.body.quiz_id},
    console.log(ans_his)
    var res_data = ans_his;
    res.json({res_data})
})




module.exports = router
