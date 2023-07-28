const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
var session = require('express-session');
const { error } = require('console');
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set('view engine' ,"ejs");

//session
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'anuj',
  resave: false,
  saveUninitialized: true,
}))
//connect all pages throw server
app.get('/',function(req,res){
    if(!req.session.isloggedin){
        res.redirect("/login");
        return;
    }
    res.render("index",{username:req.body.email});
});
app.get('/about',function(req,res){
    if(!req.session.isloggedin){
        res.redirect("/login");
        return;
    }
    res.sendFile(__dirname+"/about.html");
})
app.get('/contact',function(req,res){
    if(!req.session.isloggedin){
        res.redirect("/login");
        return;
    }
    res.sendFile(__dirname+"/contact.html");
})

app.get('/todo',function(req,res){
    if(!req.session.isloggedin){
        res.redirect("/login");
        return;
    }
    res.sendFile(__dirname+"/todo.html");
})


app.get('/login',function(req,res){
    res.render("login",{error:null});
    
})



//login page not found
const filePath = path.join(__dirname, 'form.txt');
const fileData = fs.readFileSync(filePath, 'utf8');
const dataEntries = fileData.split();
console.log(dataEntries)
app.post("/login", function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const dataArray = JSON.parse(dataEntries);



//Function to check if email and password match
function checkEmailAndPassword(email1, password1) {
  return email1 === email && password1 === password;
}
//terate through each object in the array and check the email and password
dataArray.forEach((entry) => {
  const { email, password } = entry;
  //console.log({ email, password } );
  if (checkEmailAndPassword(email, password)) {
    console.log("Login successful!");
    req.session.isloggedin = true;
    return  res.redirect('/');
    } 
//else {
//     console.log("Invalid login credentials");
     //return res.redirect('/signup');
//     // Handle invalid credentials, redirect, or show an error message.
//     return;
res.render("login",{error:"invalid username or password"})
//   }
});
//res.render("login",{error:"invalid username or password"})
});



//signup
app.get('/signup',function(req,res){
    res.sendFile(__dirname+"/signup.html");
    
});

app.post("/signup",function(req,res){
    const bufferData = fs.readFileSync('form.txt');
    const email = req.body.email;
    // Convert the Buffer to a string
    const dataAsString = bufferData.toString();
    if (dataAsString.includes(email)) {
      res.redirect('/login');
    }
    else{
       const signupData=req.body;
       readALLsignupdata(signupData,writesignupdata,res);
       res.redirect("/");
   
    }

  
});



app.get('/script.js',function(req,res){
   //res.writeHead({'content-Type': 'application/javascript'})
   res.sendFile(__dirname+'/script.js')
    
}) 

app.post('/todo',function(req,res){
    const todoContent = req.body;
    readALLTodos(todoContent,writeTodo,res);
})

app.get('/todo-data',function(req,res){
    //res.sendFile(__dirname+"/todoViews/todo.html");
    fs.readFile('./treasure.txt',"utf-8",(err,data)=>{
        if(err){
            res.status(500).json(err);
            return;
        }
        res.status(200).json(data);

    })
})


//remove data from todolist
app.post('/remove-data',function(req,res){
    fs.readFile('./treasure.txt',"utf-8",function(err,data){
        if(err){
            res.status(500).json("internal error");
            return;
        }
        if(data.length===0)
        {
            res.status(500).json("the file is empty");
            return;
        }
        const todo = req.body;
        //console.log(todo)
        data = JSON.parse(data);
        let updated_data = [];
        //let removedTodo ;
        for(let i =0;i<data.length;i++){
            if(data[i].todoContent!=todo.todoContent)
                updated_data.push(data[i]);
            
        }
        //console.log(todo.a)
        
        fs.writeFile("./treasure.txt",JSON.stringify(updated_data),(err)=>{
            if(err){
                res.status(500).json("Internal error");
                return;
            }
            res.status(200).json(JSON.stringify(updated_data));
        })
    })
})



//update todo list
app.post('/update-status',function(req,res){
    
    fs.readFile('./treasure.txt','utf-8',(err,data)=>{
        if(err){
            res.status(500).json("Internal server error");
            return ;
        }
        const todo = req.body;
        console.log(todo);
        data = JSON.parse(data);
        let updated_data=[];
        for(let i=0;i<data.length;i++){
            if(data[i].todoContent===todo.todoContent){
                updated_data.push({
                    todoContent:data[i].todoContent,
                    priority:data[i].priority,
                    status:"accepted"
                })
            }
            else{
                updated_data.push(data[i]);
            }
        }
        fs.writeFile('./treasure.txt',JSON.stringify(updated_data),(err)=>{
            if(err){
                res.status(500).json("Internal server error");
                return ;
            }
            res.status(200).send(JSON.stringify(updated_data));
        })

    })

})



app.listen(3000,()=>{
    console.log('listening at the port 3000');
})





//function for code abstuction (read data and write data  for todolist)
function readALLTodos (todo,callback,res) {
    fs.readFile("./treasure.txt", "utf-8", function (err, data) {
    if (err) {
    callback(err,data,res);
    return;
    }
    if(!todo){
        res.status(200).json(JSON.stringify(data));
        return ;
    }
    if (data.length==0) {data = "[]"; 
    }
    try {
    data = JSON.parse(data); 
    data.push(todo);
    callback(null, data,res); } catch (err) { callback(err,data,res);
    }
    })
}

function writeTodo(err,data,res){
    if(err){
        res.status(500).json({message:"Internal server error"});
        return ;
    }
    fs.writeFile('./treasure.txt',JSON.stringify(data),(err)=>{
        if(err){
            res.status(500).json({message:"Internal server error"});
            return;
        }
        res.status(200).json("success");
    })

}



//function for code abstuction (read data and write data  for authentication and autreization)
function readALLsignupdata (signupData,callback,res) {
    fs.readFile("./form.txt", "utf-8", function (err, data) {
    if (err) {
    callback(err,data,res);
    return;
    }
    if(!signupData){
        res.status(200).json(JSON.stringify(data));
        return ;
    }
    if (data.length==0) {data = "[]"; 
    }
    try {
    data = JSON.parse(data); 
    data.push(signupData);
    callback(null, data,res); } catch (err) { callback(err,data,res);
    }
    })
}

function writesignupdata(err,data,res){
    if(err){
        res.status(500).json({message:"Internal server error"});
        return ;
    }
    fs.writeFile('./form.txt',JSON.stringify(data),(err)=>{
        if(err){
            res.status(500).json({message:"Internal server error"});
            return;
        }
        
    })

}