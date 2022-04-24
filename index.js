const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require ('./models/User');
const dotenv = require ('dotenv');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server,{
  cors:{
    origin:"http://localhost:3000",
    methods: ["GET", "POST"],
    credentials:true
  }
});

const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(cors());
app.use(session({
  secret: "secret123",
  resave:false,
  saveUninitialized:false
}))
app.use(passport.initialize());
app.use(passport.session())

mongoose.connect('mongodb+srv://admin-chiri:admin-chiri@cluster0.rfpak.mongodb.net/chat-rooms?retryWrites=true&w=majority')

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

io.on("connection", socket => {    //receives the socket on connection
    socket.emit("roomLink", socket.id);

    socket.on('join-room', (roomId,userId) =>{ 
        socket.join(roomId);
        io.to(roomId).emit('user-connected', userId);

        socket.on("disconnect", () => {
          io.to(roomId).emit('user-disconnected', userId);
        });

    })
  });


app.get("/registered-users", async(req,res)=>{
  User.find({}, (err,foundUsers)=>{
    res.send(foundUsers);
  })
})

app.post('/register', (req,res)=>{
  User.register({username:req.body.sentUsername,email:req.body.sentEmail},
   req.body.sentPassword, function(err, user) {
    if (err) { 
      console.log(err);
     } else {
       const authenticate = User.authenticate();
       authenticate(req.body.sentUsername,req.body.sentPassword,
         function(err,result){
           if(err){
             console.log(err);
           } else{
             res.send("hello")
           }
         })
     }
})
})

app.post('/login', (req,res) => {
  const user = new User({
    username: req.body.sentUsername,
    password: req.body.sentPassword
  })

  req.login(user, function(err) {
    if (err) { 
      console.log(err);
      res.send(false)
    } else{
      const authenticate = User.authenticate();
       authenticate(req.body.sentUsername,req.body.sentPassword,
         function(err,result){
           if(err){
             console.log(err);
             res.send(result);
           } else{ 
             res.send(result);
           }
         })
    }
  });
})

app.get("/auth", function(req,res){
  if(req.user){
    res.send(req.user)
  } else{
    res.send(false)
  }
})

app.get("/get-user-info", function(req,res){
  User.findById
  res.send("works");
})

server.listen(port, () => console.log(`Listening on port ${port}`));
  
