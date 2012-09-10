var redis  = require("redis"),
    rc     = redis.createClient();
var app    = require("http").createServer(handler);
var io     = require("socket.io").listen(app);
var check = require('validator').check,
    sanitize = require('validator').sanitize;
var static = require("node-static");
var util   = require("util");

var webroot = './static';
var file = new(static.Server)(webroot, {
  cache: 600
});

rc.on("error", function (err) {
  console.log("Error " + err);
});

app.listen(8080);

function handler (req, res){
  req.addListener('end', function() {
    file.serve(req, res, function(err, result) {
      if (err) {
        console.error('Error serving %s - %s', req.url, err.message);
        if (err.status === 404 || err.status === 500) {
          file.serveFile(util.format('/%d.html', err.status), err.status, {}, req, res);
        } else {
          res.writeHead(err.status, err.headers);
          res.end();
        }
      } else {
        console.log('%s - %s', req.url, res.message);
      }
    });
  });
}


io.sockets.on('connection', function (socket){
  var userid;
  socket.on("id", function(id){
    try {
    userid = sanitize(id).toInt();
    check(userid).len(5, 20);
    console.log("New connection from user " + userid);
    } catch (e) {
      socket.emit("error", "An internal error has occurred :( Please try again.");
    }
  });
  
  socket.on("idrequest", function(){
    userid = Math.floor(Math.random() * 324135143); // TODO: make this better
    socket.emit("id", userid);
    console.log("New ID request, issued id = " + userid);
  });
  
  socket.on("question", function (data){
    try {
      var qtext = sanitize(data).xss();
      check(qtext).len(5, 100).notEmpty().not('Ask any question...').notContains("http://").notContains("https://");
      rc.lpush("questionqueue", JSON.stringify({"text": qtext, "asker": {"userid": userid, "socketid": socket.id}}));
      console.log("Quesion received from user " + userid + " question = " + qtext);
    } catch (e) {
      console.log("Invalid question submitted by user " + userid + ", question = " + qtext);
      socket.emit("error", "That doesn't look like a valid question to us. Please try another :P<br /> Remember, URLs aren't allowed, and your question needs to be 5 to 100 characters long.");
    }
  });
  
  socket.on("answer", function(qapair) {
    qa = JSON.parse(qapair);
  
    console.log("Received question/answer pair: " + qapair);
      
    io.sockets.sockets[qa.question.asker.socketid].emit("answer", qapair);
  });
});


setInterval(processQueue, 200);

function processQueue(){
  try {
  rc.llen("questionqueue", function(error, length){
    if (length > 1) {
      rc.rpop("questionqueue", function(error, q1r){
        rc.rpop("questionqueue", function(error, q2r){
          q1 = JSON.parse(q1r);
          q2 = JSON.parse(q2r);
          if (io.sockets.sockets[q1.asker.socketid] === undefined) {
            rc.rpush("questionqueue", q2r);
          } else if (io.sockets.sockets[q2.asker.socketid] === undefined) {
            rc.rpush("questionqueue", q1r);
          } else {
            io.sockets.sockets[q1.asker.socketid].emit("question", q2r);
            io.sockets.sockets[q2.asker.socketid].emit("question", q1r); 
            console.log("Pairing user " + q1.asker.userid + " with user " + q2.asker.userid);
          }
        });
      });
    }
  });
  } catch (e) {
    console.log("Error: " + e.message);
  } 
}

process.addListener("uncaughtException", function (err) {
    console.log("Uncaught exception: " + err);
    console.trace();
});
