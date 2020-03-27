var STAGE_WIDTH = 800;
var STAGE_HEIGHT = 600;
var IMG_WIDTH = 100;
var IMG_HEIGHT = 100;
var PUZZLE_WIDTH = 10;
var PUZZLE_HEIGHT = 10;
var PIECE_WIDTH = 44;
var PIECE_HEIGHT = 44;
var PIECE_BORDER = 2;
var PUZZLE_URL = "";
var SNAP_TOLERANCE = 10;
var attachedPieces = {}; //Stores true/false values for which pieces are attached.
var attachedDeltas = {}; //Stores the pos deltas of the pieces attached to the currently dragged piece

$(document).ready(setup);

function setup() {
    $('.build').mousedown(gatherInput);
	gatherInput();
}

function gatherInput() {
    PUZZLE_WIDTH = parseInt($('input[name=width]').val(), 10);
    PUZZLE_HEIGHT = parseInt($('input[name=height]').val(), 10);
	PUZZLE_URL = $('input[name=url]').val();
	if (PUZZLE_WIDTH > 25) {
		alert("ERROR: Maximum width is 25");
		PUZZLE_WIDTH = 25;
	}
	if (PUZZLE_HEIGHT > 25) {
		alert("ERROR: Maximum height is 25");
		PUZZLE_HEIGHT = 25;
	}
	generateGame();
}

function generateGame() {
	//Start by calculating the image size, and any resizing that needs to be done.
	var img = new Image();
	img.onload = function() {
		var ratio = 0;
		IMG_WIDTH = img.width;
		IMG_HEIGHT = img.height;
		
		if (IMG_WIDTH > STAGE_WIDTH) {
			ratio = STAGE_WIDTH / IMG_WIDTH;
			IMG_WIDTH = STAGE_WIDTH;
			IMG_HEIGHT = IMG_HEIGHT * ratio;
		}
		
		if (IMG_HEIGHT > STAGE_HEIGHT) {
			ratio = STAGE_HEIGHT / IMG_HEIGHT;
			IMG_HEIGHT = STAGE_HEIGHT;
			IMG_WIDTH = IMG_WIDTH * ratio;
		}
		
		PIECE_WIDTH = IMG_WIDTH / PUZZLE_WIDTH;
		PIECE_HEIGHT = IMG_HEIGHT / PUZZLE_HEIGHT;
		
		console.log('IMAGE SIZE =', img.width, 'x', img.height, 'RESIZED =', IMG_WIDTH, 'x', IMG_HEIGHT);
		console.log('PIECE SIZE =', PIECE_WIDTH, PIECE_HEIGHT);
		
		resetGame();
		setupPieces();
	}
	img.src = PUZZLE_URL; //Invoke the 'onload' function
}

function resetGame() {
	$('.container').empty();
	$('.container').width(STAGE_WIDTH);
	$('.container').height(STAGE_HEIGHT);
	
	attachedPieces = {};
	processOnPuzzle(function (x, y) {
		var id = 'piece-' + x + '-' + y;
		attachedPieces[id] = {
			top: false,
			right: false,
			bottom: false,
			left: false
		}
	});
}

function setupPieces() {
    var container = $('.container');
	processOnPuzzle(function (x, y) {
		var pieceDiv = '<div id="piece-' + x + '-' + y + '" class="piece"></div>';
		container.append(pieceDiv);
		var piece = $('#piece-' + x + '-' + y);
		piece.draggable({
			start: onStartDrag,
			drag: onDrag,
			stop: onStopDrag,
			stack: '.piece',
			containment: container
		});
		piece.css('left', Math.floor(Math.random() * (STAGE_WIDTH - PIECE_WIDTH)));
		piece.css('top', Math.floor(Math.random() * (STAGE_HEIGHT - PIECE_HEIGHT)));
		piece.css('width', PIECE_WIDTH - PIECE_BORDER*2);
		piece.css('height', PIECE_HEIGHT - PIECE_BORDER*2);
		piece.css('background-image', 'url("' + PUZZLE_URL + '")');
		piece.css('background-size', IMG_WIDTH + 'px ' + IMG_HEIGHT + 'px');
		piece.css('background-position', '-' + (x*PIECE_WIDTH) + 'px -' + (y*PIECE_HEIGHT) + 'px');
	});
}

function getXPos(btn) {
	var id = btn.attr('id');
	return parseInt(id.split('-')[1]);
}

function getYPos(btn) {
	var id = btn.attr('id');
	return parseInt(id.split('-')[2]);
}

