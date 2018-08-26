//(function(){
module.exports = {
	Player: function(){
		this.handcards = [];
		this.isProtected = false;
	
		this.addCard = function(card){
			this.handcards.push(card);
		};
	
		this.removeCard = function(index){
			this.handcards.splice(index ,1);
		};
	
		this.changeCard = function(card){
			this.handcards = [card];
		};
	}
}
	
//})();
