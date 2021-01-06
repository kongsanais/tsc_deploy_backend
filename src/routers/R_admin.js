const express = require('express')
const Admin = require('../models/M_admin')
const auth = require('../middleware/admin_auth.js')
const router = new express.Router()
const formaidable  = require("formidable")
const path = require("path")
const fs  = require("fs-extra")



router.post('/admin/register', async (req, res) => {
    try{
      const form = new formaidable.IncomingForm()
      form.parse(req, async (error,fields,files) =>
      {       
          const admin  = new Admin(fields)
          await Admin.find({email : admin.email}, async function (err, docs) 
            {
            if(docs.length == 1) {
                 res.json({ result: false, message: JSON.stringify(error)}); 
            }else{               
                  let result =  await admin.save();
                  res.json({result: true , message: JSON.stringify(result)})
            }
            
          });
      })
    }catch(error){
       res.json({ result: false, message: JSON.stringify(error) });
    }
})



router.post('/admin/login', async (req, res) => {
  try {
      const admin = await Admin.findByCredentials(req.body.email, req.body.password)
      const token = await admin.generateAuthToken()
      res.send({result:true,admin,token })
    } catch (e) {
      res.send({result:false})
  }
})


router.post('/admin/logout', auth , async (req, res) => {
    try {
        req.admin.tokens = req.admin.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.admin.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})


module.exports = router