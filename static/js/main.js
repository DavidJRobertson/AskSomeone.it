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
    
  if (localStorage) {
    if (localStorage.getItem("userid")) {
      userid = localStorage.getItem("userid");
      socket.emit("id", userid);
    } else {
      socket.emit("idrequest", "ls");
      socket.on("id", function(id) {
        userid = id;
        localStorage.setItem("userid", userid);
      });
    }
  }

  
  
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
	
	function handle_question_submit(event) {
	  event.preventDefault();
		// slide away the input area thing
		$('#ask').slideUp(function() {
			$('#hint').html(LANG_HINT_FINDING_PARTNER);
      socket.emit("question", $('#input_textfield_ask').val());
      socket.on("question", function (q) {
        question = JSON.parse(q);
        //$('#question-to-answer').text(question.text);
        
        $('#answer').slideDown();
    		$('#hint').html(LANG_HINT_REPLY_PROMPT + "<br />" + question.text);
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
        displayResults(sentqa, recievedqa);
      }
      sent = true;
		});
	}
	
  function displayResults(sent, recieved) {
    $('#hint').html(LANG_HINT_RESULTS);
    $('#cell-yq').text(recieved.question.text);
    $('#cell-yqa').text(recieved.answer.text);
    $('#cell-tq').text(sent.question.text);
    $('#cell-tqa').text(sent.answer.text);
    $('#result_pane').slideDown();
  }
	
	
	
	socket.on("answer", function(qapair) {
    recievedqa = JSON.parse(qapair);
    
    
    if (sent == false) {
      $('#hint').html(LANG_HINT_HURRY_ANSWER + "<br />" + question.text);
      sent = true;
    } else {
      displayResults(sentqa, recievedqa);
    }
  });

	socket.on("error", function(errormessage) {
    $('#hint').text(errormessage);
  });
});

