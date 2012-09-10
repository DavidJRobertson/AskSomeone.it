//  *******
//  FEEL FREE TO OBLITERATE ALL OF THIS AND COMPLETELY RE-DO IT
//  *******	
	
var LANG_DEFAULT_ASK_TEXT = 'Ask any question...'
,	LANG_HINT_READY = 'Type a question below and hit <strong>Ask!</strong> - a random stranger will answer it!'
,	LANG_HINT_FINDING_PARTNER = 'Finding someone to answer your question...'
,	LANG_HINT_REPLY_PROMPT = 'Someone is now answering your question! <strong>You\'ll see it as soon as you answer theirs:</strong>'
,	LANG_DEFAULT_ANSWER_TEXT = 'Enter your answer...';
var app_state = 'init';

$(function() {
	// basic site functions
	// 'show the rules' button
	$('#show_the_rules').click(function() {
		$('#rules').slideToggle();
	});
	// main text input focusing/blurring (there's a jQuery plugin for this somewhere..)
	$('#input_textfield_ask').focus(function() {
		if ($(this).val() == LANG_DEFAULT_ASK_TEXT) {
			$(this).val('').removeClass('inactive');
		}	
	}).blur(function() {
		if($(this).val().trim() == '') {
			$(this).val(LANG_DEFAULT_ASK_TEXT).addClass('inactive');
		}
	});
	// DITTO FOR THE ANSWER ONE (TODO: COMBINE THESE SOMEHOW)
	$('#input_textfield_answer').focus(function() {
		if ($(this).val() == LANG_DEFAULT_ANSWER_TEXT) {
			$(this).val('').removeClass('inactive');
		}	
	}).blur(function() {
		if($(this).val().trim() == '') {
			$(this).val(LANG_DEFAULT_ANSWER_TEXT).addClass('inactive');
		}
	});	
	
	// on page load set the val
	$('#input_textfield_ask').val(LANG_DEFAULT_ASK_TEXT).addClass('inactive');
	$('#input_textfield_answer').val(LANG_DEFAULT_ANSWER_TEXT).addClass('inactive');
	
	// when the ASK button is pressed, submit the thing. christ i'm tired
	$('#input_button_ask').click(function() {
		handle_submit();
	});
	$('#input_textfield_ask').submit(function() {
		handle_submit();
	});
	
	$('#input_button_answer').click(function() {
		handle_answer_submit();
	});
	$('#input_textfield_answer').submit(function() {
		handle_answer_submit();
	});
	
	function handle_submit() {
		// slide away the input area thing
		$('#ask').slideUp(function() {
			$('#hint').html(LANG_HINT_FINDING_PARTNER);
			// simulating message to server...
			setTimeout(function() {
				// after a few seconds, a partner is found.
				found_partner();
			}, 2000);
		});
	}
	
	function handle_answer_submit() {
		$('#answer').slideUp();
	}
	function found_partner() {
		$('#answer').slideDown();
		$('#hint').html(LANG_HINT_REPLY_PROMPT);
	}
	
	console.log('Hello.');
});

