window.onload = function(){
	//document load function goes here 
	init();
}

function init(){
	var carousel_obj = new Carousel({
		el : '.test1',
		mobile : false , 
		visibleItems : 4,
		autoSlide : false,
		handleArrows : true
	});

	var carousel_obj = new Carousel({
		el : '.test2',
		mobile : false , 
		visibleItems : 4,
		autoSlide : true,
		leftText : 'Prev',
		rightText : 'Next'
	});
}