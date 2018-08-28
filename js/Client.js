(function(){
	
	function Card(number, card7, card8){
		this.number = number;
		this.card7 = card7;
		this.card8 = card8;
	
		this.isEqual = function(operand){
			if(operand.number = this.number)return true;
			return false;
		}
	
		this.getPic = function(){
			switch(this.number){
				case 0:
					return "/assets/img/card_back.jpg";
					break;
				case 1:
					return "/assets/img/card_1.jpg";
					break;
				case 2:
					return "/assets/img/card_2.jpg";
					break;
				case 3:
					return "/assets/img/card_3.jpg";
					break;
				case 4:
					return "/assets/img/card_4.jpg";
					break;
				case 5:
					return "/assets/img/card_5.jpg";
					break;
				case 6:
					return "/assets/img/card_6.jpg";
					break;
				case 7:
					switch(card7){
						case 1:
							return "/assets/img/card_7.jpg";
							break;
						case 2:
							return "/assets/img/card_7-2.jpg";
							break;
					}
					break;
				case 8:
					switch(card8){
						case 1:
							return "/assets/img/card_8.jpg";
							break;
						case 2:
							return "/assets/img/card_8-2.jpg";
							break;
						case 3:
							return "/assets/img/card_8-3.jpg";
							break;
						case 4:
							return "/assets/img/card_8-4.jpg";
							break;
					}
					break;
				case 9:
					return "/assets/img/card_X";
					break;
			}	
		}
	
		this.getDisplayName = function(){
			switch(this.number){
				case 1:
					return "嗶莫 [1]";
					break;
				case 2:
					return "馬歇爾 [2]";
					break;
				case 3:
					return "老皮 [3]";
					break;
				case 4:
					return "腫泡泡公主 [4]";
					break;
				case 5:
					return "阿寶 [5]";
					break;
				case 6:
					return "冰霸王 [6]";
					break;
				case 7:
					switch(card7){
						case 1:
							return "艾薇爾 [7]";
							break;
						case 2:
							return "樹鼻妹 [7]";
							break;
					}
					break;
				case 8:
					switch(card8){
						case 1:
							return "泡泡糖公主 [8]";
							break;
						case 2:
							return "火焰公主 [8]";
							break;
						case 3:
							return "檸檬公爵 [8]";
							break;
						case 4:
							return "彩虹姐姐 [8]";
							break;
					}
					break;
				case 9:
					return "陰魔王 [X]";
					break;		
			}
		}
	};

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
	
	var socket = io();
	var userName = null;
	var roomNumber = null;
	var choosedPlayer = null;
	var PlayerKey = null;
	var card = [];
	var card7 = 1;
	var card8 = 1;
	var cardX = false;
	var requireTarget = [1,2,3,5,6];
	var targetNotSame = [1,2,3,6];
	var validCard = [2,3,4,5,6,7,8];

	
	var show = self.show = function(e){
		el = document.getElementById(e);
		if(el)el.style.display = "inline-block";
		return;
	};
	
	var hide = self.hide = function(e){
		el = document.getElementById(e);
		if(el)el.style.display = "none";
		return;
	};
	
	hide("roomPage");
	hide("gamePage");
	hide("ruleBoard");
	
	function clearNode(e){
		var parentNode = document.getElementById(e);
		while(parentNode.firstChild)parentNode.removeChild(parentNode.firstChild);
	}
	
	function checkChar(input){
		if(input !== input.replace(/(<({^>}+)>)/ig,""))return true;
		else return false;
	}
	
	function refreshRoomList(){
		socket.emit('roomList', {});
	}
	
	document.getElementById("sendButton").addEventListener("click",function(){
		if(document.getElementById("inputId").value === "")alert("請輸入暱稱!");
		else if(checkChar(document.getElementById("inputId").value) === true)alert("請輸入合法字元!");
		else if(document.getElementById("inputId").value.length > 12)alert("暱稱過長!");
		else{			
			userName = document.getElementById("inputId").value;
			socket.emit('newUser',userName);	
		}
	});
	
	document.getElementById("inputId").addEventListener("keypress", function(e){
		if(e.keyCode === 13)document.getElementById("sendButton").click();
	});
	
	socket.on('toIntro',function(data){
		el = document.getElementById("loginPage");
		if(el)el.style.display = "block";
		hide("roomPage");
		hide("gamePage");
	});
	
	socket.on('nameConfirmed', function(data){
		if(data){
			document.getElementById("userName").innerHTML = userName;
			refreshRoomList();
			hide("loginPage");
			show("roomPage");
			
		}else alert("暱稱已存在!");
	});
	
	/////////////////////////////////////////////////////////
	
		
	function adaptRoomList(roomList){
		clearNode("roomList");
		for(var i = 0; i < roomList.length; i++){
			var li = document.createElement("li");
			li.classList.add("list-group-item");
			var container = document.createElement("div");
			container.classList.add("container");
			container.classList.add("fullWidth");
			var titleDiv = document.createElement("div");
			titleDiv.classList.add("row");
			var title = document.createElement("h2");
			title.classList.add("list-group-item-heading");
			title.innerHTML = "房號：" + roomList[i].roomNumber;
			var contentDiv = document.createElement("div");
			contentDiv.classList.add("row");
			var creatorDiv = document.createElement("div");
			creatorDiv.classList.add("col-xs-2");
			creatorDiv.classList.add("roomListContent");
			creatorDiv.innerHTML = "房主：" + roomList[i].creator;
			var userDiv = document.createElement("div");
			userDiv.classList.add("col-xs-2");
			userDiv.classList.add("roomListContent");
			userDiv.innerHTML = "人數：" + roomList[i].player + "/4";
			titleDiv.appendChild(title);
			container.appendChild(titleDiv);
			contentDiv.appendChild(creatorDiv);
			contentDiv.appendChild(userDiv);

			
			if(!roomList[i].started && roomList[i].player < 4){
				var buttonDiv = document.createElement("button");
				buttonDiv.classList.add("col-xs-1");
				buttonDiv.classList.add("col-xs-offset-7");
				buttonDiv.classList.add("roomListEnterButton");
				buttonDiv.innerHTML = "進入房間";
				contentDiv.appendChild(buttonDiv);
				buttonDiv.setAttribute("data-number",roomList[i].roomNumber);
				
				buttonDiv.onclick = function(){
					socket.emit("joinRoom",parseInt(this.getAttribute("data-number")));
					hide("startBtn");
					hide("abortBtn");
					hide("settingBtn");
				};
			}
			
			container.appendChild(contentDiv);
			li.appendChild(container);
			document.getElementById("roomList").appendChild(li);
		}
	};
	
	socket.on('roomList', function(data){
		var roomList = data;
		adaptRoomList(roomList);
	});
	
	document.getElementById("createRoomBtn").addEventListener("click",function(){
		socket.emit("createRoom");
	});
	
	document.getElementById("enterRoomBtn").addEventListener("click",function(){
		var roomNumber = parseInt(document.getElementById("inputRoomNumber").value);
		if(roomNumber >= 1000 && roomNumber <= 9999)socket.emit("joinRoom",roomNumber);
		else alert("房號介於1000~9999之間");
	});
	
	document.getElementById("inputRoomNumber").addEventListener("keypress",function(e){
		if(e.keyCode === 13)document.getElementById("enterRoomBtn").click();
	});
	
	document.getElementById("roomListRefresh").addEventListener("click",function(){
		refreshRoomList();
	});
	
	socket.on('joinFailed',function(data){
		alert(data);
		refreshRoomList();
	});
	
	///////////////////////////////////////////////////////////////////////////////
	
	socket.on('joinRoom', function(data){
		var roomNumberDiv = document.getElementById("roomNumber");
		roomNumberDiv.innerHTML = data.roomNumber;
		var roomCreatorDiv = document.getElementById("roomCreator");
		roomCreatorDiv.innerHTML = data.creator;
		if(document.getElementById("userName").innerHTML == roomCreatorDiv.innerHTML){
			show("settingBtn");
			show("startBtn");
			hide("abortBtn");
		}
		var players = data.players;
		adaptPlayerList(players);
		if(data.key != null)playerKey = data.key;
		hide("roomPage");
		show("gamePage");
		clearNode("console");
		init_GamePage(false);
	});
	
	function adaptPlayerList(players){
		clearNode("playerList");
		var playerListBlock = document.getElementById('playerList');
		for(key in players){
			var playerDiv = document.createElement("a");
			playerDiv.classList.add("list-group-item");
			playerDiv.classList.add("disabled");
			playerDiv.classList.remove("active");
			playerDiv.classList.add("pointer");
			playerDiv.innerHTML = players[key];
			playerDiv.setAttribute("selectPlayer",key);
			playerListBlock.appendChild(playerDiv);
			playerDiv.addEventListener("click",function(){
				if(!this.classList.contains("disabled")){
					var list = playerListBlock.childNodes;
					for(index in list){
						if(list[index].classList != undefined)if(list[index].classList.contains("active"))list[index].classList.remove("active");
					}
					this.classList.add("active");
					choosedPlayer = this.getAttribute("selectPlayer");
				}
			});
		}
	};
	
	socket.on('leaveRoom',function(data){
		if(data)alert("房間已關閉!");
		refreshRoomList();
		hide("gamePage");
		show("roomPage");
	});
	
	document.getElementById("leaveRoomBtn").addEventListener("click",function(){
		hide("gamePage");
		show("roomPage");
		socket.emit('leaveRoom',{});
	});
	
	function appendString(msg,div,isHL){
		if(isHL)$('#' + div).append($('<li class="listHL">').text(msg));
		else $('#' + div).append($('<li>').text(msg));
		
		var block = document.getElementById(div + "Block");
		block.scrollTop = block.scrollHeight;
	}
	
	socket.on('msg',function(data){
		appendString(data.msg, "console", data.isHL);
	});
	
	///////////////////////////////////////////////////////////////////////////////////
	
	document.getElementById("settingBtn").addEventListener("click",function(){
		var e = document.getElementById("ruleBoard");
		if(e.style.display == 'none'){
			show("ruleBoard");
			hide("gameBoard");
		}else{
			show("gameBoard");
			hide("ruleBoard");
		}
	});
	
	document.getElementById("select7_1").addEventListener("click",function(){
		card7 = 1;
		document.getElementById("select7_1").src='/assets/img/card_7.jpg';
		document.getElementById("select7_2").src='/assets/img/card_7-2dis.jpg';
	});
	
	document.getElementById("select7_2").addEventListener("click",function(){
		card7 = 2;
		document.getElementById("select7_2").src='/assets/img/card_7-2.jpg';
		document.getElementById("select7_1").src='/assets/img/card_7dis.jpg';
	});
	
	document.getElementById("select8_1").addEventListener("click",function(){
		card8 = 1;
		document.getElementById("select8_1").src='/assets/img/card_8.jpg';
		document.getElementById("select8_2").src='/assets/img/card_8-2dis.jpg';
		document.getElementById("select8_3").src='/assets/img/card_8-3dis.jpg';
		document.getElementById("select8_4").src='/assets/img/card_8-4dis.jpg';
	});
	
	document.getElementById("select8_2").addEventListener("click",function(){
		card8 = 2;
		document.getElementById("select8_2").src='/assets/img/card_8-2.jpg';
		document.getElementById("select8_1").src='/assets/img/card_8dis.jpg';
		document.getElementById("select8_3").src='/assets/img/card_8-3dis.jpg';
		document.getElementById("select8_4").src='/assets/img/card_8-4dis.jpg';
	});
	
	document.getElementById("select8_3").addEventListener("click",function(){
		card8 = 3;
		document.getElementById("select8_3").src='/assets/img/card_8-3.jpg';
		document.getElementById("select8_1").src='/assets/img/card_8dis.jpg';
		document.getElementById("select8_2").src='/assets/img/card_8-2dis.jpg';
		document.getElementById("select8_4").src='/assets/img/card_8-4dis.jpg';
	});
	
	document.getElementById("select8_4").addEventListener("click",function(){
		card8 = 4;
		document.getElementById("select8_4").src='/assets/img/card_8-4.jpg';
		document.getElementById("select8_1").src='/assets/img/card_8dis.jpg';
		document.getElementById("select8_2").src='/assets/img/card_8-2dis.jpg';
		document.getElementById("select8_3").src='/assets/img/card_8-3dis.jpg';
	});
	
	document.getElementById("selectX").addEventListener("click",function(){
		var e = document.getElementById("selectX");
		cardX = !cardX;
		if(cardX)e.src ='/assets/img/card_X.jpg';
		else e.src ='/assets/img/card_Xdis.jpg';
	});
	
	///////////////////////////////////////////////////////////////////////////////////
	
	document.getElementById("startBtn").addEventListener("click",function(){
		socket.emit('startGame',{card7 : card7, card8 : card8, cardX : cardX});
		if(document.getElementById("playerList").childNodes.length > 1){
			show("abortBtn");
			hide("startBtn");
			hide("ruleBoard");
			show("gameBoard");
			hide("settingBtn");
		}
	});
	
	document.getElementById("abortBtn").addEventListener("click",function(){
		socket.emit('abortGame', {});
		show("startBtn");
		hide("abortBtn");
		show("settingBtn");
	});
	
	socket.on('init',function(data){
		init_GamePage(data);
	});
	
	socket.on('gameSetting',function(data){
		card7 = data.card7;
		card8 = data.card8;
		cardX = data.cardX;
	});
	
	function init_GamePage(isCreator){
		choosedPlayer = null;
		document.getElementById("cardLeft").src = "/assets/img/card_back.jpg";
		document.getElementById("cardRight").src = "/assets/img/card_back.jpg";
		show("cardLeft");
		hide("cardRight");
		if(isCreator){
			show("startBtn");
			hide("abortBtn");
			show("settingBtn");
		}
	}
	
	function clickLeft(){
		if(requireTarget.indexOf(card[0]) != -1 && choosedPlayer == null){
			alert("請選擇一個目標");
			return;
		}else if(targetNotSame.indexOf(card[0]) != -1 && parseInt(choosedPlayer) == parseInt(playerKey)){
			alert("請勿選擇自己");
			return;
		}else if((card[0] == 5 || card[0] == 6) && card[1] == 7){
			alert("請優先選擇艾薇爾[7]");
			return;
		}else if(card8 == 2 && card[0] == 8){
			alert("不可直接丟棄火焰公主[8]");
			return;
		}else{
			var guessedCard;
			if(card[0] == 1){
				guessedCard = parseInt(prompt("猜測一張卡片(2~8)"));
				if(validCard.indexOf(guessedCard) == -1){
					alert("請輸入2~8");
					return;
				}
			}
			socket.emit('discardCard', {card : card[0], target : choosedPlayer, extra : guessedCard});
			document.getElementById("cardLeft").removeEventListener("click",clickLeft);
			enablePlayerList(false, []);
			choosedPlayer = null;
			hide("cardLeft");
		}
	}
	
	function clickRight(){
		if(requireTarget.indexOf(card[1]) != -1 && choosedPlayer == null){
			alert("請選擇一個目標");
			return;
		}else if(targetNotSame.indexOf(card[1]) != -1 && parseInt(choosedPlayer) == parseInt(playerKey)){
			alert("請勿選擇自己");
			return;
		}else if((card[1] == 5 || card[1] == 6) && card[0] == 7){
			alert("請優先選擇艾薇爾[7]");
			return;
		}else if(card8 == 2 && card[1] == 8){
			alert("不可直接丟棄火焰公主[8]");
			return;
		}else{
			var guessedCard = null;
			if(card[1] == 1){
				guessedCard = parseInt(prompt("猜測一張卡片(2~8)"));
				if(validCard.indexOf(guessedCard) == -1){
					alert("請輸入2~8");
					return;
				}
			}
			socket.emit('discardCard', {card : card[1], target : choosedPlayer, extra : guessedCard});
			document.getElementById("cardRight").removeEventListener("click",clickRight);
			enablePlayerList(false, []);
			choosedPlayer = null;
			hide("cardRight");
		}
	}
	
	socket.on('drawCard',function(data){
		if(data.card.length == 1){
			var cardt = new Card(data.card[0], card7, card8);
			document.getElementById("cardLeft").src = cardt.getPic();
			document.getElementById("cardLeft").removeEventListener("click",clickLeft);
			document.getElementById("cardRight").removeEventListener("click",clickRight);
			show("cardLeft");
			hide("cardRight");
		}else{
			var cardt = new Card(data.card[0], card7, card8);
			document.getElementById("cardLeft").src = cardt.getPic();
			cardt = new Card(data.card[1], card7, card8);
			document.getElementById("cardRight").src = cardt.getPic();
			
			card = data.card;
			
			document.getElementById("cardLeft").addEventListener("click",clickLeft);		
			document.getElementById("cardRight").addEventListener("click",clickRight);
			
			enablePlayerList(true, data.alives);
			show("cardLeft");
			show("cardRight");
		}
		
		if(data.card.indexOf(7) != -1 && data.card.length == 2)if(data.card[0] + data.card[1] >= 12)socket.emit('discardCard', {card : 7});
		if(data.card.indexOf(9) != -1)socket.emit('discardCard', {card : 9});
	});
	
	socket.on('peek',function(data){
		var cardt = new Card(data.card, card7, card8);
		alert(data.target + "有一張" + cardt.getDisplayName());
	});
	
	function enablePlayerList(state, alivePlayers){
		var list = document.getElementById('playerList').childNodes;
		if(state)for(key in list){
			if(list[key].classList != undefined){
				if(alivePlayers.indexOf(list[key].innerHTML) != -1){
					if(list[key].classList.contains("disabled"))list[key].classList.remove("disabled");
					if(!list[key].classList.contains("active"))list[key].classList.add("active");
				}else{
					if(!list[key].classList.contains("disabled"))list[key].classList.add("disabled");
					if(list[key].classList.contains("active"))list[key].classList.remove("active");
				}
			}
		}
		else for(key in list)if(list[key].classList != undefined){
			if(!list[key].classList.contains("disabled"))list[key].classList.add("disabled");
			if(list[key].classList.contains("active"))list[key].classList.remove("active");
		}
	}
	
	socket.on('eliminated',function(data){
		init_GamePage(false);
	});
	
})();