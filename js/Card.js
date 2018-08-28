//(function(){
module.exports = {
	Card:function Card(number, card7, card8){
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
	}
}

//})();