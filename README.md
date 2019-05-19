# Introduction #
## Overview ##
This is an online multiplayer web game based on the borad game - love letter. The number of players is 2~4. The server will automatically conduct the following action, dealing cards, casting card effects, determining the end of a game. The rule is same as the origin one with some optional extension. This program is currently running on <a href="https://tragic-dilemma-loveletter.herokuapp.com/">Heroku</a>.
## Implementation ##
This is a little practice of Javascript, CSS and HTML. This project contains a server and an interative webpage. The server was built using Node.js with express and websocket modules. The game page is written in a html file, which consist of three main div, intro, hall, and game div with the visiability controlled by Javascript. The client communicates with the server by websocket.
# API #
## Socket.io ##
### To Server ###
|Event Name	|Addition Data Format	|Detail															|
|:--------------|:----------------------|:----------------------------------------------------------------------------------------------------------------------|
|newUser	|user\_name		|String.														|
|disconnect	|null			|															|
|roomList	|null			|															|
|createRoom	|room\_number		|Integer between 1000 and 9999.												|
|joinRoom	|room\_number		|Integer between 1000 and 9999.												|
|leaveRoom	|null			|															|
|startGame	|{card7, card8, cardX}	|card7, card8, cardX are booleans that if extented rules are enabled.							|
|abortGame	|null			|															|
|discardCard	|{card, target, extra}	|Integer between 1 and 8. Integer of the index of target. Object of extra data.						|
### To Client ###
|Event Name	|Addition Data Format				|Detail														|
|:--------------|:----------------------------------------------|:--------------------------------------------------------------------------------------------------------------|
|toIntro	|null						|														|
|nameConfirmed	|null						|														|
|roomList	|{roomNumber, player, creator, started}[]	|(Array of room)Integer between 1000 and 9999. Integer of number of players in the room. String. Boolean.	|
|joinFailed	|error\_msg					|String.													|
|joinRoom	|{key, player\_name[]}				|Integer of client's index in the room.										|
|leaveRoom	|room\_closed					|Boolean that if the room would be closed.									|
|msg		|{msg, isHL}					|String. Boolean that if the message is highlighted.								|
|init		|isCreatir					|Boolean.													|
|gameSetting	|{card7, card8, cardX}				|Boolean that if optional rules are enabled.									|
|drawCard	|{card[]}					|Array of integer.												|
|peek		|{card, target}					|Integer of the card the target player has. String.								|
|eliminated	|null						|														|
