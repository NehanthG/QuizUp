const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const user = require('../models/user');
const jwt = require('jsonwebtoken');
const admin = require('../models/admin');
const questions = require('../models/questions');
const mainLayout = '../views/layouts/main';
const adminLayout = '../views/layouts/admin_dashboard';
const profileLayout = '../views/layouts/profileLayout';
const loginLayout = '../views/layouts/loginLayout';
const addQuestionLayout = '../views/layouts/newQuestion';

router.get('/',(req,res)=>{
    res.render('index',{layout:loginLayout});
})

router.post('/',async(req,res)=>{
    try {
        const{username,password}= req.body;
        const person = await user.findOne({username});
        if(!person){
            
            return res.status(401).json({message:"Invalid Credentials"})
        }
        const isPasswordValid = await bcrypt.compare(password,person.password);
        if(!isPasswordValid){
            return res.status(401).json({message:"Invalid Credentials"})
        }
        req.session.username= username;

        
        res.redirect('/home');
        
    } catch (error) {
        if(error.code===11000){
            return res.status(409).json({message:'Username already exists'});
        }else{
            console.log(error);
            
        }
    }
})

router.get('/home',async(req,res)=>{
    try {
        if(!req.session.username){
            return res.redirect('/');
        }
        
        const data =await questions.find();
        const now = new Date();
        const hours = now.getHours();
        res.render('home',{layout:mainLayout,data,hours,username:req.session.username});

    } catch (error) {
        console.log(error);
        
    }

})

router.post('/logout',(req,res)=>{
    req.session.destroy(err=>{
        if(err){
            console.log(err);
            return res.send('Error logging out');
            
        }
        res.redirect('/');
    })
})

router.get('/register',(req,res)=>{
    res.render('register',{layout:mainLayout});
})
router.post('/register',async(req,res)=>{
    try {
        const{username,password,confirm_password}= req.body;
        
        if(password===confirm_password){
            const hashedPassword = await bcrypt.hash(password,10) ;
            await user.create({username,password:hashedPassword});
        }
        else{
            res.send(401).render('register',{layout:mainLayout,error:"The passwords donot match"});
        }

        req.session.username=username;

        res.redirect('/home');
    } catch (error) {
        if(error.code===11000){
            return res.status(409).json({message:'Username already exists'});
        }else{
            console.log(error);
            
        }
    }
})
router.get('/dashboard',async(req,res)=>{
    try {
        const data =await questions.find();
        res.render('admin/dashboard',{layout:mainLayout,data});
    } catch (error) {
        console.log(error);       
    }
})


router.get('/admin',async(req,res)=>{
    try {
        
        res.render('admin/admin',{layout:mainLayout});
    } catch (error) {
        console.log(error);       
    }
})
router.post('/admin',async(req,res)=>{
    try {
        const{username,password}= req.body;
        const person = await admin.findOne({username});
        if(!person){
            return res.status(401).json({message:"Invalid Credentials"})
        }
        
        if(password!=person.password){
            return res.status(401).json({message:"Invalid Credentials"})
        }
        req.session.username=username;
        const data =await questions.find();
        res.render('admin/dashboard',{layout:adminLayout,data})
        
    } catch (error) {
        if(error.code===11000){
            return res.status(409).json({message:'Username already exists'});
        }else{
            console.log(error);
            
        }
    }
})

router.get('/users',async(req,res)=>{
    try {
        const data  =await  user.find();

        res.render('admin/allusers',{layout:adminLayout,data});
    } catch (error) {
        console.log(error);
        
    }
})
router.post('/delete-user/:id',async(req,res)=>{
    try {
        const id = req.params.id;
        await user.findByIdAndDelete(id);
        // res.render('admin/dashboard',{layout:mainLayout,data})
        res.redirect('/users')
    } catch (error) {
        console.log(error);
    }

})

router.get("/add-question",(req,res)=>{
    res.render('admin/newQuestion',{layout:addQuestionLayout})
})
router.post("/add-question",async(req,res)=>{
    try {
        const question = req.body.question;
        const optionA = req.body.optionA;
        const optionB = req.body.optionB;
        const optionC = req.body.optionC;
        const optionD = req.body.optionD;
        const correctAnswer = req.body.correctAnswer;
        await questions.create({
            question,
            choices:{
                a:optionA,
                b:optionB,
                c:optionC,
                d:optionD
            }
            ,
            correctOption:correctAnswer
        })
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error);
        
    }
});

router.get("/edit-question/:id",async(req,res)=>{
    const id =req.params.id;
    const data = await questions.findById(id);
    // data.choices = data.choices || { a: '', b: '', c: '', d: '' };
    // data.correctOption = data.correctOption || '';
    console.log(data.choices);
    
    res.render('admin/editpost',{layout:addQuestionLayout,data})
})

router.post("/edit-question/:id",async(req,res)=>{
    try {
        const id = req.params.id;
        const question = req.body.question;
        const optionA = req.body.optionA;
        const optionB = req.body.optionB;
        const optionC = req.body.optionC;
        const optionD = req.body.optionD;
        const correctAnswer = req.body.correctAnswer;
    
        await questions.findByIdAndUpdate(id,{
            question,
            choices:{
                a:optionA,
                b:optionB,
                c:optionC,
                d:optionD
            }
            ,
            correctOption:correctAnswer
    })
        
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error);
        
    }
});

router.post('/delete-question/:id',async(req,res)=>{
    try {
        const id = req.params.id;
        await questions.findByIdAndDelete(id);
        const data = await questions.find();;
        // res.render('admin/dashboard',{layout:mainLayout,data})
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error);
    }

})

router.get('/question/:id',async (req,res)=>{
try {
    const id= req.params.id;
    const data =await questions.findById(id).lean(); 
    if(!data){
        console.log('Question Not Found');
        return res.status(401).json({message:"Question not found"});
    }
    let message="";
    res.render('question_attempt',{layout:mainLayout,data,message});
} catch (error) {
    console.log(error);
    
}
})

router.post('/question/:id',async(req,res)=>{
    try {
        const id = req.params.id;
        const data = await questions.findById(id).lean();
        const Option = req.body;
        const person = await user.findOne({username:req.session.username})
        let message="";
        const alreadyAttempted = person.attemptedQuestions.includes(id);
        if(Option.selectedOption==data.correctOption){
            if(!alreadyAttempted){
                person.score+=1;
                person.attemptedQuestions.push(id);
                await person.save();
                message="Your Answer is correct";
            }
            else{

                message="Points will we awarded only for the 1st correct submission!"
            }
            
        }
        else{
            message="Your answer is wrong!!";
            
        }
            res.render('question_attempt',{layout:mainLayout,data,message});

        
    } catch (error) {
        console.log(error);
    }

})

router.get('/profile',async(req,res)=>{
    try {
        const data  =await user.findOne({username:req.session.username});
        res.render('profile',{layout:profileLayout,data})
    } catch (error) {
        console.log(error);
        
    }
})


router.get('/leaderboard',async(req,res)=>{
    try {
        const data  =await  user.find().sort({score:-1});

        res.render('leaderBoard',{layout:mainLayout,data});
    } catch (error) {
        console.log(error);
        
    }
})
module.exports = router;