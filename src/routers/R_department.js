const express = require('express')
const Dep = require('../models/M_department')
const User = require('../models/M_user')
const auth = require('../middleware/auth.js')
const router = new express.Router()


router.get('/department/department_list_withquiz/:_id', auth,async (req, res) => {

    var data_check =  await User.findOne({_id:req.user._id})
    .select('score_quiz')
    .populate({ 
        path: 'score_quiz',
        select : 'score_data -_id',
    populate: { 
        path: 'quiz_id', 
        select  : 'quiz_name quiz_type' }
    }) 

    var  check_quiz_arrayId = []
    for(var i = 0 ; i < data_check.score_quiz.length ;i++)
    {
        check_quiz_arrayId.push(data_check.score_quiz[i].quiz_id._id)
    }

    let id = req.params._id;
    let Dep_list  = await Dep.findOne({})
                   .populate(
                   {path: 'dep_quiz',
                     match: {_id: {'$nin': check_quiz_arrayId}}, 
                    options: { 
                       sort: { 'quiz_sequence': 1 }, 
                    } 
                   })
                   .where('_id').equals(id)
                   .sort({createdAt: 1})
    var res_data = Dep_list.dep_quiz;
    res.send({res_data})
})


router.get('/department/department_list', async (req,res)=>{
    let Dep_list  = await Dep.find({}).populate('dep_quiz').sort({createdAt: -1})
    res.send({Dep_list})
})



router.get('/department/get_only_depart', async (req,res)=>{
    let Dep_list  = await Dep.find({}).select('dep_name').sort({createdAt: -1})
    res.send({Dep_list})
})

  

router.post('/department/add', async (req, res) => {
    try{
        const  data = new Dep({dep_name: req.body.depart_name , dep_quiz : req.body.select_quiz})
        const  value = await data.save(); 
        res.json({result: true , message: JSON.stringify(value)})
    }catch(error)
    {
       res.json({ result: false, message: JSON.stringify(error) });
    }
})


router.post('/department/remove' , async (req, res) => {
    try {
        const data = await Dep.findOneAndDelete({ _id: req.body.depart_id})
        console.log(data)
        if (!data) {
            res.status(404).send()
        }
        res.send(data)
    } catch (e) {
        res.json();
    }
})


module.exports = router