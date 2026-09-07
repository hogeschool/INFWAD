# Case: GameShelf

GameShelf is a board game club of about eighty members, most of them students. Twice a week the club opens the room it rents. By nine o'clock there is a box open on every one of the six tables, and not one of those boxes is the club's. The games belong to the members. A collection runs from five games to five hundred, and together the members hold more games than any shop in the city.

What the club does not hold is an overview. Who owns which game lives in memory and in a chat group. A member asks in the chat whether anyone has a certain game, three members answer, and a box leaves the room under an arm. One box has been with somebody's cousin since 2019, but that is all anyone knows. Game sessions are announced in the same chat, and twelve members sometimes arrive for a table that seats five. And a member who wants exactly the game another member no longer wants discovers that by accident, or never.

The club wants one application for all of it: the catalogue, the collections, the lending, the game sessions and the wishes. Money stays out of it. A trade in this club is one game for another, and nothing carries a price. Boxes change hands in person, at the club evenings, never by post.

## Members and games

Every member has an account, and everything below is done as a member. A few of them form the committee, which rents the room and opens it on club evenings. They are ordinary members with the committee's work on top.

The catalogue is the list of games the club knows. A game in the catalogue is one edition: a title, a publisher, a release year, a category, a minimum and a maximum number of players, and a playing time. The Dutch edition and the English edition of the same title are two separate games, because they are two different boxes. A game can have a picture of the box, when somebody has one. Any member adds a game the catalogue is missing, and every member reads the same catalogue. Everything else points at it: what members own, lend, wish for and bring to an evening is always a game from the catalogue.

## What the application has to do

### Collections and shelves

A collection answers the question the chat never could: which games does a member own, and what do they think of them. A collection holds one record per game the member owns. The record carries a status: not played yet, in progress, or played. In progress is for campaign games, played over weeks in a fixed group. The record also carries the number of plays, a rating, and a note for what the box does not say: the missing tokens, the house rules, the expansion packed inside.

A member sorts the collection onto shelves: named groups such as party games or games for two, each with a description. A shelf is public or it is not. A public shelf is what a member shows the club, and every collector can have a shelf the club does not see.

A member rates a game after playing it, not after reading about it. And the club has one old custom about campaigns: three at a time is the limit, and whoever wants to start a fourth finishes one first.

- A shelf that is not public is visible only to its owner, and a public shelf is visible to every member. A game on both is visible through the public one.
- Removing a game from the collection removes it from every shelf.
- The number of plays only increases, and the first play sets the status to played. A rating can be given only on a played record.
- A member has at most three records in progress at a time.

What has to be kept track of for a collection record: the owner, the game, its status, the number of plays, the rating and the note. For a shelf: the owner, its name, its description and whether it is public. And for each shelf: which games are on it.

### Lending

A member willing to lend a game lists the box for it: the physical box, with its condition. A box that survived ten years of play deserves a description. The listed boxes together are the lending list, and every member reads it. The lending list is not the collection. A member can own many games, be willing to lend only two, and lend a box that is not in their collection at all. A member who wants to play a game requests a box from the list. The request waits as pending until the owner decides, and an approved request becomes a loan when the box changes hands at a club evening. It comes back the same way, to the owner or, when the owner is not there that evening, to the committee.

The return day is agreed when the loan starts and lies within the club's maximum loan period. Whether a loan is late follows from that day, and nobody marks a loan late by hand. A borrower in the middle of a campaign can ask for more time, and the club allows one extension, within limits. The limits exist because of the cousin.

- A request is approved or rejected only by the owner of the box.
- Approving a request rejects the other pending requests on the same box.
- A box that is out on loan cannot be lent again before it has come back, and its return is recorded by the owner or by the committee.
- A loan can be extended once, and only while it is not yet late. The new return day stays within the maximum loan period, counted from the day the loan started.

What has to be kept track of for a box: the owner, the game and its condition. For a request: the box, the member asking, and its status: pending, approved or rejected. For a loan: the box, the borrower, the day it started, the agreed return day, whether it has been extended, and the day the box came back.

### Game sessions

Any member can host a game session, in the club room or at a kitchen table at home. The committee opens the club room, and a session there that the committee cannot open is cancelled. A session has a title, a date and time, a place, and a capacity (seats). Members sign up for it. While seats are free, a signup is a confirmed seat. Once they are full, a signup is waiting, and the waiting signups form the waiting list in the order they were made. A host plans for the big table in the club room, then finds that another session has that table the same evening, and lowers the capacity to what a small table seats. The last members to be confirmed are then the first to lose their seat.

A member who signs up can name the game they bring, from the catalogue. The table then knows what the evening looks like before it starts. A brought game needs enough players, and the group changes all week as members cancel and waiting signups are confirmed.

- A freed seat goes to the earliest waiting signup.
- When the host lowers the capacity below the number of confirmed seats, signups return to the waiting list until the number fits. The most recently confirmed go first.
- Only the host changes a session, and the host hands hosting over only to a member with a confirmed seat. Only the host or the committee cancels it.
- Whether a brought game fits the session follows from the number of confirmed seats and the game's minimum number of players. Nobody counts that by hand.

What has to be kept track of for a session: the host, its title, the date and time, the place, the capacity, and whether it has been cancelled. For a signup: the session, the member, whether it is confirmed or waiting, the moment it was made, and the brought game, when there is one.

### Wishlists and trading

A wishlist tells the club which games a member wants. A member lists a wanted game as a wishlist item, with a priority and a note: which edition, what condition is acceptable. Every wishlist is visible to every member, because the game one member has not opened in five years might be at the top of another member's list.

A member who has the wanted game makes an offer on the item, naming the game they ask in return. Nobody checks that the member really owns what they offer. The club works on trust, and a member can offer the same game to three members at once, though only one can receive it. An offer does not stay open forever. The club has a validity window, and whether an offer is still valid follows from the day it was made.

- An offer is accepted or rejected only by the member whose wishlist item it is. Only the member who made an offer cancels it, and only while it is open.
- An offer that is no longer valid cannot be accepted.
- Accepting an offer fulfils the wishlist item, and a fulfilled item takes no further offers. It also cancels every other open offer in which the same member offers the same game.

What has to be kept track of for a wishlist item: the owner, the game, its priority, the note, and whether it is fulfilled. For an offer: the wishlist item, the member who made it, the game asked in return, the day it was made, and its status: open, accepted, rejected or cancelled.
