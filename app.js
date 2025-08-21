const express = require('express');
const app = express();
const expressLayout = require('express-ejs-layouts');
const PORT = 5000;
const sessions = require('express-session');
const MongoStore= require('connect-mongo');
const{connectToDB}= require('./config/db');

app.use(sessions({
  secret: 'your-secret-key', // keep this secure in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true if using HTTPS
}));


app.use(express.static('public'));
app.use(express.urlencoded({extended:true}))
//Templating engine
app.use(expressLayout);
app.set('layout','./layouts/main');
app.set('view engine','ejs');

connectToDB('mongodb://localhost:27017/quizdb').then(()=>{
    console.log("Database connected!");
    
});
app.use('/',require('./routes/main'));

app.listen(PORT,()=>{
    console.log(`Server listenning on port ${PORT}`);    
})