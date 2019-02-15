var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server); 
var fs = require('fs');
var Player = require('./js/Player').Player;
var Card = require('./js/Card').Card;

app.use(express.static(__dirname));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

server.listen(process.env.PORT || 3000, function(){
	console.log('listening');
});

var socketList = [];
var roomList = [];

io.on('connection',function(socket){
	
	if(socketList[socket.id] == null)io.to(socket.id).emit('toIntro', {});
	
	socket.on('newUser',function(data){
		for(var key in socketList)if(socketList[key] != null)if(socketList[key].name == data){
			io.to(socket.id).emit('nameConfirmed', false);
			return;
		}
		socket.name = data;
		io.to(socket.id).emit('nameConfirmed', true);
		socketList[socket.id] = socket;
		console.log("<Lobby>\t%s logged in.", data);
	});
	
	socket.on('disconnect',function(data){
		if(socketList[socket.id] != null){
			console.log("<Lobby>\t%s logged out.", socketList[socket.id].name);
			leaveRoom(socket.id);
		}
		socketList[socket.id] = null;
	});
	
	socket.on('roomList',function(data){
		var temp = [];
		for(var key in roomList)if(roomList[key] != null)temp.push({roomNumber : key, player : roomList[key].players.length,
							creator : socketList[roomList[key].creator].name, started : roomList[key].started});
		io.to(socket.id).emit('roomList', temp);
	});
	
	socket.on('createRoom',function(){
		var MAX_VALUE = 9999;
		var MIN_VALUE = 1000;
		var num;
		do{
			num = rndNum(MIN_VALUE, MAX_VALUE);
		}while(roomList[num] != null);
		createRoom(num, socket.id);
		joinRoom(num, socket.id);
		var temp = [];
		for(var key in roomList)if(roomList[key] != null)temp.push({roomNumber : key, player : roomList[key].players.length,
							creator : socketList[roomList[key].creator].name, started : roomList[key].started});
		io.emit('roomList', temp);
		console.log("<Room>\tRoom %d created.", num);
	});
	
	socket.on('joinRoom',function(data){
		if(roomList[data] == null)createRoom(data, socket.id);
		joinRoom(data, socket.id);
		console.log("<Room>\t%s joined Room %d.", socket.name, data);
	});
	
	socket.on('leaveRoom',function(data){
		leaveRoom(socket.id);
		console.log("<Room>\t%s left Room.", socket.name);
	});
	
	socket.on('startGame',function(data){
		if(roomList[socket.room].players.length == 1){
			sendMessage(socket.room, "人數不足", false);
			return;
		}
		roomList[socket.room].started = true;
		sendMessage(socket.room, "----------", true);
		sendMessage(socket.room, "GAME START", true);
		console.log("<Game>\tRoom %d started game.", socket.room);
		io.in(socket.room).emit('gameSetting', {card7 : data.card7, card8 : data.card8, cardX : data.cardX});
		roomList[socket.room].core = new GameCore(socket.room, data.card7, data.card8, data.cardX);
		roomList[socket.room].core.init();
		roomList[socket.room].core.setCard(roomList[socket.room].players.length);
		roomList[socket.room].core.dealCard();
		roomList[socket.room].core.drawCard(roomList[socket.room].core.order);
	});
	
	socket.on('abortGame',function(data){
		console.log("<Game>\tRoom %d aborted game.", socket.room);
		roomList[socket.room].started = false;
		init_GamePage(socket.room);
		roomList[socket.room].core = null;
	});
	
	socket.on('discardCard',function(data){
		console.log("<Game>\t<%d>\t%s discarded %d.", socket.room, socket.name, data.card);
		roomList[socket.room].core.discardCard(roomList[socket.room].core.order, data.card, data.target, data.extra);
		if(roomList[socket.room].core.hasWinner()){
			sendMessage(socket.room, "GAME OVER!", true);
			roomList[socket.room].core.getWinner();
			roomList[socket.room].started = false;
			sendMessage(socket.room, "隱藏的底牌為 : " + roomList[socket.room].core.bottomCard.getDisplayName(),true);
			init_GamePage(socket.room);
			sendMessage(socket.room, "----------", true);
		}else{
			roomList[socket.room].core.nextPlayer();
			roomList[socket.room].core.drawCard(roomList[socket.room].core.order);
		}
	});
});

function Room(id){
	this.creator = id;
	this.started = false;
	this.players = [];
};

function rndNum(min, max){
	return Math.floor(Math.random()*(max-min+1)+min);
}

function createRoom(num, id){
	if(roomList[num] == null){
		var room = new Room(id);
		roomList[num] = room;
	}
};

