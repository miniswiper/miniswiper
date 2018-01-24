/** 
 * Miniswiper
 * @link https://github.com/miniswiper/miniswiper
 * @version 1.0.0
 * @copyright (c) 2018-present Miniswiper contributors All Rights Reserved. 
 */
function Miniswiper(elemId, params) {
	var obj = new Object;

	// basic variables
	var swiperElem = null,
		contentElem = null,
		direction = 'horizontal', // horizontal OR vertical
		width = null,
		height = null,
		itemCount = 0,
		stepDistance = 0,
		currentStep = 0;

	// effect variables
	var circular = false, 
		special = false,
		minScale = 1,
		maxScale = 1,
		displayMultipleItems = 1;

	// animation variables
	var autoplay = false,
		interval = 1000,
		duration = 300;

	// callback
	var bindchange = null;

	// interval handle
	var timer = 0;


	/* vendor prefix */
	var vendorPrefix = (function(){
		var docStyle = document.documentElement.style, engine;

		if ('MozAppearance' in docStyle) {
			engine = 'gecko';
		} else if ('WebkitAppearance' in docStyle) {
			engine = 'webkit';
		} else if (typeof navigator.cpuClass === 'string') {
			engine = 'trident';
		} else if (navigator.userAgent.indexOf("Opera") > -1) {
			engine = 'presto';
		}

		return {trident: 'ms', gecko: 'Moz', webkit: 'Webkit', presto: 'O'}[engine];
	})();


	/* render */
	function render(elem, left, top, zoom) {
		var helperElem = document.createElement('div'),
			perspectiveProperty = vendorPrefix + 'Perspective',
			transformProperty = vendorPrefix + 'Transform';

		if (helperElem.style[perspectiveProperty] !== undefined) {	
			left = left || 0;
			top = top || 0;
			zoom = zoom || 1;
			elem.style[transformProperty] = 'translate3d(' + left + 'px,' + top + 'px,0) scale(' + zoom + ')';
		} else if (helperElem.style[transformProperty] !== undefined) {
			left = left || 0;
			top = top || 0;
			zoom = zoom || 1;
			elem.style[transformProperty] = 'translate(' + left + 'px,' + top + 'px) scale(' + zoom + ')';
		} else {
			if (typeof left !== 'undefined') elem.style.left = left;
			if (typeof top !== 'undefined') elem.style.top = top;
			if (typeof zoom !== 'undefined') elem.style.zoom = zoom;
		}
	}

	/* get pixel */
	function getPixel(value, reference) {
		var result = null;

		if (typeof value === 'number')
			result = value;
		else if (typeof value === 'string') {
			if (! isNaN(value))
				result = parseFloat(value);
			else if (/^\d+(\.\d+)?px$/.test(value)) 
				result = parseFloat(value.replace('px',''))
			else if (/^\d+(\.\d+)?\%$/.test(value)) {
				var w = parseFloat(value.replace('%',''))/100;
				result = w * reference;
			} 
		}

		return result;
	}


	/* initialize */
	(function init(elemId, params) {
		swiperElem  = document.getElementById(elemId);
		contentElem = swiperElem.getElementsByClassName('miniswiper-content')[0];

		// init params
		circular = params && params.circular;

		// set swiper layout
		if (params && params.direction && params.direction=='vertical')
			direction = 'vertical'
		if (swiperElem.classList)
			swiperElem.classList.add(direction)
		else 
			swiperElem.setAttribute('class', swiperElem.getAttribute('class')+' '+direction );

		// set swiper width
		if (!params || !params.width) 
			width = swiperElem.offsetWidth;
		else 
			width = getPixel(params.width, document.body.clientWidth) || swiperElem.offsetWidth;
		swiperElem.style.width = width+'px';

		// set swiper height
		if (params && params.height)
			height = getPixel(params.height, document.body.clientHeight);
		if (height)
			swiperElem.style.height = height+'px';

		// normal effect
		if (!params || !params.special) {
			if (direction == 'horizontal') { // horizontal
				stepDistance = width;

				var wrap = swiperElem.getElementsByClassName('miniswiper-content')[0],
					sliders = swiperElem.getElementsByClassName('miniswiper-slide');

				itemCount = sliders.length;

				for (var i = 0; i < sliders.length; i += 1) {
					sliders[i].style.width = width+'px';
				}		

				if (!circular)
					wrap.style.width = (width*sliders.length+100)+'px';
				else {

				}
			} else { // vertical

			}
		}
		// special effect
		else {


		}


		// register events
		registerEvents();

	})(elemId, params);


	/* register events */
	function registerEvents() {
		var currentX, currentY;

		// move
		var move = function(x, y) {
			var moveX = x - currentX,
				moveY = y - currentY,
				step = currentStep;

			// horizontal
			if (direction == 'horizontal') {
				render(contentElem, -step*stepDistance+moveX);
			}
		};

		// finish 
		var finish = function(x, y) {
			var moveX = x - currentX,
				moveY = y - currentY;

			// horizontal
			if (direction == 'horizontal') {					
				if (! circular) {
					if (moveX > 0 && currentStep > 0)
						currentStep -= 1;					
					if (moveX < 0 && currentStep < itemCount-1)
						currentStep += 1;
				}
				contentElem.style[vendorPrefix+'Transition'] = 'all '+duration+'ms';
				render(contentElem, -currentStep*stepDistance);
			}
		};

		// if the device is a mobile device, listen for touch events.
		if (/AppleWebKit.*Mobile.*/.test(navigator.userAgent)) {
			// touch start
			swiperElem.addEventListener('touchstart', function(e){
				clearInterval(timer);
				contentElem.style[vendorPrefix+'Transition'] = 'all 0ms';

				currentX = e.touches[0].clientX;
				currentY = e.touches[0].clientY;
			});			
			// touch move
			swiperElem.addEventListener('touchmove', function(e){
				e.preventDefault();
				move(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
			});
			// touch end
			swiperElem.addEventListener('touchend', function(e){
				finish(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
			});
		}
		// if the device is a pc device, listen for mouse events.
		else {
			// mouse down 
			swiperElem.onmousedown = function(e){
				e.preventDefault();
				e.stopPropagation();
				clearInterval(timer);	
				contentElem.style[vendorPrefix+'Transition'] = 'all 0ms';

				currentX = e.clientX;
				currentY = e.clientY;

				// handle
				var handle = function(e) {
					e.preventDefault();
					e.stopPropagation();
				}
				if (/WebKit/i.test(navigator.userAgent))
					document.addEventListener('mousedown', handle, false);

				// mouse move 
				document.onmousemove = function(e){
					move(e.clientX, e.clientY);

					if (Math.abs(e.clientX - currentX) > 1 || Math.abs(e.clientY - currentY) > 1) {
						if (swiperElem.classList)
							swiperElem.classList.add('mask')
						else 
							swiperElem.setAttribute('class', swiperElem.getAttribute('class')+' mask' );
					}

					return false;
				};

				// mouse up 
				document.onmouseup = function(e){
					document.onmousemove = null;
					finish(e.clientX, e.clientY);

					if (swiperElem.classList)
						swiperElem.classList.remove('mask')
					else {
						var newClassName = swiperElem.getAttribute('class').replace(' mask','');
						swiperElem.setAttribute('class', newClassName );
					}

					if (/WebKit/i.test(navigator.userAgent))
						document.removeEventListener('mousedown', handle, false);
				};

			};
			swiperElem.getElementsByTagName('a')[0].addEventListener('click',function(){return false})
		}	

	}


	return obj;
}
