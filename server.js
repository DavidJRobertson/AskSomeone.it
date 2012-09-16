var redis    = require("redis"),
    rc       = redis.createClient();
var app      = require("http").createServer(handler);
var io       = require("socket.io").listen(app);
var check    = require('validator').check,
    sanitize = require('validator').sanitize;
var static   = require("node-static");
var util     = require("util");
var fs       = require("fs");


var file = new(static.Server)('static', {
  cache: 600
});


io.set('log level', 1);

rc.on("error", function (err) {
  console.log("Error " + err);
});


rc.setnx("useridmax", "0"); // Used for assigning user ids. If first run, set to 0.

if (process.env.NODE_ENV == "production") {
  app.listen(80, '95.154.250.172');
} else {
  app.listen(8080);
}

function handler (req, res){
  req.addListener('end', function() {
    file.serve(req, res, function(err, result) {
      if (err) {
        //console.error('Error serving %s - %s', req.url, err.message);
        if (err.status === 404 || err.status === 500) {
          res.writeHead(302, {'Location': '/'});
          res.end();
          //file.serveFile(util.format('/%d.html', err.status), err.status, {}, req, res);
        } else {
          res.writeHead(err.status, err.headers);
          res.end();
        }
      } else {
        //console.log('%s - %s', req.url, res.message);
      }
    });
  });
}


io.sockets.on('connection', function (socket){
  var userid;
  socket.on("id", function(id){
    try {
      userid = sanitize(id).toInt();
      check(userid).len(1, 20);
      console.log("New connection from user " + userid);
      socket.on("adminnotify", function() {
        rc.sadd("adminids", userid);
      });
    
    } catch (e) {
      socket.emit("error", "An internal error has occurred :( Please try again.");
    }
  });
  
  
  
  socket.on("idrequest", function() {
    try {
    rc.incr("useridmax", function(error, n) {
      userid = n;
      socket.emit("id", userid);
      console.log("New ID request, issued id = " + userid);
    });
    } catch (e) {
      socket.emit("error", "An internal error occurred. Please refresh the page (not button below!)");
      console.log("Error: " + e.message);
    }
  });
  
  socket.on("question", function (data){
    try {
      var qtext = sanitize(data).xss();
      check(qtext).len(5, 140).notEmpty().not('Ask any question...').notContains("http://").notContains("https://");
      rc.lpush("questionqueue", JSON.stringify({"text": qtext, "asker": {"userid": userid, "socketid": socket.id}}));
      console.log("Question received from user " + userid + " question = " + qtext);
    } catch (e) {
      console.log("Invalid question submitted by user " + userid + ", question = " + qtext);
      socket.emit("error", "That doesn't look like a valid question to us. Please try another :P<br /> Remember, URLs aren't allowed, and your question needs to be 5 to 140 characters long.");
    }
  });
  
  socket.on("answer", function(qapair) {
    qa = JSON.parse(qapair);
  
    console.log("Received question/answer pair: " + qapair);
      
    io.sockets.sockets[qa.question.asker.socketid].emit("answer", qapair);
  });
  
  socket.on("answertimeout", function(rq){
    try {
      console.log("Recieved answer timeout notification for " + rq);
      var q = JSON.parse(rq);
      io.sockets.sockets[q.asker.socketid].emit("error", "You took too long to answer that question and the other user gave up waiting :( Next time, try being a little quicker :)");
    } catch (e) {
      // do nothing
    }
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
          
          
            rc.sismember("adminids", q1.asker.userid, function(error, q1adm) {
              rc.sismember("adminids", q2.asker.userid, function(error, q2adm) {
                if (q1adm == 1 && q2adm == 1) {
                  // If both admins
                  // Put one back on each end of queue
                  
                  rc.rpush("questionqueue", q1r);
                  rc.lpush("questionqueue", q2r);
                } else {
                  io.sockets.sockets[q1.asker.socketid].emit("question", q2r);
                  io.sockets.sockets[q2.asker.socketid].emit("question", q1r); 
                  console.log("Pairing user " + q1.asker.userid + " with user " + q2.asker.userid);
                }  
                
              });
            });
           
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
