// Description:
//   Hubot bustabit integration
//
// Dependencies:
//   a browser somewhere must be logged in to a funded bustabit.com account
//
// Commands:
//   bet <amount_in_bits> <cash_out_ratio>        -   Creates a bet, and adds it to the que.
//   Mubot view bets                              -   Responds with the bet que in JSON.
//   Mubot bets                                   -   Returns the bet que length.
//
// Author:
//   leathan
//

// REQ
request = require('request');

// INIT
var lastbet   = {};
var betQue    = [];
var room      = '';
var allBets   = [];
var balance   = 100;  // Set this value to your balane, otherwise it will auto set after first bet.
var first_bet = true; // keep track of the first bet incase the user forgets to set his balance above.
const MAX_BET = 10;   // the max bet as a percentage of blance

// MAIN
module.exports = bot => {
  bot.brain.on('loaded', () => {
    if(!bot.brain.data.allBets) bot.brain.data.allBets = [];
    allBets = bot.brain.data.allBets
  })
  bot.respond(/bets$/i, r => {
    if(betQue.length) r.send("The bet que is " + betQue.length + " long.");
    else r.send("The bet que is empty.")
  })
  bot.respond(/view bets$/i, r => {
    if(betQue.length) r.send(JSON.stringify(betQue));
    else r.send("The bet que is empty.")
  })
  bot.hear(/^bet (\d+) (\d+\.?\d{0,2})$/i, r => {
    if(first_bet) {
      first_bet = false;
    } else if(r.match[1] / balance > MAX_BET / 100) {
      return r.send("Sorry you cannot bet more than " + MAX_BET + "% of your balance.")
    }
    room = r.message.room;
    allBets.push({
      amount: r.match[1],
      ratio: r.match[2],
      id: bot.brain.data.allBets.length,
      user: r.message.user.name,
      profit: 0
    });
    if(betQue.length) {
      r.send("Adding bet to que with ID#" + allBets.length + ". [" + r.match[1] + " bit(s) / Cashout @ x" + r.match[2] + "]")
    } else {
      r.send("Betting " + r.match[1] + " bit(s) on next game. [Cashout @ x" + r.match[2] + "]")
    }
    // Push last allBet (most recent desired bet) into the que.
    betQue.push(allBets[allBets.length-1])
  })

  // WEB CONFIG
  bot.router.use('/bustabit', (req, res, next) => {
    res.setHeader('content-type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next()
  })

  // WEB API
  bot.router.post('/bustabit/finished', (req, res) => {
    var info = JSON.parse(req.body.payload);
    if(info.win && !info.game_crash) {
      allBets[lastbet.id].profit = parseFloat(lastbet.amount * lastbet.ratio - lastbet.amount).toFixed(2);
      allBets.balance = parseFloat(info.balance / 100).toFixed(2);
      bot.messageRoom(room, lastbet.user + ", you won " + allBets[lastbet.id].profit + " bit(s)! Total: " + allBets.balance)
    }
    if(info.game_crash) {
      allBets.balance = parseFloat(info.balance / 100).toFixed(2);
      // Insert a decimal before the last 2 digits.
      info.game_crash = info.game_crash.slice(0, info.game_crash.length - 2) + '.' + info.game_crash.slice(info.game_crash.length - 2);
      if(info.win === 'false') {
        bot.messageRoom(room, lastbet.user + ", you lost " + lastbet.amount + " bit(s)! Total: " + allBets.balance + " [Crash @ x" + info.game_crash + "]");
        bot.brain.data.allBets[lastbet.id].profit = -lastbet.amount
      }
    }
    res.send('Ok.')
  })
  bot.router.get('/bustabit/getbet', (req, res) => {
    res.json(lastbet = betQue.shift())
  })
};