function joinRoom(num, id){
	if(roomList[num] != null && socketList[id] != null){
		if(roomList[num].players.length >= 4){
			io.to(id).emit('joinFailed',"房間已滿");
			return;
		}
		if(roomList[num].started){
			io.to(id).emit('joinFailed',"遊戲已開始");
			return;
		}
		roomList[num].players.push(id);
		socketList[id].room = num;
		socketList[id].join(num);
		broadcastPlayerList(num);
		var playerNames = [];
		for(key in roomList[num].players)playerNames.push(socketList[roomList[num].players[key]].name);
		var dataKey = parseInt(playerNames.length) - 1;
		var temp = {roomNumber : num, creator : socketList[roomList[num].creator].name, players : playerNames, key : null};
		io.in(num).emit('joinRoom', temp);
		temp = {roomNumber : num, creator : socketList[roomList[num].creator].name, players : playerNames, key : dataKey};
		io.to(id).emit('joinRoom',temp);
	}else io.to(id).emit('joinFailed',"房間不存在");
};

function leaveRoom(id){
	if(socketList[id].room != null){
		if(roomList[socketList[id].room] != null){
			var index = roomList[socketList[id].room].players.indexOf(id);
			roomList[socketList[id].room].players.splice(index, 1);
			broadcastPlayerList(socketList[id].room);
			socketList[id].leave(socketList[id].room);
			roomList[socketList[id].room].core = null;
			roomList[socketList[id].room].started = false;
			if(roomList[socketList[id].room].creator == id)removeRoom(socketList[id].room);
			io.to(id).emit('leaveRoom',false);
			socketList[id].room = null;
		}
	}
};

function removeRoom(num){
	io.in(num).emit('leaveRoom', true);
	for(key in roomList[num].players){
		socketList[roomList[num].players[key]].room = null;
		socketList[roomList[num].players[key]].leave(num);
	}
	roomList[num] = null;
	var temp = [];
	for(var key in roomList)if(roomList[key] != null)temp.push({roomNumber : key, player : roomList[key].players.length,
							creator : socketList[roomList[key].creator].name, started : roomList[key].started});
	io.emit('roomList', temp);
}

function broadcastPlayerList(num){
	var playerNames = [];
	for(key in roomList[num].players)playerNames.push(socketList[roomList[num].players[key]].name);
	temp = {roomNumber : num, creator : socketList[roomList[num].creator].name, players : playerNames};
	io.in(num).emit('joinRoom', temp);
}

function init_GamePage(num){
	io.in(num).emit('init',false);
	io.to(roomList[num].creator).emit('init',true);
}

function sendMessage(num, msg, isHL){
	var data = {msg : msg, isHL : isHL};
	io.in(num).emit('msg', data);
}

function usedCard(num, card){
	io.in(num).emit('usedCard', {card : card});
}

