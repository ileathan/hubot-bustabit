    // When you log in to bustabit.com select the "AUTO" tab, then at the
    // bottom right click the "autobet" button and select "custom"
    // select everything inside the text area and delete it
    // copy paste the entire contents of this text into that text field and click run
    // Your Mubot should now have bustabit integration.

    // INIT
    const SERVER = 'http://localhost:8080/';
    const USER   = engine.getUsername();
    var won = false; // Keep track of whether we won or lost.

    // Update the server with game information.
    function updateServer(params) {
      var http = new XMLHttpRequest();
      http.open("POST", SERVER + 'bustabit/finished', true);
      http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      http.send(params) 
    }

    // Check for win/lose on game end.
    engine.on('game_crash', function(data) {
      if(engine.getEngine().playerInfo.USER) {
        updateServer('game_crash=' + data.game_crash + '&balance=' + engine.getBalance() + '&win=' + won)
      }
      CheckBet()
    });

    // User won.
    engine.on('cashed_out', function(resp) {
      if(resp.username === USER) {
        won = true;
        updateServer('win=true&balance='+engine.getBalance())
      }
    });

    // Check the server for new bets.
    function CheckBet () {
      xmlhttp = new XMLHttpRequest();
      xmlhttp.open("GET", SERVER + 'bustabit/getbet', true);
      xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          bet = JSON.parse(this.responseText);
          if(bet.size) {
            engine.placeBet(bet.size*100, parseInt(bet.ratio*100), false);
            won = false;
          }
        }
      };
      xmlhttp.send() 
    }