# [Fidchell](https://en.wikipedia.org/wiki/Fidchell)

I'm building this based on the rules I learned years ago from a guy at the [Highland Festival](http://www.almahighlandfestival.com/) in Alma, MI.  In fact, I think I purchased [this exact game](https://historicgames.com/xcart/fidchell.html).  At least, the cloth "board" and the pieces (complete with faux sheep's knuckle for the King piece) are all the same.

Fidchell seems to be related to the [Tafl family](https://en.wikipedia.org/wiki/Tafl_games) of games.  It looks like a cross between Brandubh and Tablut (sort of), while still being played on a 7x7 board.  The rules are fairly simple, and most of them seem to be related to how you're **not** allowed to move a piece.

## Rules

Attacker side (the white pieces that start along the perimeter of the board) goes first.  You can move as many spaces as you like, as long as you don't land on another piece, don't move through other pieces, and don't move diagonally.  

A player captures their opponent's piece by trapping it between two pieces.  This works for either the Attacker or the Defender.  The King doesn't help in captures (though I've coded for a variant called the Armed King, in which the King **can** help capture), but he does have the advantage of being the only piece to be able to sit on the throne without being sacrificed.  He can move around, and in fact his moving is required in order for the Defender to win the game.  The King must make it to either the edge of the board or the corners, depending on the players' choice (well, I haven't made a selectable option yet, only a code option, so right now the game is corners win and armed king).

You can't land on the throne unless you're capturing a piece, in which case the piece being captured AND the piece landing on the throne are both sacrificed.

The Attackers win by boxing in the King on all four sides.  Or on three sides, in the case that the game is corners win (since the king might be on an edge space).

## Comments

My first goal here is to build a working board, complete with moving pieces and basic rule enforcement.  I'm doing this partly because I like this game, and partly because I'm teaching myself React.  I'd like to be able to pull this up on a phone or a tablet and play it against someone else in-person.

If that all works out, my second goal would be to build a multiplayer version that can be played over a network.  I don't see this as being terribly difficult - it would be a matter of sharing state and verifying that neither side is cheating.  A JWT of some sort should suffice for the state sharing.

If **that** all works out, I might attempt to build a way to play against the CPU.  I figure with all the other pieces in place, it shouldn't be a huge task to design a simple algorithm to play the game.  There are only 3 types of pieces, and there are only 49 spaces on the board; it's computationally much simpler than chess.