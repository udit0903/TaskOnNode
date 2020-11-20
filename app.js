const express=require('express');
const mongoose = require('mongoose');
var flash = require('connect-flash');
const path= require('path');
var bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator');
const multer=require('multer');
var upload = multer({ dest: 'uploads/' });
var engine = require('consolidate');
//connect to DB
mongoose.connect('mongodb://localhost:27017/tdb');
let db=mongoose.connection;
//conection check
db.once('open',function(){
    console.log('connected to mongodb');
});
//check error
db.on('error',function(err){
    console.log(err);
});

//init app
const app= express();
//bring user model
let User=require('./models/user');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname,'public')));
// parse application/json
app.use(bodyParser.json())
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'uploads')));
//app.use(express.static('uploads'));
app.engine('html', engine.mustache);


//home route
app.get('/',function(req,res){
    res.sendFile('views/index.html',{root:__dirname});
});

//Get list of all Users
app.get('/alluser',  function(req, res) {
    User.find().select("_id Name")
       .exec()
       .then(function(docs){
           const response = {
              allUsers: docs.map(doc => {
              return {
                 Name: doc.Name,
                 id  : doc._id
                };
             })
          };

      //  res.render('user',Json.parse(response))  ;
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

//Get detail of particular Users
app.get('/userdetail/:id',  function(req, res) {
    const id = req.params.id;
    User.findById(id)
      .select('Name Email Contact_No Hobbies Image State City')
      .exec()
      .then(function(doc ) {
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/'
                    }
                });
            } else {
                res.status(404).json({ message: "No valid"});
            }
      })
      .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
      });
});

// delete user
app.delete('/userdelete/:id',function(req,res){
    let query={ id:req.params.id}
    User.findById(req.param.id,function(err,user){
        User.remove(query,function(err){
            if(err) {
               console.log(err);
            }
           res.send('success');
        });
    });
});

//edit user detail
app.put('/editdetail/:id',upload.single('Image'),function(req,res){

    //const id=req.params.id;
    let userUpdate={};
    userUpdate.Name=req.body.Name;
    userUpdate.Email=req.body.Email;
    userUpdate.Contact_No=req.body.Contact_No;
    userUpdate.Gender=req.body.Gender;
    userUpdate.Hobbies=req.body.Hobbies;
  //userUpdate.Image=req.body.Image;
    userUpdate.Image=req.file.path;
    userUpdate.State=req.body.State;
    userUpdate.City=req.body.City;
    let query={_id:req.params.id}
    User.updateOne(query,userUpdate,function(err){
        if(err){
          console.log(err);
          return;
        }else{
          res.status(200).json({
              product: userUpdate,
              request: {
                  type: 'GET',
                  url: 'http://localhost:3000/'
              }
         });
       }
    });
});


//add user
app.post('/adduser',upload.single('Image'), function(req,res){
    const Name=req.body.Name;
    const Email=req.body.Email;
    const Contact_No=req.body.Contact_No;
    const Gender=req.body.Gender;
    const Hobbies=req.body.Hobbies;
    const Image=req.file.path;
    const State=req.body.State;
    const City=req.body.City;
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }else{
          var newUser=new User(  {
              Name:Name,
              Email:Email,
              Contact_No:Contact_No,
              Gender:Gender,
              Hobbies:Hobbies,
              Image:Image,
              State:State,
              City:City
          });
          newUser.save()
          .then(data=>{res.send("item saved to database");
          })
          .catch(err=>{  res.json({message:err});
          })
      }
});
//start server
app.listen(3000, function() {
    console.log('server started on port 3000');
});
