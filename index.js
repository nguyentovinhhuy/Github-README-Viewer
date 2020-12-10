const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

app.use('/main.js', function(req,res){
    res.sendFile(path.join(__dirname+'/main.js'));
})
app.use('/', function(req,res){
    res.sendFile(path.join(__dirname+'/main.html'));
});

const server = http.createServer(app);
const port = 3000;

server.listen(port);
console.log('Server listening on port ' + port);