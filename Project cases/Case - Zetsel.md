# Case: Zetsel

Zetsel is a coffee club of about sixty members, most of them students, who take their coffee seriously. On the day an order arrives, a kilo of beans waits on the table in the club room. Members come in between lectures to weigh their share and take it home. The club orders together because a small roaster sells nothing under a kilo. A kilo is also more than one person drinks while it is still at its best. The three Comandante hand grinders and the scales are the club's as well, and they go from member to member, because nobody wants to buy their own.

Today it all runs on a spreadsheet and two group chats. An order starts as a message, shares are claimed in scattered replies, and by the closing date nobody is certain who wanted what. Bags are split and disappear into backpacks, and six weeks later somebody proudly brews coffee that is long past its best. A tasting in the back room is announced in the chat, and whoever misses the message scrolls back through all the replies and the animated gifs to find the date. One of the scales has been in somebody's kitchen for over a year, but three members each name a different somebody. The club wants one application for all of it.

One thing stays outside that application: money. The club settles cost among its members separately, and the application records grams and bags, never an amount of money.

## Members and beans

Every member has an account, and everything below is done as a member. Three members form the committee, which deals with the roasters and holds the key to the back room. They are ordinary members with the committee's work on top.

The club keeps a list of beans it has ordered or wants to order. A bean is one coffee from one roaster: the roaster's name, the bean's name, its origin and its roast level. It also carries a freshness window: the number of weeks it stays at its best after it arrives. Two beans are the same bean only when the roaster and the name are both the same. The roaster is a name in the list and nothing more. Roasters never sign in, and the application never contacts one.

## What the application has to do

### Group orders

An order starts with one member and one bean. That member, the starter, sets the minimum in grams, which is what the roaster requires, and a closing date. Other members add a share in grams, and can change it while the order runs. The total so far is visible to everyone, which is exactly what the group chat could never show. On the closing date the total decides. An order that reaches the minimum is placed, and the beans arrive at the club room a week or so later. An order that does not reach it fails, and about half of them do. Somebody comes back from a weekend in Berlin convinced the whole club needs the bean they had there, and starts an order. On the closing date it holds their own two hundred grams and nothing else. Now and then the committee cancels an open order itself, because the roaster no longer has the bean.

- A share can be added or changed only while the order is open.
- On the closing date, an order is placed only when its shares together reach the minimum, and it fails otherwise.
- Only the member who started an order, or the committee, can cancel it, and only while it is open.

What has to be kept track of for an order: the bean, the member who started it, the minimum in grams, the closing date, and its status: open, placed, failed or cancelled. For a share: the member and the amount in grams.

### The shelf

The shelf answers the question the spreadsheet never could: who has what, and since when. When a placed order is split at the club room, every member records the bags they took home: which bean, how many grams, and the day of arrival. A bag is fresh while it is inside the bean's freshness window, and past its best after that. A member checks it before brewing, and again before joining the next order, to see how much is still at home. A member marks a bag finished when it is empty, and its brewing notes stay.

Bags also move. A member leaves for a semester abroad, or admits that the roast that tastes of burnt toast was a mistake, and offers a bag to another member. Nothing changes until the other member says yes.

And members brew, in kitchens that look more like laboratories. One bag is poured over in a V60 on Monday and pulled as espresso on Tuesday. On Wednesday it sits in a jar in the fridge for sixteen hours, and the three resulting cups have nothing in common except the bean. A brewing note on a bag records one attempt: the method, the dose, the grind, and the result. Over time the notes become the club's memory of every bean it has ordered. The note a member is proudest of for a bean is their reference brew, the recipe they give to anyone who asks.

- Whether a bag is still fresh follows from its day of arrival and the bean's freshness window. Nobody marks a bag fresh or past its best by hand.
- A bag offered to another member moves to that member only when the receiving member accepts the offer.
- A new brewing note on a bag can be written only by the member who holds the bag.
- A member marks at most one note per bean as their reference brew, and marking a new one removes the mark from the previous one.

What has to be kept track of for a bag: the bean, the member holding it, the grams, the day of arrival, and whether it is finished. For an offer: the bag, the two members, and its status. For a brewing note: the bag, the writer, the method, the dose, the grind, the result, and whether it is the reference brew.

### Tastings

Every few months, and more often in winter, a member hosts a tasting in the back room. The committee holds the key to the back room, and a tasting without the room is cancelled. The host picks the line-up: the beans that will be tasted, and the position of each in the pouring. A line-up is usually four or five beans, and the host pours them without saying which is which. Members sign up for a seat. The room is small and the club is not, so a tasting has a capacity set by the host. While seats are free, a signup is a confirmed seat. Once they are full, a signup is waiting, and the waiting signups form the waiting list in the order they were made.

At the table, every member with a confirmed seat gives every bean in the line-up a score, with a short remark beside the number. The average per bean is what the evening produces: the club's verdict, bean by bean, and the strongest argument for or against ordering it again.

- Signups above the capacity go on a waiting list, and a freed seat goes to the earliest waiting signup.
- Only the host changes the line-up, and only the host or the committee cancels the tasting.
- A score can be entered only by a member with a confirmed seat, and only for a bean in the line-up.
- The average score per bean at a tasting follows from the scores at the table, and nobody enters it by hand.

What has to be kept track of for a tasting: the host, the date, the capacity, and whether it has been cancelled. For the line-up: the beans and the position of each. For a signup: the member, whether it is confirmed or waiting, and the moment it was made. For a score: who gave it, which bean in the line-up it is for, the points, and the remark.

### The grinders and the scales

The club owns three Comandante hand grinders and two scales, bought together years ago and better than anything a member would get for themselves. Both scales need calibrating now and then. They go from member to member: whoever holds an item uses it until the next member's turn. A grinder that stays too long is collected by the committee and handed on. Wanting an item means requesting it, and the requests form the queue. The club has a maximum holding period, so that a grinder does not spend a whole season in one kitchen.

- An item has one holder at a time, and it moves to the next member only when that member accepts it. The holder hands the item on, and past the maximum holding period the committee can do it too.
- Who is next for an item follows from when the requests were made: the oldest open request first.
- A member holding an item past the maximum holding period cannot request another item.

What has to be kept track of for an item: its name, its kind and its condition. For a hold: the item, the member, the day it started and the day it ended. For a request: the item, the member, and the moment it was made.
