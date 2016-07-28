/*
options :

visibleItems       => Items those should be clubbed together to form a chunk and will be visible in window
mobileVisibleItems => Number of items visible in the mobile view
interval           => Interval for auto slide
autoSlide          => Autoslide option


*/

(function(){

	var ANIMATION_END_EVENT = 'transitionend mozAnimationEnd mozanimationend webkitTransitionEnd oanimationend msanimationend animationend';

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
		this.applyStyle();
		this.divideInChunks();
	}

	Carousel.prototype.divideInChunks = function(){
		var index = 0,
			clonedItemChunk ,
			currentItem = this.currentEl(),
			itemStyle = this.calculateParams(),
			itemChunk = document.createElement('div'),
			items = [].slice.call(this.currentEl().children);
		itemChunk.className = 'items-chunk';
		while(items.length){
			var remainingItems = items.splice(this.options._visibleItems);
			clonedItemChunk = itemChunk.cloneNode(true);
			for(index = 0 ; index < items.length ; index++){
				clonedItemChunk.appendChild(items[index]);
			}
			currentItem.appendChild(clonedItemChunk);
			items = remainingItems;
		}
	}
	/**
	* Calculate height width dynamically and apply it to the individual item
	**/
	Carousel.prototype.applyStyle = function(){
		var index = 0,
			currentItem ,
			itemStyle = this.calculateParams(),
			items = this.currentEl().children;
			for(index = 0 ; index < items.length ; index++){
				currentItem = items[index],
				currentItem.style.marginRight = itemStyle['margin-right'] + 'px';
				currentItem.style.width = itemStyle['width'] + 'px';
			};
	}

	Carousel.prototype.calculateParams = function() {
		var marginRight = this.options.margin || 10,
			totalMargin = marginRight * this.options._visibleItems ,
			parentWidth = this.currentEl().getBoundingClientRect().width - totalMargin;
		return {
			'margin-right' : marginRight,
			'width' : parseInt(parentWidth / this.options._visibleItems)
		}	
	}

	Carousel.prototype.mobileCheck = function(event){
		this.options._visibleItems = window.document.body.scrollWidth < 780 ? (this.options.mobileVisibleItems || 1): this.options.visibleItems;
	}

	Carousel.prototype.createButtons = function() {
		this.leftButtonEle = document.createElement('div'),
		this.rightButtonEle = this.leftButtonEle.cloneNode(true);
		this.leftButtonEle.innerText = this.options.leftText || "<";
		this.rightButtonEle.innerText = this.options.rightText ||">";
		this.leftButtonEle.className = 'left-button';
		this.rightButtonEle.className = 'right-button';
		this.currentEl().appendChild(this.leftButtonEle);
		this.currentEl().appendChild(this.rightButtonEle);
	}

	Carousel.prototype.bindEvents = function() {
		var _this = this;
		document.querySelector(this.options.el.concat(' .left-button')).addEventListener('click',function(event){
			_this.onLeftClick(event);
		})
		document.querySelector(this.options.el.concat(' .right-button')).addEventListener('click',function(event){				
			_this.onRightClick(event);
		});
		this.currentEl().addEventListener('touchstart',function(event){
			_this.onTouchStart(event);
		});
		this.currentEl().addEventListener('touchend',function(event){
			_this.onTouchEnd(event);
		});
		this.currentEl().addEventListener('touchmove',function(event){
			_this.onTouchMove(event);
		});
		window.addEventListener('resize', function(event){
			clearTimeout(_this.resizeEventTimer);
			_this.resizeEventTimer = setTimeout(function(){
				_this.reset(event);
			},500);
		});
	}

	Carousel.prototype.onTouchStart = function(event){
		this.touchStart = event.touches[0];
	}

	Carousel.prototype.onTouchEnd = function(event){
		if(!this.touchMove || this.animating) return;
		if(Math.abs(this.touchMove.screenX - this.touchStart.screenX) < (this.options.threshold || 20)) {
			return;
		}
	    (this.touchMove.screenX - this.touchStart.screenX < 0 )? this.onRightClick() : this.onLeftClick();
		this.touchStart = null;																																																
	}

	Carousel.prototype.onTouchMove = function(event){
		this.touchMove = event.touches[0];
		this.touchstart = false;
	}

	Carousel.prototype.onLeftClick = function(event){

		if(this.animating || [].slice.call(this.leftButtonEle.classList).indexOf('disable') > 0){
			// Return from here because animation is going on
			return;
		}
		this.animating = true;

		var previousItem = this.pointedItem,
			_this = this;
		this.pointedItem--;
		this.pointedItem = this.pointedItem < 0 ? this.getChunks().length - 1: this.pointedItem;

		var prevEle = this.itemAt(previousItem),
			newEle = this.itemAt(this.pointedItem);

		newEle.classList.add('prev');
		prevEle.classList.add('right');

		newEle.offsetWidth;			// Memory of DOM attributes get refreshed when this property is called
		newEle.classList.add('right'); 

		this.handleArrows();

		$(this.options.el).one(ANIMATION_END_EVENT,function() {
			prevEle.classList.remove('active');
			prevEle.classList.remove('right');
			newEle.classList.add('active');
			newEle.classList.remove('prev');
			newEle.classList.remove('right');
			_this.animating = false;
			clearTimeout(_this.timer);
		})

	}

	Carousel.prototype.onRightClick = function(event){

		if(this.animating || [].slice.call(this.rightButtonEle.classList).indexOf('disable') > 0){
			// Don't trigger animation if the animation is already going on
			return;
		}
		this.animating = true;

		var previousItem = this.pointedItem,
			_this = this;

		this.pointedItem++;
		this.pointedItem = this.getIndex(this.pointedItem);

		var prevEle = this.itemAt(previousItem),
			newEle = this.itemAt(this.pointedItem);

		newEle.classList.add('next');
		prevEle.classList.add('left');
		newEle.offsetWidth;         // Memory of DOM attributes get refreshed when this property is called
		newEle.classList.add('left');

		this.handleArrows();

		$(this.options.el).one(ANIMATION_END_EVENT,function() {
			prevEle.classList.remove('active');
			prevEle.classList.remove('left');
			newEle.classList.add('active');
			newEle.classList.remove('next');
			newEle.classList.remove('left');
			_this.animating = false;
			clearTimeout(_this.timer);
		});
	}

	Carousel.prototype.slider = function() {
		var _counter = 0,
			_this = this;
		this.timer = setInterval(function(){
			_this.onRightClick();
		},this.options.interval || 3000);
	}

	Carousel.prototype.destroy = function(){
		this.animating = false;
		this.timer && clearInterval(this.timer);
	}

	Carousel.prototype.reset = function(){
		var currentEl = this.currentEl(),
			items = [].slice.call(this.getChunks());
			arrayItems = [];// [].slice.call(.children),

		items.forEach(function(item,index){
			arrayItems = arrayItems.concat([].slice.call(item.children));
		});
			
		currentEl.innerHTML = '';
		arrayItems.forEach(function(item,index){
			currentEl.appendChild(item);
		});
		this.destroy();
		this._init(this.options);
	}

	Carousel.prototype.getIndex = function(count){
		return count % (this.getChunks().length || 1);
	}

	Carousel.prototype.init = function() {
		this.itemAt(0).classList.add('active');
		this.pointedItem = 0;
		this.handleArrows();
	}

	Carousel.prototype.itemAt = function(itemIndex){
		return this.getChunks()[itemIndex || 0];
	}

	Carousel.prototype.currentEl = function(){
		this.el =  this.el ? this.el : document.querySelector(this.options.el);
		return this.el;
	}

	Carousel.prototype.getChunks = function(){
		return document.querySelectorAll(this.options.el.concat(' .items-chunk'));
	}

	Carousel.prototype.handleArrows = function() {
		if(!this.options.handleArrows){
			return;
		}
		this.leftButtonEle.classList.remove('disable');
		this.rightButtonEle.classList.remove('disable');
		if(this.pointedItem == 0) this.leftButtonEle.classList.add('disable');
		if(this.pointedItem == this.getChunks().length - 1) this.rightButtonEle.classList.add('disable');
	}

	window.Carousel = Carousel;
})();