var charCodes = {
	space: 32,
	nbsp: 160
}

var dict = {
	wordsWith: function (letters) {
		console.log(letters);
		function containsOnly(word, letters) {
			for (var i = 0; i < word.length; i++) {
				if (!letters.contains(word[i])) return false;
			}
			return true;
		}
		results = [];
		for (var i = 0; i < dict.words.length; i++) {
			var word = dict.words[i];
			if (containsOnly(word, letters)) {
				results.push(word);
			}
		}
		return results;
	}
};

var lessonsData =  [
	"asdfjkl", "gh", "ei", "ru", "mv", "nb", "c,t", "yo", "w.", "px", "qz",
	"AS","JK","DF",'L'
	];
var lessons = {
	//data: ["asdfjkl;", "et", "on", "as", "id", "pg", ".c", ",r", ";l", "yf", "km", "jw", "qv", "'z", "xb"],
	//data: ["asdfjkl", "gha", "ei", "ru", "mv", "nb", "c,t", "yo", "w.", "px", "qz" ],
	data: lessonsData,

	// Examples: load(0.5); load(14); load(1);
	load: function(num) {
		// All letters up to this lesson.
		var cumulative = [];

		var index = Math.floor(num);

		if (num % 1 == 0) {
			cumulative = lessons.data[index].split("");
		} else {
			for (var i = 0; i < index + 1; i++) {
				cumulative = cumulative.concat(lessons.data[i].split(""));
			}
		}

		var punctuation = [" "];
		$.each(['.',',',';'], function (i, ch) {
			if (cumulative.contains(ch)) {
				punctuation = punctuation.concat([ch + ' ', ' ']);
			}
		});

		var name = lessons.data[index];
		var title = '<span>'+ num + '</span>|' + name;
		return {
			letters: cumulative,
			punctuation: punctuation,
			words: dict.wordsWith(cumulative),
			title: title
		};
	}
};
function getKeyPos(key) {
	//var curData = cur.next().html();
	//document.title = curData;	
	for (i = 0; i < key_color.length; i++) { 
		for (j = 0; j < key_color[i].length; j++) {
			if (key_color[i][j] == key){
				
				//document.title += newColor+ ' i:'+i+' j:'+j;
				return [i,j];
			}
		}
	}
	return null;
}

function getColorIndex(ij) {
	return colors[ ij[0] ][ ij[1] ];
}

function addFingerTip(ij) {
	$('#tut_' + ij[0] + '_' + ij[1]).addClass('noticed');
}	

function removeFingerTip(ij) {
	if (ij) 
		$('#tut_' + ij[0] + '_' + ij[1]).removeClass('noticed');
}	

var lessonId = 0;
var lastIj = null;

function loadLesson(num) {
	
	lessonId = num;
	var lesson = lessons.load(num);
	$('#stats-title').html(lesson.title);
	$('#stats-errors').text('');
	console.log(lesson);

	var sentence = '';
	for (var i = 0; i < 8; i++) {
		sentence += lesson.words.random() + lesson.punctuation.random();
	}

	var el = $('#current-lesson');
	el.children().remove();
	$.each(sentence, function (i, ch) {
		// We use nbsp here so that the last character on the line is shown.
		if (ch == " ") ch = String.fromCharCode(charCodes.nbsp);
		$("<span>").text(ch).appendTo(el);
	});
	el.children(':first-child').addClass('current');
	removeFingerTip(lastIj);
	lastIj = getKeyPos(el.children(':first-child').html());
	//document.title = 'i,j:'+ii +'~' +jj
	var lastColor = getColorIndex(lastIj);
	var $hands = $('#hands');
	//$hands.addClass('finger'+lastColor);
	$hands.attr('class', 'finger'+lastColor);
	//document.title += ' #'+lastColor
	addFingerTip(lastIj);
	
	var prevts = 0;
	var total = 0;
	var errors = 0;
	//var lastColor = '0';
	$('body').off('keypress.dtt');
	$('body').on('keypress.dtt', function (ev) {
		  $('#tablet-text-box').val('');
			$('#last-charPressed').html(ev.which || ev.keyCode);
		if (prevts == 0) prevts = new Date();

		var typed = String.fromCharCode(ev.which == charCodes.space ? charCodes.nbsp : ev.which);
		var cur = $('#current-lesson .current');
		if (cur.text() != typed) {
			if (!cur.hasClass('failed')) {
				errors++;
				cur.addClass('failed');
				percent = errors / sentence.length * 100;
				$('#stats-errors').text(percent.toFixed(0) + '%');
			}
			return;
		}

		var newts = new Date();
		var delta = newts.getTime() - prevts.getTime();
		prevts = newts;
		if (delta > 10000) delta = 0; // Ignore long pauses.
		total += delta;

		if (cur.next().length == 0) {
			var avg = total / (sentence.length / 5);
			var wpm = 60000 / avg;
			$('#stats-speed').html('<span>&#9654;</span>'+ wpm.toFixed(0) + ' <span>wpm</span>');
			console.log(total, avg, errors);
			if (wpm < 30 || errors / sentence.length > 0.05) return loadLesson(num);
			else return loadLesson(num + 0.5);
		} else {
			//cur.removeClass('current').next().addClass('current');
			var curData = cur.next().html();
			//document.title = curData;
			/*var newColor = '0';
			for (i = 0; i < key_color.length; i++) { 
				for (j = 0; j < key_color[i].length; j++) {
					if (key_color[i][j] == curData){
						newColor = 'color' + colors[i][j];
						//document.title += newColor+ ' i:'+i+' j:'+j;
						break;
					}
				}
			}*/
			var ij = getKeyPos(curData);
			//document.title = 'i,j:'+ii +'~' +jj
			//document.title = curData;
			var newColor = getColorIndex(ij);
			$hands.attr('class', 'finger'+newColor);
			
			removeFingerTip(lastIj);
			addFingerTip(ij);
			lastIj = ij;
			
			cur.removeClass('current '+lastColor).addClass('done').next().addClass('current '+newColor);
			lastColor = newColor;
		}
	});
	
}
/*
$(document).ready(function() {
	//loadLesson(0);
});
*/