function onStartDrag(event, ui) {
	//Add the 'attached' class to all pieces attached to this piece.
	attachNeighbour(ui.helper, ui.position);
	
	$('.attached').draggable( "option", "zIndex", ui.helper.zIndex() );
}

function attachNeighbour(piece, pos) {
	var dragID = piece.attr('id');
	var x = getXPos(piece);
	var y = getYPos(piece);
	
	piece.addClass('attached');
	attachedDeltas[dragID] = { dX: (pos.left - piece.position().left), dY: (pos.top - piece.position().top) };
	
	if (attachedPieces[dragID].top) {
		console.log(dragID, 'top is attached');
		var neighbour = $('#piece-' + x + '-' + (y-1));
		if (neighbour.length && !neighbour.hasClass('attached')) {
			attachNeighbour(neighbour, pos);
		}
	}
	if (attachedPieces[dragID].bottom) {
		console.log(dragID, 'bottom is attached');
		var neighbour = $('#piece-' + x + '-' + (y+1));
		if (neighbour.length && !neighbour.hasClass('attached')) {
			attachNeighbour(neighbour, pos);
		}
	}
	if (attachedPieces[dragID].right) {
		console.log(dragID, 'right is attached');
		var neighbour = $('#piece-' + (x+1) + '-' + y);
		if (neighbour.length && !neighbour.hasClass('attached')) {
			attachNeighbour(neighbour, pos);
		}
	}
	if (attachedPieces[dragID].left) {
		console.log(dragID, 'left is attached');
		var neighbour = $('#piece-' + (x-1) + '-' + y);
		if (neighbour.length && !neighbour.hasClass('attached')) {
			attachNeighbour(neighbour, pos);
		}
	}
}

function onDrag(event, ui) {
	moveNeighbours(ui.helper, ui.position);
	$('.moved').removeClass('moved');
}

function moveNeighbours(piece, pos) {
	var dragID = piece.attr('id');
	var x = getXPos(piece);
	var y = getYPos(piece);
	
	if (dragID in attachedDeltas) {
		piece.addClass('moved');
		piece.css('left', pos.left - attachedDeltas[dragID].dX);
		piece.css('top', pos.top - attachedDeltas[dragID].dY);
	}
	
	if (attachedPieces[dragID].top) {
		var neighbour = $('#piece-' + x + '-' + (y-1));
		if (neighbour.length && !neighbour.hasClass('moved')) {
			moveNeighbours(neighbour, pos);
		}
	}
	if (attachedPieces[dragID].bottom) {
		var neighbour = $('#piece-' + x + '-' + (y+1));
		if (neighbour.length && !neighbour.hasClass('moved')) {
			moveNeighbours(neighbour, pos);
		}
	}
	if (attachedPieces[dragID].right) {
		var neighbour = $('#piece-' + (x+1) + '-' + y);
		if (neighbour.length && !neighbour.hasClass('moved')) {
			moveNeighbours(neighbour, pos);
		}
	}
	if (attachedPieces[dragID].left) {
		var neighbour = $('#piece-' + (x-1) + '-' + y);
		if (neighbour.length && !neighbour.hasClass('moved')) {
			moveNeighbours(neighbour, pos);
		}
	}
}

function onStopDrag(event, ui) {
	//Before we're done, snap the positions of all the pieces if need be.
	$('.attached').each( function(index) {
		snapAllNeighbours($(this));
	});
	
	//Now that we've stopped dragging, remove the 'attached' class
	$('.attached').removeClass('attached');
	attachedDeltas = [];
}

function snapAllNeighbours(piece) {
	var dragID = piece.attr('id');
	var x = getXPos(piece);
	var y = getYPos(piece);
	var neighbour;
	
	neighbour = $('#piece-' + x + '-' + (y-1));
	if (neighbour.length) {
		snapNeighbour(piece, neighbour);
	}
	neighbour = $('#piece-' + x + '-' + (y+1));
	if (neighbour.length) {
		snapNeighbour(piece, neighbour);
	}
	neighbour = $('#piece-' + (x+1) + '-' + y);
	if (neighbour.length) {
		snapNeighbour(piece, neighbour);
	}
	neighbour = $('#piece-' + (x-1) + '-' + y);
	if (neighbour.length) {
		snapNeighbour(piece, neighbour);
	}
}

