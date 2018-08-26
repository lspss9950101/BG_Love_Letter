//(function(){
module.exports = {
	Card:function(number){
	this.number = number;
	
	this.getPic = function(){
		switch(this.number){
			case 0:
				return "/assets/img/background.jpg";
				break;
			case 1:
				return "/assets/img/1.jpg";
				break;
			case 2:
				return "/assets/img/2.jpg";
				break;
			case 3:
				return "/assets/img/3.jpg";
				break;
			case 4:
				return "/assets/img/4.jpg";
				break;
			case 5:
				return "/assets/img/5.jpg";
				break;
			case 6:
				return "/assets/img/6.jpg";
				break;
			case 7:
				return "/assets/img/7.jpg";
				break;
			case 8:
				return "/assets/img/8.jpg";
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
				return "艾薇爾 [7]";
				break;
			case 8:
				return "泡泡糖公主 [8]";
				break;			
		}
	}
}
}

//})();