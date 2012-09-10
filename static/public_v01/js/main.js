var LANG_DEFAULT_ASK_TEXT = 'Ask any question...'
,	LANG_HINT_READY = 'Type a question below and hit <strong>Ask!</strong> - a random stranger will answer it!'
,	LANG_HINT_FINDING_PARTNER = 'Finding someone to answer your question...'
,	LANG_HINT_REPLY_PROMPT = 'To get the answer to your question, <strong>answer your partner\'s question now!</strong>';
var app_state = 'init';

$(function() {
	// basic site functions
	// 'show the rules' button
	$('#show_the_rules').click(function() {
		$('#rules').toggle();
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
	// on page load set the val
	$('#main_text').val(LANG_DEFAULT_ASK_TEXT).addClass('inactive');
	
	// when the ASK button is pressed, submit the thing. christ i'm tired
	$('#input_button_ask').click(function() {
		handle_submit();
	});
	$('#input_textfield_ask').submit(function() {
		handle_submit();
	});
	
	function handle_submit() {
		// slide away the input area thing
		$('#input_wrapper_ask').slideUp(function() {
			$('#hint').html(LANG_HINT_FINDING_PARTNER);
			setTimeout(function() {
				$('#hint').html(LANG_HINT_REPLY_PROMPT).addClass('important');
			}, 2000);
		});
	}
	console.log('Hello.');
});

