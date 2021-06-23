// importing
import express from 'express';
import Mongoose from  'mongoose'
import Messages from './dbMessages.js'
import Pusher from 'pusher'
import cors from 'cors'
const app = express();

// app config
const port = process.env.port || 9101;

// configuring pusher

const pusher = new Pusher({
    appId: "1212670",
    key: "47e7002790ac41a10b6f",
    secret: "69dd7d08840416ee687f",
    cluster: "ap2",
    useTLS: true
  });

const db = Mongoose.connection;

db.once('open',()=>{
    console.log('Db connected');

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on("change",(change)=>{
        console.log("change has occurred");
        if(change.operationType=='insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('messages','inserted',{
                name : messageDetails.name,
                message: messageDetails.message,
                timestamp:messageDetails.timestamp,
                received: messageDetails.received
            })
        }
        else{
            console.log('Error triggering Pusher')
        }
    })
})


app.use(cors());

// DB config
const connection_url = "mongodb+srv://iamskk0502:iamskk0502@firstcluster.6271j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

Mongoose.connect(connection_url,{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
//api routes

app.get('/',(req,res)=>{
    console.log('this server is corrently in an active state');
    res.send('hello there');
})



app.get('/messages/sync',(req,res)=>{
    Messages.find((err,data)=>{
        if(err){
            res.status(500).send(err);
        }
        else{
            res.status(200).send(data);
        }
    })
})

app.post('/messages/new',(req,res)=>{
    const dbMessage = req.body;

    Messages.create(dbMessage,(err,data)=>{
        if(err){
            res.status(500).send(err);
        }
        else{
            res.status(201).send(data);
        }
    });

})


//listen

app.listen(port,()=>{
    console.log("server has been successfully created");
});

