# PubNub APIs Explained with Tic-Tac-Toe

## How to Play this Multi-player Tic-Tac-Toe

**Tic-Tac-Toe** is for two players, X and O, who take turns marking the spaces in a 3×3 grid. The player who succeeds in placing three of their marks in a horizontal, vertical, or diagonal row wins the game.
      
This is a realtime multi-player Tic-Tac-Toe on web- You and your opponent need to play together on separate browsers. You can just open an another browser window to act as your own opponent. Your opponent needs to use the same Game ID by passing it in the URL as a query string.

First, go to: [http://pubnub.github.io/api-guide-with-tictactoe](http://pubnub.github.io/api-guide-with-tictactoe).

Then start from *Publish and Subscribe*.

Once you go to one of the API guide page, you will see a Tic-Tac-Toe board with *Game ID*. You will need to open an another browser tab or window with the same URL with a quesry string, for example, when your game ID is 1234, your "opponent" has to access the same URL as yours with **?id=1234** appended in the end.

At the each section, you will learn how PubNub features work as you play the game.


![Tic-Tac-Toe](https://raw.githubusercontent.com/pubnub/api-guide-with-tictactoe/master/images/tictactoe.gif "Tic-Tac-Toe")