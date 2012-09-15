//  *******
//  FEEL FREE TO OBLITERATE ALL OF THIS AND COMPLETELY RE-DO IT
//  *******	
	
var LANG_HINT_READY = 'Type a question below and hit <strong>Ask!</strong> - a random stranger will answer it!'
,	LANG_HINT_FINDING_PARTNER = 'Finding someone to answer your question...'
,	LANG_HINT_REPLY_PROMPT = 'Someone is now answering your question! <strong>You\'ll see it as soon as you answer theirs:</strong>'
, LANG_HINT_HURRY_ANSWER = 'The other person has answered. Hurry up!'
, LANG_HINT_WAITING_ANSWER = 'Waiting for your partner\'s answer...'
, LANG_HINT_RESULTS = 'Here\'s what they said:';
var app_state = 'init';

$(function() {
  var socket = io.connect();
  var question;
  var userid;
  var sentqa;
  var recievedqa;
  var sent = false;
  
  socket.on("connect", function() {
    if (localStorage) { //Favor localStorage, but fall back to using cookie. Who knows why
      if (localStorage.getItem("userid")) {
        userid = localStorage.getItem("userid");
        socket.emit("id", userid);
      } else {
        socket.emit("idrequest", "localStorage");
        socket.on("id", function(id) {
          userid = id;
          localStorage.setItem("userid", userid);
        });
      }
    } else {
      if ($.cookie("userid")) {
        userid = $.cookie("userid");
        $.cookie("userid", userid, { expires: 9999999 }); // Make sure cookie won't expire any time soon!
        socket.emit("id", userid);
      } else {
        socket.emit("idrequest", "cookie");
        socket.on("id", function(id) {
          userid = id;
          $.cookie("userid", userid, { expires: 9999999 });
        });
      }
    }
  });
  
  
	// basic site functions
	// 'show the rules' button
	$('#show_the_rules').click(function() {
		$('#rules').slideToggle();
	});

	
	// when the ASK button is pressed, submit the thing. christ I'm tired
	$('#input_button_ask').click(handle_question_submit);
	$('#input_textfield_ask').submit(handle_question_submit);
  $('form#ask').submit(function(e){ e.preventDefault(); });
	
	$('#input_button_answer').click(handle_answer_submit);
	$('#input_textfield_answer').submit(handle_answer_submit);
	$('form#answer').submit(function(e){ e.preventDefault() });
	
	var invitetimer;
	function handle_question_submit(event) {
	  event.preventDefault();
		// slide away the input area thing
		$('#ask').slideUp(function() {
			$('#hint').html(LANG_HINT_FINDING_PARTNER);
      socket.emit("question", $('#input_textfield_ask').val());
      invitetimer = setTimeout(function(){
        $('#invite_friends_pane').slideDown();
      }, 20000);
      
      
      socket.on("question", function (q) {
        clearTimeout(invitetimer);
        $('#invite_friends_pane').slideUp();
        
        question = JSON.parse(q);
        //$('#question-to-answer').text(question.text);
        
        $('#answer').slideDown();
    		$('#hint').html(LANG_HINT_REPLY_PROMPT + "<br />" + question.text);
 		    $('#input_textfield_answer').focus();
      });
		});
	}
	
	function handle_answer_submit(event) {
  	event.preventDefault();
		$('#answer').slideUp(function() {
      sentqa = {"question": question, "answer": {"text": $('#input_textfield_answer').val(), "answerer": {"userid": userid}}};
      var qapair = JSON.stringify(sentqa);
      socket.emit("answer", qapair);
      $('#hint').html(LANG_HINT_WAITING_ANSWER);
      
      if (sent) {
        display_results(sentqa, recievedqa);
      }
      sent = true;
		});
	}
	
	socket.on("answer", function(qapair) {
    recievedqa = JSON.parse(qapair);
    
    if (sent == false) {
      $('#hint').html(LANG_HINT_HURRY_ANSWER + "<br />" + question.text);
      sent = true;
    } else {
      display_results(sentqa, recievedqa);
    }
  });
  
  function display_results(sent, recieved) {
    $('#hint').html(LANG_HINT_RESULTS);
    $('#cell-yq').text(recieved.question.text);
    $('#cell-yqa').text(recieved.answer.text);
    $('#cell-tq').text(sent.question.text);
    $('#cell-tqa').text(sent.answer.text);
    $('#result_pane').slideDown();
    
    
    $(document).keypress(function(event) {
      if (((event.keyCode || event.which) == 13) && !event.shiftKey) {
        reset_app();
      }
    });
  }
  
  $('.reattemptbutton').click(reset_app);
  
  function reset_app() {
    $(document).off("keypress");
    $('#error_retry_button').slideUp();
    $('#result_pane').slideUp();
    $('#input_textfield_ask').val("");

    $('#input_textfield_answer').val("");
    
    sent = false;
    
    $('#ask').slideDown();
    $('#hint').html(LANG_HINT_READY);
    
    $('#input_textfield_ask').focus();
  }
  
	socket.on("error", function(errormessage) {
	  clearTimeout(invitetimer);
    $('#invite_friends_pane').slideUp();
	  
    $('#hint').html(errormessage);
    $('#error_retry_button').slideDown();
    
    // TODO: fix this...
    //$(document).keypress(function(event) {
    //  if (((event.keyCode || event.which) == 13) && !event.shiftKey) {
    //    reset_app();
    //  }
    //});
    
  });
  
  $('#input_textfield_ask').focus();
});

