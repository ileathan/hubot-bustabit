    // When you log in to bustabit.com select the "AUTO" tab, then at the
    // bottom right click the "autobet" button and select "custom"
    // select everything inside the text area and delete it
    // copy paste the entire contents of this text into that text field and click run
    // Your Mubot should now have bustabit integration.

    // INIT
    var bet = {};
    const SERVER = 'http://localhost:8080/';

    // CHECK HUBOT SERVER FOR BET
    function CheckBet () {
      xmlhttp = new XMLHttpRequest();
      xmlhttp.open("GET", SERVER + '/bustabit/getbet', false);
      xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          bet = JSON.parse(this.responseText);
          if (bet.size) {
            engine.placeBet(bet.size*100, parseInt(bet.ratio*100), false);
          }
        }
      };
      xmlhttp.send();
    }

    // UPDATE THE HUBOT SERVER WITH INFORMATION
    function Finished(params) {
      var http = new XMLHttpRequest();
      http.open("POST", SERVER + '/bustabit/finished', true);
      http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      http.send(params);
    }

    engine.on('game_crash', function(data) {
      if (engine.getEngine().playerInfo[engine.getUsername()]) {
        var win = false;
        if (engine.getEngine().playerInfo[engine.getUsername()].stopped_at) win = true;
        Finished('game_crash=' + data.game_crash + '&balance=' + engine.getBalance() + '&win=' + win);
      }
      CheckBet();
    });

    engine.on('cashed_out', function(resp) {
      if (resp.username == engine.getUsername()) {
        Finished('win=true&balance=' + engine.getBalance())
      }
    });
