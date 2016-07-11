(function(){

	var Carousel = function(options){
		this.options = options || {};

		this.arrange();
		this.createButtons();
		this.bindEvents();
		this.options.autoslide && this.slider();
		this.init();
	}

	Carousel.prototype.arrange = function(item){
		var items = $(this.options.el).children().remove();
		while(items.length){
			var remainingItems = items.splice(this.options.visibleItems);
			$(this.options.el).append($('<div class="items-chunk"></div>').append(items));
			items = remainingItems;
		}
	}

	Carousel.prototype.createButtons = function() {
		$(this.options.el).append('<div class="left-button"></div>').append('<div class="right-button"></div>');
	}

	Carousel.prototype.bindEvents = function() {
		var _this = this;
		$(this.options.el).find('.left-button').on('click',function(event){
			_this.onLeftClick(event);
		})
		$(this.options.el).find('.right-button').on('click',function(event){
			_this.onRightClick(event);
		});

	}

	Carousel.prototype.onLeftClick = function(event){

		if(this.animating){
			// Return from here because animation is going on
			return;
		}
		this.animating = true;

		var previousItem = this.pointedItem,
			_this = this;
		this.pointedItem--;
		this.pointedItem = this.pointedItem < 0 ? $(this.options.el).find('.items-chunk').length : this.pointedItem;

		var $prev = this.itemAt(previousItem),
			$new = this.itemAt(this.pointedItem);
		$prev.addClass('right');
		$new.addClass('prev left');
		$(this.options.el).one('webkitTransitionEnd',function() {
			$prev.removeClass('active right');
			$new.addClass('active').removeClass('prev right');
			_this.animating = false;
		})

	}

	Carousel.prototype.onRightClick = function(event){

		if(this.animating) {
			// Don't trigger animation if the animation is already going on
			return;
		}
		this.animating = true;

		var previousItem = this.pointedItem,
			_this = this;

		this.pointedItem++;
		this.pointedItem = this.getIndex(this.pointedItem);

		

		var $prev = this.itemAt(previousItem),
			$new = this.itemAt(this.pointedItem);
		
		$new.addClass('next left');
		$prev.addClass('left');

		$(this.options.el).one('webkitTransitionEnd',function() {
			$prev.removeClass('active left');
			$new.addClass('active').removeClass('next left');
			_this.animating = false;
		})
	}

	Carousel.prototype.slider = function() {
		var _counter = 0,
			_this = this;
		this.timer = setInterval(function(){
			$(_this.options.el).find('.items-chunk').removeClass('active').eq(_counter).addClass('active');
			_counter++;
			_counter = _this.getIndex(_counter);
		},this.options.interval || 3000);	
	}

	Carousel.prototype.destroy = function(){
		this.timer && clearInterval(this.timer);
	}

	Carousel.prototype.getIndex = function(count){
		return count % ($(this.options.el).find('.items-chunk').length || 1);
	}

	Carousel.prototype.init = function() {
		this.itemAt(0).addClass('active');
		this.pointedItem = 0;
	}

	Carousel.prototype.itemAt = function(itemIndex){
		return $(this.options.el).find('.items-chunk').eq(itemIndex || 0);
	}

	window.Carousel = Carousel;
})();
