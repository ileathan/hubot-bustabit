# hubot-bustabit

Hubot bustabit integration which supports single or multi person betting.
Future versions will support betting with personal funds along with the 
current community fund only mode.

For this script to work you must keep a browser logged in to bustabit.com and you must follow 
the directions in [`bustabit_script.js`](bustabit_script.js)** (copy paste it to bustabit.com).

See [`src/bustabit.js`](src/bustabit.js) for full documentation.

## Installation

Once you have insalled Hubot, in hubot's root directory, run:

`npm install hubot-bustabit --save`

Then add **hubot-bustabit** to your `external-scripts.json`:

```json
["hubot-bustabit"]
```

## Sample Ussage

```
user1>> bet 100 1.01
hubot>> Betting 100 bit(s) next game. [Cashout @ x1.01]
hubot>> Bet placed, you may rebet.
hubot>> You won 101.00 bit(s). Total 743

```