function snapNeighbour(piece, neighbour) {
	var curPiece = piece;
	//Currently dragging piece.
	var cGridX = getXPos(curPiece);
	var cGridY = getYPos(curPiece);
	var cPos = curPiece.position();
	//Neighboring piece
	var nGridX = getXPos(neighbour);
	var nGridY = getYPos(neighbour);
	var nPos = neighbour.position();
	
	if (cGridX == nGridX) {
		if (cGridY == nGridY - 1) {
			var xDiff = Math.abs(cPos.left - nPos.left);
			var yDiff = Math.abs((cPos.top + PIECE_HEIGHT) - nPos.top);
			if (0 < xDiff && xDiff < SNAP_TOLERANCE && 
				0 < yDiff && yDiff < SNAP_TOLERANCE) {
				curPiece.css('left', nPos.left);
				curPiece.css('top', nPos.top - PIECE_HEIGHT);
				attachedPieces[curPiece.attr('id')].bottom = true;
				attachedPieces[neighbour.attr('id')].top = true;
				snapAllNeighbours(neighbour);
			}
		} else if (cGridY == nGridY + 1) {
			var xDiff = Math.abs(cPos.left - nPos.left);
			var yDiff = Math.abs(cPos.top - (nPos.top + PIECE_HEIGHT));
			if (0 < xDiff && xDiff < SNAP_TOLERANCE && 
				0 < yDiff && yDiff < SNAP_TOLERANCE) {
				curPiece.css('left', nPos.left);
				curPiece.css('top', nPos.top + PIECE_HEIGHT);
				attachedPieces[curPiece.attr('id')].top = true;
				attachedPieces[neighbour.attr('id')].bottom = true;
				snapAllNeighbours(neighbour);
			}
		}
	} else if (cGridY == nGridY) {
		if (cGridX == nGridX - 1) {
			var xDiff = Math.abs((cPos.left + PIECE_WIDTH) - nPos.left);
			var yDiff = Math.abs(cPos.top - nPos.top);
			if (0 < xDiff && xDiff < SNAP_TOLERANCE && 
				0 < yDiff && yDiff < SNAP_TOLERANCE) {
				curPiece.css('top', nPos.top);
				curPiece.css('left', nPos.left - PIECE_WIDTH);
				attachedPieces[curPiece.attr('id')].right = true;
				attachedPieces[neighbour.attr('id')].left = true;
				snapAllNeighbours(neighbour);
			}
		} else if (cGridX == nGridX + 1) {
			var xDiff = Math.abs(cPos.left - (nPos.left + PIECE_WIDTH));
			var yDiff = Math.abs(cPos.top - nPos.top);
			if (0 < xDiff && xDiff < SNAP_TOLERANCE && 
				0 < yDiff && yDiff < SNAP_TOLERANCE) {
				curPiece.css('top', nPos.top);
				curPiece.css('left', nPos.left + PIECE_WIDTH);
				attachedPieces[curPiece.attr('id')].left = true;
				attachedPieces[neighbour.attr('id')].right = true;
				snapAllNeighbours(neighbour);
			}
		}
	}
}

function onTouchStartDrag(ev) {
	//Add the 'attached' class to all pieces attached to this piece.
	var pos = { top: ev.gesture.pageX, left: ev.gesture.pageY }
	attachNeighbour($(this), pos);
	
	$('.attached').draggable( "option", "zIndex", $(this).zIndex() );
}
function onTouchDrag(ev) {
	var pos = { top: ev.gesture.pageX, left: ev.gesture.pageY }
	moveNeighbours($(this), pos);
	$('.moved').removeClass('moved');
}
function onTouchStopDrag(ev) {
	//Before we're done, snap the positions of all the pieces if need be.
	$('.attached').each( function(index) {
		snapAllNeighbours($(this));
	});
	
	//Now that we've stopped dragging, remove the 'attached' class
	$('.attached').removeClass('attached');
	attachedDeltas = [];
}

function processOnPuzzle(someFunc) {
	for (var x=0; x < PUZZLE_WIDTH; ++x) {
        for (var y=0; y < PUZZLE_HEIGHT; ++y) {
			someFunc(x, y);
		}
	}
}

function processOnNeighbourPieces(piece, someFunc) {
	var centerX = getXPos(piece);
	var centerY = getYPos(piece);
	for (x=centerX-1; x <= centerX+1; ++x) {
		for (y=centerY-1; y <= centerY+1; ++y) {
			//Ignore out of bounds puzzle pieces.
			if (x >= 0 && x < PUZZLE_WIDTH && y >= 0 && y < PUZZLE_HEIGHT) {
				//Only process neighbours to the top/bottom/left/right. No corner neighbours.
				if (centerX == x || centerY == y) {
					someFunc(x, y);
				}
			}
		}
	}
}