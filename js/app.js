(function() {

  var gameId =  document.querySelector('#gameId');
  var gameIdQuery = document.querySelector('#gameIdQuery');
  var tictactoe = document.querySelector('#tictactoe');
  var output = document.querySelector('#output');
  var whosTurn = document.getElementById('whosTurn');

  var gameid = '';
  var rand = (Math.random() * 9999).toFixed(0);

  gameid = (getGameId()) ? getGameId() : rand;

  gameId.textContent = gameid; 

  var oppoenetUrl = 'http://pubnub.github.io/api-guide-with-tictactoe/plain.html?id=' +gameid;
  gameIdQuery.innerHTML = '<a href="' +oppoenetUrl+ '" target="_blank">' +oppoenetUrl+ '</a>';

  var channel = 'tictactoe--'+ gameid;
  console.log('Channel: '+channel);

  var uuid = PUBNUB.uuid();
  
  var pubnub = PUBNUB.init({
      subscribe_key: 'your-sub-key',
      publish_key: 'your-pub-key',
      uuid: uuid
  });

  function displayOutput(m) {
    if(!m) return;
    return '<li><strong>' +  m.player + '</strong>: ' + m.position + '</li>';
  }

  /*
   * Tic-tac-toe
   * Based on http://jsfiddle.net/5wKfF/378/
   * Multiplayer feature with PubNub
   */


  var mySign = 'X'; 

  pubnub.subscribe({
    channel: channel,
    connect: play,
    presence: function(m) {
      console.log(m);

      if(m.uuid === uuid && m.action === 'join') {
        if(m.occupancy < 2) {
          whosTurn.textContent = 'Waiting for your opponent...'; 
        } else if(m.occupancy === 2) {
          mySign = 'O'; 
        } else if (m.occupancy > 2) {
          alert('This game already have two players!');
          tictactoe.className = 'disabled';
        }
      }

      if(m.occupancy === 2) {
        tictactoe.className = '';
        startNewGame();
      }

      document.getElementById('you').textContent = mySign;

      // For Presence Explained Section only
      if(document.querySelector('.presence')) {
        showPresenceExamples(m);
      }

    },
    callback: function(m) {
      // Display the move
      if(document.querySelector('#moves')) {
        var movesOutput = document.querySelector('#moves');
        movesOutput.innerHTML =  movesOutput.innerHTML + displayOutput(m);
      }

      // Display the move on the board
      var el = document.querySelector('[data-position="'+m.position+'"]');
      el.firstChild.nodeValue = m.player;
      console.log(el);

      checkGameStatus(m.player, el);

      // this is for Pub/Sub explained section.
      subscribed(m);
    },
  });

  function publishPosition(player, position) {
    pubnub.publish({
      channel: channel,
      message: {player: player, position: position},
      callback: function(m){
        console.log(m);
      }
    });
  }

  function getGameId(){
    // If the uRL comes with referral tracking queries from the URL
    if(window.location.search.substring(1).split('?')[0].split('=')[0] !== 'id') {
      return null;
    } else {
      return window.location.search.substring(1).split('?')[0].split('=')[1];
    }
  }

  var squares = [], 
    EMPTY = '\xA0',
    score,
    moves,
    turn = 'X',
    wins = [7, 56, 448, 73, 146, 292, 273, 84];

  function startNewGame() {
    var i;
    
    turn = 'X';
    score = {'X': 0, 'O': 0};
    moves = 0;
    for (i = 0; i < squares.length; i += 1) {
      squares[i].firstChild.nodeValue = EMPTY;
    }

    whosTurn.textContent = (turn === mySign) ? 'Your turn' : 'Your opponent\'s turn';
  }

  function win(score) {
    var i;
    for (i = 0; i < wins.length; i += 1) {
      if ((wins[i] & score) === wins[i]) {
          return true;
      }
    }
    return false;
  }

  function checkGameStatus(player, el) {
    moves += 1;
    console.log('Moves: '+moves);

    score[player] += el.indicator;
    console.log('Score for player, ' + player + ': ' + score[player]);

    if (win(score[turn])) {
      alert(turn + ' wins!');
    } else if (moves === 9) {
      alert('Boooo!');
    } else {
      turn = (turn === 'X') ? 'O' : 'X';
      whosTurn.textContent = (turn === mySign) ? 'Your turn' : 'Your opponent\'s turn';
    }
  }

  function set() { 

    if (turn !== mySign) return;

    if (this.firstChild.nodeValue !== EMPTY) return;
    
    publishPosition(mySign, this.dataset.position);

    // this is for Pub/Sub explained section. 
    toBePublished(mySign, this.dataset.position)

  }

  function play() {

    var board = document.createElement('table'),
      indicator = 1,
      i, j,
      row, cell;
    board.border = 1;

    for (i = 1; i < 4; i += 1) {
      row = document.createElement('tr');
      board.appendChild(row);
      for (j = 1; j < 4; j += 1) {
        cell = document.createElement('td');
        cell.dataset.position = i + '-' + j;
        cell.width = cell.height = 50;
        cell.align = cell.valign = 'center';
        cell.indicator = indicator;
        cell.onclick = set;
        cell.appendChild(document.createTextNode(''));
        row.appendChild(cell);
        squares.push(cell);
        indicator += indicator;

      }
    }

    tictactoe = document.getElementById('tictactoe');
    tictactoe.appendChild(board);
    startNewGame();
  }

  /*
   * Pub/Sub Explained section
   */

  function toBePublished(player, position) {
    if(!document.getElementById('pubPlayer')) return;

    document.getElementById('pubPlayer').textContent = '"' + player + '"';
    document.getElementById('pubPosition').textContent = '"' + position + '"';
  }
  function subscribed(m) {
    if(!document.getElementById('subPlayer')) return;

    document.getElementById('subPlayer').textContent = '"' + m.player + '"';
    document.getElementById('subPosition').textContent = '"' + m.position + '"';
  }
   
  /*
   * History API Explained section
   */

  if(document.getElementById('history')) {
    var showResultButton = document.getElementById('showResultButton');
    var select = document.getElementById('count');
    var reverseCheck = document.getElementById('reverse');
    var timeCheck = document.getElementById('time');
    var timeSelect = document.getElementById('timeSpan');

    timeCheck.addEventListener('change', function(e) {
      if(timeCheck.checked) {
        timeSelect.hidden = false;
        reverseCheck.disabled = true;
      } else {
        timeSelect.hidden = true;
        reverseCheck.disabled = false;
      }
    });

    showResultButton.addEventListener('click', function(e) {
      output.innerHTML = '';

      var count = select.options[select.selectedIndex].value;
      console.log('Getting '+count+ ' messages from history...');

      var isReversed = reverseCheck.checked;
      console.log('Reverse: '+isReversed);

      var timespan = (timeCheck.checked) ? timeSelect.value : null;

      getHistory(count, isReversed, timespan);
    }, false);
   }
  

  function getHistory(count, isReversed, timespan) {
    if(timespan) {
      
      var start = (new Date().getTime() - (timespan*60*1000)) * 10000;
      var end = new Date().getTime() * 10000;

      console.log(start, end)

      pubnub.history({
        channel: channel,
        count: count,
        start: start,
        end: end,
        callback: function(messages) {
          messages[0].forEach(function(m){ 
            console.log(m);
            output.innerHTML =  output.innerHTML + displayOutput(m);
          });
        }
      });

    } else {
      pubnub.history({
        channel: channel,
        count: count,
        reverse: isReversed,
        callback: function(messages) {
          messages[0].forEach(function(m){ 
            console.log(m);
            output.innerHTML =  output.innerHTML + displayOutput(m);
          });
        }
      });
    }

  }

  /*
   * Presence API Explained section
   */

  function showPresenceExamples(m) {
    showPresenceConsole(m);

    document.querySelector('.presence').classList.remove('two');
    document.querySelector('.presence strong').textContent = m.occupancy;
    document.querySelector('.presence span').textContent = 'player';
    
    if(m.occupancy > 1) {
      document.querySelector('.presence span').textContent = 'players';
      document.querySelector('.presence').classList.add('two');
    }
  }

  function showPresenceConsole(m) {
    var console = document.querySelector('#presenceConsole');
    var child = document.createElement('div');
    var text = document.createTextNode(JSON.stringify(m));
    child.appendChild(text);
    console.appendChild(child);
  }

  if(document.getElementById('quitButton')) {
    var quitButton = document.getElementById('quitButton');
    quitButton.addEventListener('click', function(e) {

      pubnub.unsubscribe({
        channel: channel,
        callback: function(m) {
          console.log(m);
          showPresenceConsole(m);
        }
      });
    });
  }

})();