window.onload = function(){
	//document load function goes here 
	init();
}

function init(){
	var carousel_obj = new Carousel({
		el : '.main-container',
		mobile : false , 
		visibleItems : 4,
		autoslide : false
	});
}