function GameCore(num, card7, card8, cardX){
	this.room = roomList[num];
	this.roomNum = num;
	this.players = [];
	this.playerCount = 0;
	this.cardPool = [];
	this.playerAlive = 0;
	this.order = 0;
	this.card7 = card7;
	this.card8 = card8;
	this.cardX = cardX;
	this.bottomCard = new Card(0, this.card7, this.card8);
	
	this.init = function(){
		this.playerCount = this.room.players.length;
		this.playerAlive = this.playerCount;
		this.order = rndNum(0, this.playerAlive - 1);
		this.players = [];
		for(var i = 0; i < this.playerCount; i++){
			var player = new Player();
			this.players.push(player);
		}
		if(this.cardX)this.cardPool = [1,1,1,1,1,2,2,3,3,4,4,5,5,6,7,8,9];
		else this.cardPool = [1,1,1,1,1,2,2,3,3,4,4,5,5,6,7,8];
	}
	
	this.init();
	
	this.drawCard = function(order){
		if(this.cardPool.length == 0)return;
		var index = rndNum(0, this.cardPool.length - 1);
		var card = this.cardPool[index];
		this.cardPool.splice(index, 1);
		console.log("<Game>\t<%d>\t%s drew %d.", this.roomNum, socketList[roomList[this.roomNum].players[order]].name, card);
		if(this.cardPool.length <= 3)sendMessage(this.roomNum, "剩下" + this.cardPool.length + "張卡", true);
		this.players[order].addCard(card);
		var aliveList = [];
		if(this.players[order].handcards.length == 2)for(key in this.players)if(this.players[key] != null)aliveList.push(socketList[this.room.players[key]].name);
		io.to(this.room.players[order]).emit('drawCard', {card : this.players[order].handcards, alives : aliveList});
	}
	
	this.setCard = function(player){
		var index = rndNum(0, this.cardPool.length - 1);
		this.bottomCard = new Card(this.cardPool[index], this.card7, this.card8);
		this.cardPool.splice(index, 1);
		if(player == 2){
			for(var i = 0; i < 3; i++){
				var ind = rndNum(0, this.cardPool.length - 1);
				var cd = this.cardPool[ind];
				var t = new Card(cd, this.card7, this.card8);
				this.cardPool.splice(ind, 1);
				sendMessage(this.roomNum, "抽出底牌 : " + t.getDisplayName(),  true);
				usedCard(this.roomNum, cd);
			}
		}
	}
	
	this.dealCard = function(){
		for(key in this.players)this.drawCard(key);
	}
	
	this.hasWinner = function(){
		return(this.cardPool.length == 0 || this.playerAlive == 1);
	}
	
	this.getWinner = function(){
		var winners = [];
		if(this.playerAlive == 1){
			for(key in this.players)if(this.players[key] != null){
				winners.push(key);
				var temp = new Card(this.players[key].handcards[0], this.card7, this.card8);
				sendMessage(this.roomNum, socketList[this.room.players[key]].name + "的底牌是" + temp.getDisplayName(), false);
				usedCard(this.roomNum, temp.number);
			}
			
		}else{
			sendMessage(this.roomNum, "牌庫空了!", true);
			for(key in this.players)if(this.players[key] != null)if(this.players[key].handcards[0] == 8 && card8 == 2){
				sendMessage(this.roomNum, socketList[this.room.players[key]].name + "在結束時仍持有火焰公主 [8]", false);
				this.eliminate(key);
			}
			for(key in this.players){
				if(this.players[key] == null);
				else if(winners[0] == null)winners.push(key);
				else if(this.players[winners[0]].handcards[0] == this.players[key].handcards[0])winners.push(key);
				else if(this.players[winners[0]].handcards[0] < this.players[key].handcards[0]){
					winners = [];
					winners.push(key);
				}
				if(this.players[key] != null){
					var temp = new Card(this.players[key].handcards[0], this.card7, this.card8);
					sendMessage(this.roomNum, socketList[this.room.players[key]].name + "的底牌是" + temp.getDisplayName(), false);
					usedCard(this.roomNum, temp.number);
				}
			}
		}
		if(winners.length == 1)sendMessage(this.roomNum, "贏家是" + socketList[this.room.players[winners[0]]].name, true);
		else {
			var str = "";
			for(key in winners)str +=  socketList[this.room.players[winners[key]]].name + ",";
			sendMessage(this.roomNum, "贏家是" + str, true);
		}
	}
	
	this.nextPlayer = function(){
		do{
			this.order = (this.order + 1) % this.playerCount;
		}while(this.players[this.order] == null);
	}
	
	this.eliminate = function(order){
		this.playerAlive--;
		sendMessage(this.roomNum, socketList[this.room.players[order]].name + "被淘汰了!", true);
		var temp = new Card(this.players[order].handcards[0], this.card7, this.card8);
		sendMessage(this.roomNum, socketList[this.room.players[order]].name + "的底牌是" + temp.getDisplayName(), false);
		usedCard(this.roomNum, temp.number);
		io.to(this.room.players[order]).emit('eliminated',{});
		this.players[order] = null;
	}
	
	this.discardCard = function(caster, card, target, extra){
		this.players[caster].isProtected = false;
		usedCard(this.roomNum, card);
		for(key in this.players[caster].handcards)if(this.players[caster].handcards[key] == card){
			this.players[caster].handcards.splice(key, 1);
			break;
		}
		if(target != null && this.players[target].isProtected){
			sendMessage(this.roomNum, socketList[this.room.players[caster]].name + "對" + socketList[this.room.players[target]].name
							+ "使用了" + new Card(card, this.card7, this.card8).getDisplayName(), false);
			sendMessage(this.roomNum, "但是沒有效果", false);
			return;
		}
		switch(card){
			case 1:
				var temp = new Card(extra, this.card7, this.card8);
				sendMessage(this.roomNum, socketList[this.room.players[caster]].name + "猜測"
								+ socketList[this.room.players[target]].name + "的手牌是"
								+ temp.getDisplayName() + " <--[1]", false);
				if(this.players[target].handcards[0] == extra)this.eliminate(target);
				else sendMessage(this.roomNum, "但猜錯了", false);
				break;
			case 2:
				sendMessage(this.roomNum, socketList[this.room.players[caster]].name + "偷看了"
								+ socketList[this.room.players[target]].name + "的牌 <--[2]", false);
				io.to(this.room.players[caster]).emit('peek', {target : socketList[this.room.players[target]].name, card : this.players[target].handcards[0]});
				break;
			case 3:
				sendMessage(this.roomNum, socketList[this.room.players[caster]].name + "和"
								+ socketList[this.room.players[target]].name + "對決 <--[3]", false);
				if(this.players[caster].handcards[0] > this.players[target].handcards[0])this.eliminate(target);
				else if(this.players[target].handcards[0] > this.players[caster].handcards[0])this.eliminate(caster);
				else sendMessage(this.roomNum, "兩人的牌值一樣", false);
				break;
			case 4:
				sendMessage(this.roomNum, socketList[this.room.players[caster]].name + "受到保護了 <--[4]", false);
				this.players[caster].isProtected = true;
				break;
			case 5:
				if(caster == target)sendMessage(this.roomNum, socketList[this.room.players[caster]].name + "重抽了一張牌 <--[5]", false);
				else sendMessage(this.roomNum, socketList[this.room.players[caster]].name + "使" 
										+ socketList[this.room.players[target]].name + "重抽一張牌 <--[5]", false);
				var temp = new Card(this.players[target].handcards[0], this.card7, this.card8);
				if(temp.number == 8 && (this.card8 == 1 || this.card8 == 3)){
					switch(this.card8){
						case 1:
							sendMessage(this.roomNum, socketList[this.room.players[target]].name + "拋棄了情書 <--[8]", false);
							this.eliminate(target);
							break;
						case 3:
							sendMessage(this.roomNum, socketList[this.room.players[target]].name + "惹惱了檸檬公爵 <--[8]", false);
							this.eliminate(target);
							sendMessage(this.roomNum, "GAME OVER!", true);
							this.getWinner();
							roomList[this.roomNum].started = false;
							sendMessage(this.roomNum, "隱藏的底牌為 : " + roomList[socket.room].core.bottomCard.getDisplayName(),true);
							init_GamePage(this.roomNum);
							sendMessage(this.roomNum, "----------", true);
							break;
					}
				}else{
					this.players[target].removeCard(0);
					sendMessage(this.roomNum, socketList[this.room.players[target]].name + "原本的牌是" + temp.getDisplayName(), false);
					this.drawCard(target, false);
				}
				break;
			case 6:
				sendMessage(this.roomNum, socketList[this.room.players[caster]].name + "和"
											+ socketList[this.room.players[target]].name + "交換了牌 <--[6]", false);
				var temp = this.players[caster].handcards[0];
				this.players[caster].changeCard(this.players[target].handcards[0]);
				this.players[target].changeCard(temp);
				io.to(this.room.players[caster]).emit('drawCard', {card : this.players[caster].handcards, alives : null});
				io.to(this.room.players[target]).emit('drawCard', {card : this.players[target].handcards, alives : null});
				break;
			case 7:
				switch(this.card7){
					case 1:
						sendMessage(this.roomNum, socketList[this.room.players[caster]].name + "丟棄了艾薇爾  <--[7]", false);
						break;
					case 2:
						if(this.players[caster].handcards[0] >= 5){
							sendMessage(this.roomNum, socketList[this.room.players[caster]].name + "的手牌總和大於12  <--[7]", false);
							this.eliminate(caster);
						}
						else sendMessage(this.roomNum, socketList[this.room.players[caster]].name + "丟棄了樹鼻妹  <--[7]", false);
						break;
				}
				break;
			case 8:
				switch(this.card8){
					case 1:
						sendMessage(this.roomNum, socketList[this.room.players[caster]].name + "拋棄了情書 <--[8]", false);
						this.eliminate(caster);
						break;
					case 3:
						sendMessage(this.roomNum, socketList[this.room.players[caster]].name + "惹惱了檸檬公爵 <--[8]", false);
						this.eliminate(caster);
						sendMessage(this.roomNum, "GAME OVER!", true);
						this.getWinner();
						roomList[this.roomNum].started = false;
						sendMessage(this.roomNum, "隱藏的底牌為 : " + roomList[this.roomNum].core.bottomCard.getDisplayName(),true);
						init_GamePage(this.roomNum);
						sendMessage(this.roomNum, "----------", true);
						break;
					case 4:
						sendMessage(this.roomNum, socketList[this.room.players[caster]].name + "丟棄了彩虹姐姐 <--[8]", false);
						break;
				}
				break;
			case 9:
				sendMessage(this.roomNum, socketList[this.room.players[caster]].name + "被焚毀了 <--[X]", false);
				this.eliminate(caster);
				break;
		}
	}
}



