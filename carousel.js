/*
options :

visibleItems       => Items those should be clubbed together to form a chunk and will be visible in window
mobileVisibleItems => Number of items visible in the mobile view
interval           => Interval for auto slide
autoSlide          => Autoslide option


*/

(function(){

	var ANIMATION_END_EVENT = 'webkitTransitionEnd oanimationend msanimationend animationend';

	var Carousel = function(options){
		this._init(options);
	}

	Carousel.prototype._init = function(options){
		this.options = options || {};

		this.mobileCheck();
		this.arrange();
		this.createButtons();
		this.bindEvents();
		this.options.autoSlide && this.slider();
		this.init();
	}

	Carousel.prototype.arrange = function(item){
		var items = $(this.options.el).children().css(this.calculateParams()).remove();
		while(items.length){
			var remainingItems = items.splice(this.options._visibleItems);
			$(this.options.el).append($('<div class="items-chunk"></div>').append(items));
			items = remainingItems;
		}
	}

	Carousel.prototype.calculateParams = function() {
		var marginRight = this.options.margin || 10,
			totalMargin = marginRight * this.options._visibleItems ,
			parentWidth = $(this.options.el).width() - totalMargin;
		return {
			'margin-right' : marginRight,
			'width' : parseInt(parentWidth / this.options._visibleItems)
		}	
	}

	Carousel.prototype.mobileCheck = function(event){
		this.options._visibleItems = $(window).width() < 780 ? (this.options.mobileVisibleItems || 1): this.options.visibleItems;
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
		$(this.options.el).on('touchstart',function(event){
			_this.onTouchStart(event);
		});
		$(this.options.el).on('touchend',function(event){
			_this.onTouchEnd(event);
		});
		$(this.options.el).on('touchmove',function(event){
			_this.onTouchMove(event);
		});
		$(window).on('resize',function(event){
			clearTimeout(_this.resizeEventTimer);
			_this.resizeEventTimer = setTimeout(function(){
				console.log('resize');
				_this.reset(event);
			},500);
		});
	}



	Carousel.prototype.onTouchStart = function(event){
		this.touchStart = event.originalEvent.touches[0];
	}

	Carousel.prototype.onTouchEnd = function(event){
		if(!this.touchMove || this.animating) return;
		if(Math.abs(this.touchMove.screenX - this.touchStart.screenX) < (this.options.threshold || 20)) {
			return;
		}
		var $eleTrigger = (this.touchMove.screenX - this.touchStart.screenX < 0 )? $(this.options.el).find('.right-button') :
							$(this.options.el).find('.left-button');
		$eleTrigger.trigger('click');
		this.touchStart = null;
	}

	Carousel.prototype.onTouchMove = function(event){
		this.touchMove = event.originalEvent.touches[0];
		this.touchstart = false;
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
		this.pointedItem = this.pointedItem < 0 ? $(this.options.el).find('.items-chunk').length - 1: this.pointedItem;

		var $prev = this.itemAt(previousItem),
			$new = this.itemAt(this.pointedItem);


		$new.addClass('prev');
		$prev.addClass('right');

		// Delay is set to overcome DOM rendering latency
		this.timer = setTimeout(function() { $new.addClass('right'); } ,10);

		$(this.options.el).one(ANIMATION_END_EVENT,function() {
			$prev.removeClass('active right');
			$new.addClass('active').removeClass('prev right');
			_this.animating = false;
			clearTimeout(_this.timer);
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

		$new.addClass('next');
		$prev.addClass('left');
		// Delay is set to overcome DOM rendering latency
		setTimeout(function() { $new.addClass('left'); } ,10);

		$(this.options.el).one(ANIMATION_END_EVENT,function() {
			$prev.removeClass('active left');
			$new.addClass('active').removeClass('next left');
			_this.animating = false;
			clearTimeout(_this.timer);
		});
	}

	Carousel.prototype.slider = function() {
		var _counter = 0,
			_this = this;
		this.timer = setInterval(function(){
			$(_this.options.el).find('.right-button').trigger('click');
		},this.options.interval || 3000);
	}

	Carousel.prototype.destroy = function(){
		this.timer && clearInterval(this.timer);
	}

	Carousel.prototype.reset = function(){
		console.log('reset');
		var items = $(this.options.el).find('.items-chunk').children().remove();
		$(this.options.el).empty().append(items);
		this.destroy();
		this._init(this.options);
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