# Description:
#   Hubot bustabit integration
# 
# Dependencies:
#   a browser somewhere must be logged in to a funded bustabit.com account
# 
# Commands:
#   bet <amount_in_bits> <cash_out_ratio>        -   Creates a bet, and notifies you when you can rebet.
# 
# Author:
#   leathan
# 


# requires

request = require('request');

# INIT

balance      =  0
lastbet      =  {}
bet          =  {}
room         =  ''

# MAIN

module.exports = (robot) ->
  robot.hear /^bet (\d+) (\d+\.?\d{0,2})$/i, (msg) ->
    room = msg.message.room
    bet =
      size: msg.match[1]
      ratio: msg.match[2]
    if Boolean bet.size
      msg.send "(Overiding last bet) Betting #{bet.size} bit(s) on next game. [Cashout @ x#{bet.ratio}]"
    else
      msg.send "Betting #{bet.size} bit(s) on next game. [Cashout @ x#{bet.ratio}]"

# WEB

  robot.router.post '/info', (req, res) ->
    res.setHeader 'content-type', 'application/json'
    res.setHeader 'Access-Control-Allow-Origin', '*'
    res.setHeader 'Access-Control-Request-Method', 'POST, OPTIONS'
    res.setHeader 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'
    info   = if req.body.payload? then JSON.parse req.body.payload else req.body
    if info.win and !info.game_crash
      balance = parseFloat(info.balance / 100).toFixed(2)
      robot.messageRoom room, "You won #{parseFloat(lastbet.size * lastbet.ratio - lastbet.size).toFixed(2)} bit(s)! Total: #{balance}"
    if info.game_crash
      balance = parseFloat(info.balance / 100).toFixed(2)
      info.game_crash = info.game_crash.slice(0, info.game_crash.length-2) + '.' + info.game_crash.slice(info.game_crash.length-2);
      if info.win == 'false' then robot.messageRoom room, "You lost #{lastbet.size} bit(s)! Total: #{balance} [Crash @ x#{info.game_crash}]"
    if info.player_bet
      robot.messageRoom room, "Bet placed, you may rebet."
    res.send 'OK'

  robot.router.get '/bet', (req, res) ->
    res.setHeader 'content-type', 'application/json'
    res.setHeader 'Access-Control-Allow-Origin', '*'
    res.setHeader 'Access-Control-Request-Method', 'POST, OPTIONS'
    res.setHeader 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'
    res.json bet
    lastbet = bet
    bet = {}
