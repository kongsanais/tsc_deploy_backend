db.getCollection('Users').aggregate(
    [
       { $project: { 
          email: "$email"  ,
          fullname: { $concat: [ "$th_firstname", " - ", "$th_lastname" ] } ,
          age: "$age"
       }},
       { 
         $match: { 
          email: "kongsanais@gmail.com",
          $or: [ { age: "19" } ]
       }},
    ]
 )
       

 //db.getCollection('Users').aggregate([
//   { $match: { $and: [{ role: 'Production' },{ th_prefix: 'นาย'},{reg_date: { $gte: '2020-09-10T00:00:00.000Z' , $lte:'2020-09-10T00:00:00.000Z' }}]}},
//   { $project: { 
//     _id : "$_id",
//     th_prefix : "$th_prefix",
//     fullnameTH: { $concat: ["$th_firstname", " ", "$th_lastname" ] } ,
//     eng_prefix : "$eng_prefix",
//     fullnameENG: { $concat:["$eng_firstname", " ", "$eng_lastname" ] } ,
//     nationality: "$nationality",
//     phone_number: "$phone_number",
//     phone_number_famaily: "$phone_number_famaily",
//     person_relationship:"$person_relationship",
//     eng_address:"$eng_address",
//     date_birthday:"$date_birthday",
//     age:"$age",
//     degree_education:"$degree_education",
//     majoy_education:"$majoy_education",
//     gpa:"$gpa",
//     createdDate: "$createdAt",
//     count:"$count"
//     }}
//   ])
    
    
    
    
    