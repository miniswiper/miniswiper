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
		sliders = [],
		width = null,
		height = null,
		stepDistance = 0,
		currentStep = 0;

	// effect variables
	var	indicator = null,
		arrow = null,
		special  = false,
		minScale = 1,
		maxScale = 1,
		minOpacity = 1,
		margin = 0;

	// animation variables
	var autoplay = false,
		interval = 3000,
		duration = 300;

	// interval handle
	var timer = [0,0];


	/* regular attributes */
	obj.direction = 'horizontal'; // horizontal OR vertical
	obj.itemCount = 0;
	obj.previousIndex = null;
	obj.activeIndex = 0;

	obj.effect = 'slide';
	obj.circular = false;

	obj.bindchange = null;


	/* vendor prefix */
	var vendorPrefix = (function(){
		var docStyle = document.documentElement.style, engine;

		if ('MozAppearance' in docStyle) {
			engine = 'gecko';
		} else if ('WebkitAppearance' in docStyle) {
			engine = 'webkit';
		} else if (typeof navigator.cpuClass === 'string') {
			engine = 'trident';
		} else if (navigator.userAgent.indexOf('Opera') > -1) {
			engine = 'presto';
		}

		return {trident: 'ms', gecko: 'Moz', webkit: 'Webkit', presto: 'O'}[engine];
	})();


	/* render the element */
	function render(elem, left, top, zoom) {	
		left = left || 0;
		top  = top  || 0;
		zoom = zoom || 1;

		var helperElem = document.createElement('div'),
			perspectiveProperty = vendorPrefix + 'Perspective',
			transformProperty = vendorPrefix + 'Transform';

		if (helperElem.style[perspectiveProperty] !== undefined) {	
			elem.style[transformProperty] = 'translate3d('+left+'px,'+top+'px,0) scale('+zoom+')';
		} else {
			elem.style[transformProperty] = 'translate('+left+'px,'+top+'px) scale('+zoom+')';
		}
	}


	/* add the class name to an element */
	function addClass(elem, className) {
		if (elem.classList)
			elem.classList.add(className)
		else {
			var oldClassName = elem.getAttribute('class');
			elem.setAttribute('class', oldClassName.replace(className,'')+' '+className );
		}
	}

	/* remove the class name from an element */
	function removeClass(elem, className) {		
		if (elem.classList)
			elem.classList.remove(className)
		else 
			elem.setAttribute('class', elem.getAttribute('class').replace(className,'') );
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
			else if (/^\d+(\.\d+)?%$/.test(value)) {
				var w = parseFloat(value.replace('%',''))/100;
				result = w * reference;
			} 
		}

		return result;
	}


	/* lazy load */
	function lazyLoad(image, callback) {
		var img = new Image(),
			complete = function(){
				image.style.opacity = 0;
				image.src = img.src;	
				var a = 0, 
					t = setInterval(function(){
					image.style.opacity = ((a += 5)/100);
					if (a === 100) clearInterval(t);
				},25);
				if (typeof callback==='function') callback();
			};

		img.src = image.getAttribute('data-src');

		if (img.complete) complete();
		img.onload = complete;
	}


	/* initialize */
	(function init(elemId, params) {
		swiperElem  = document.getElementById(elemId);
		obj.context = swiperElem;
		contentElem = swiperElem.getElementsByClassName('miniswiper-content')[0];

		// slider views
		sliders = swiperElem.getElementsByClassName('miniswiper-slide');		
		obj.itemCount = sliders.length;

		// params	
		if (params) handleParams(params);

		// set layout
		setLayout();

		// slide show effect
		if (obj.effect === 'slide') {
			// circular
			if (obj.circular && obj.itemCount > 1) {
				contentElem.insertBefore(sliders[sliders.length-1].cloneNode(true), sliders[0]);
				contentElem.insertBefore(sliders[sliders.length-2].cloneNode(true), sliders[0]);
				contentElem.appendChild(sliders[2].cloneNode(true));
				contentElem.appendChild(sliders[3].cloneNode(true));				
			}

			initSlideView();
		}
		// fade effect
		else {
			addClass(swiperElem, obj.effect);
			sliders[0].style.opacity = 1;
		}

		// lazy load images
		var images = swiperElem.getElementsByTagName('img');
		for (var i = 0; i < images.length; i += 1) {
			if (images[i].getAttribute('data-src')) lazyLoad(images[i])
		}

		// register events
		registerEvents();

		// autoplay
		if (autoplay) setPlay();

		// initialize indicator, arrow buttons
		if (indicator) initIndicator();
		if (arrow) initArrowButton();

	})(elemId, params);


	/* handle parameters */
	function handleParams(params) {
		if (params.direction && params.direction==='vertical')
			obj.direction = 'vertical'
		if (params.effect && params.effect==='fade')
			obj.effect = 'fade'
		if (params.circular) 
			obj.circular = params.circular;
		if (params.indicator)
			indicator = params.indicator;			
		if (params.arrow)
			arrow = params.arrow;
		if (params.bindchange && typeof params.bindchange === 'function')
			obj.bindchange = params.bindchange;
		if (params.autoplay) {
			if (typeof params.autoplay === 'boolean') {
				obj.autoplay = {interval: interval, duration: duration}
				autoplay = params.autoplay;
			}
			if (typeof params.autoplay === 'object') {
				if (params.autoplay.interval) interval = params.autoplay.interval;
				if (params.autoplay.duration) duration = params.autoplay.duration;					
				obj.autoplay = {interval: interval, duration: duration}
				autoplay = true;
			}
		}
		if (params.special && params.special.maxScale && params.special.maxScale < 1
			 && params.special.maxScale > 0) 
		{
			special = true;
			maxScale = params.special.maxScale;
			minScale 
				= params.special.minScale && params.special.minScale < params.special.maxScale
					&&  params.special.maxScale > 0
				? params.special.minScale
				: maxScale;			 
			if (params.special.minOpacity && params.special.minOpacity < 1
				&&  params.special.minOpacity > 0
			) minOpacity = params.special.minOpacity;
		}		
	}

	/* set layout */
	function setLayout() {
		addClass(swiperElem, obj.direction);

		// set swiper width
		if (!params || !params.width) 
			obj.width = width = swiperElem.offsetWidth;
		else {
			width = getPixel(params.width, document.body.clientWidth) || swiperElem.offsetWidth;
			obj.width = width;
		}
		swiperElem.style.width = width+'px';

		// initial sliders
		for (var i = 0; i < sliders.length; i += 1) {	
			sliders[i].style.width = width*maxScale+'px';
			// vertical spacial effect
			if (special && obj.direction === 'vertical') {
				sliders[i].style.width = width+'px';
				sliders[i].style.paddingLeft = ((1-maxScale)*width / 2)+'px';
				sliders[i].style.paddingRight = ((1-maxScale)*width / 2)+'px';
			}
		}		

		// set swiper height
		if (params && params.height)
			height = getPixel(params.height, document.body.clientHeight);
		if (height) {
			swiperElem.style.height = height+'px';	
			obj.height = height;
		} else {
			// when undefined the height, set height after loaded the first slide view
			setHeight();
		}
	}

	/* set swiper height */
	function setHeight() {
		var loadedImgs = 0,
			imgs = sliders[0].getElementsByTagName('img'),

			// callback
			callback = function(){
				loadedImgs += 1;
				if (loadedImgs === imgs.length) {
					height = sliders[0].offsetHeight;

					// special effect
					if (special) {
						height = height/maxScale;
						setSliderStyle();
						if (obj.direction === 'vertical') {
							margin = height*(1-maxScale)/2;
							render(contentElem, 0, margin);
						}
					} 
					// normal effect
					else { 
						for (var i = 0; i < sliders.length; i += 1)
							sliders[i].style.height = height+'px';
					}
					obj.height = height;
					swiperElem.style.height = height+'px';
				}

				// if it's a circular model in the vertical direction, 
				// initialize the content element
				if (obj.effect==='slide' && obj.direction === 'vertical') {							
					stepDistance = height*maxScale;
					if (obj.circular && obj.itemCount > 1) {							
						render(contentElem, 0, -2*stepDistance+margin);	
						currentStep = 2;
					}
				}	
			};

		for (var i = 0; i < imgs.length; i += 1) {
			if (imgs[i].getAttribute('data-src')) {
				lazyLoad(imgs[i], callback);
			} else {
				if (imgs[0].complete) callback();
				else imgs[i].onload = callback;
			}
		}
	}

	/* initialize slide view */
	function initSlideView() {
		// horizontal
		if (obj.direction === 'horizontal') {
			stepDistance = width;

			if (special) {
				addClass(swiperElem, 'special');
				stepDistance = width * maxScale;

				for (var i = 0; i < sliders.length; i += 1) 
					sliders[i].style.width = stepDistance+'px';

				setSliderStyle();
				margin = width*(1-maxScale)/2;
			}

			if (!obj.circular || obj.itemCount === 1) {
				contentElem.style.width = (width*sliders.length+100)+'px';
				render(contentElem, margin);
			} else {
				contentElem.style.width = (width*(sliders.length+4)+100)+'px';
				render(contentElem, -2*stepDistance+margin);
				currentStep = 2;
			}
		} 
		// vertical
		else {
			if (height) {
				stepDistance = height * maxScale;					
				margin = height*(1-maxScale)/2;

				if (special) addClass(swiperElem, 'special');
				setSliderStyle();

				if (obj.circular && obj.itemCount > 1) {							
					render(contentElem, 0, -2*stepDistance+margin);	
					currentStep = 2;
				}					
			}
		}
	}

	/* set slider style */
	function setSliderStyle() {
		var setStyle = function(index) {
				if (obj.circular && obj.itemCount>1 && index===2 || !obj.circular && index===0) {
					render(sliders[index],0,0,1);
					sliders[index].style.opacity = 1;
				} else {
					render(sliders[index],0,0,minScale/maxScale);					
					sliders[index].style.opacity = minOpacity;
				}
			};

		for (var i = 0; i < sliders.length; i += 1) {
			if (obj.direction !== 'horizontal') {
				sliders[i].style.height = height*maxScale+'px';
			} else if (height) {
				sliders[i].style.height = height+'px';
				sliders[i].style.paddingTop = ((1-maxScale)*height / 2)+'px';
				sliders[i].style.paddingBottom = ((1-maxScale)*height / 2)+'px';
			}
			setStyle(i);
		}
	}


	/* register events */	
	var currentX, currentY;
	function registerEvents() {
		// if the device is a mobile device, listen for touch events.
		if (/AppleWebKit.*Mobile.*/.test(navigator.userAgent))
			listenTouchEvents();

		// if the device is a pc device, listen for mouse events.
		else 
			listenMouseEvents();
	}

	/* listen mouse events */
	function listenTouchEvents() {
		// touch start
		contentElem.addEventListener('touchstart', function(e){
			start(e.touches[0].clientX, e.touches[0].clientY);
		});			
		// touch move
		contentElem.addEventListener('touchmove', function(e){
			e.preventDefault();
			move(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
		});
		// touch end
		contentElem.addEventListener('touchend', function(e){
			finish(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
		});
	}

	/* listen mouse events */
	function listenMouseEvents() {
		// mouse down 
		contentElem.onmousedown = function(e){
			e.preventDefault();
			e.stopPropagation();

			start(e.clientX, e.clientY);

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
					if (! swiperElem.getElementsByClassName('mask').length) {
						var mask = document.createElement('div');
						mask.className = 'mask';
						swiperElem.appendChild(mask);
					}
				}

				return false;
			};

			// mouse up 
			document.onmouseup = function(e){
				document.onmousemove = null;
				finish(e.clientX, e.clientY);

				if (swiperElem.getElementsByClassName('mask').length) {
					var el = swiperElem.getElementsByClassName('mask')[0];
					el.parentNode.removeChild(el);
				}	

				if (/WebKit/i.test(navigator.userAgent))
					document.removeEventListener('mousedown', handle, false);
			};
		};		
	}

	/* start */
	function start(x, y) {	
		clearTimeout(timer[0]);
		clearTimeout(timer[1]);	

		if (obj.effect === 'slide')
			contentElem.style[vendorPrefix+'Transition'] = 'all 0ms';
		else 
			sliders[obj.activeIndex].style[vendorPrefix+'Transition'] = 'opacity 0ms';

		if (currentStep > obj.itemCount)
			currentStep %= obj.itemCount;

		if (special) {	
			render(sliders[currentStep], 0, 0, 1);
			sliders[currentStep].style.opacity = 1;
		}

		currentX = x;
		currentY = y;
	}

	/* move */
	function move (x, y) {
		var moveX = x - currentX,
			moveY = y - currentY,
			stepInfo;

		// slide show effect
		if (obj.effect === 'slide') {
			// horizontal
			if (obj.direction === 'horizontal') {
				stepInfo = getStepInfo(currentStep, moveX);
				render(contentElem, -stepInfo.step * stepDistance + stepInfo.dist + margin);
			}
			// vertical
			else {								
				stepInfo = getStepInfo(currentStep, moveY);
				render(contentElem, 0, -stepInfo.step * stepDistance + stepInfo.dist + margin);
			}	
			if (special) {
				if (stepInfo.nextStep && stepInfo.nextStep !== currentStep) {
					var dist = obj.direction === 'horizontal' ? moveX : moveY;
					setSlider(stepInfo.step, stepInfo.nextStep, dist);
				}
			}
		}
		// fade effect
		else if (obj.itemCount > 1) {
			if (obj.direction === 'horizontal' && moveX !== 0)
				stepInfo = getStepInfo(currentStep, moveX);
			if (obj.direction === 'vertical' && moveY !== 0)
				stepInfo = getStepInfo(currentStep, moveY);

			if (stepInfo && stepInfo.nextStep !== currentStep) {
				var opacity = obj.direction === 'horizontal' 
						? Math.abs(moveX)/width
						: Math.abs(moveY)/height;
				sliders[currentStep].style.opacity = 1 - opacity;
				sliders[stepInfo.nextStep].style.opacity = opacity;
			}
		}
	}

	/* finish */
	function finish(x, y) {
		if (!currentX || !currentY) return;

		var moveX = x - currentX,
			moveY = y - currentY,
			prevStep = currentStep,
			stepInfo = getStepInfo(currentStep, obj.direction === 'horizontal' ? moveX : moveY);

		currentStep = stepInfo.nextStep;
		obj.previousIndex = obj.activeIndex;
		obj.activeIndex = currentStep;

		// slide show effect
		if (obj.effect === 'slide') {
			if (obj.circular) 
				obj.activeIndex = currentStep>1 ? currentStep-2 : obj.itemCount-1;
			else {
				if (currentStep < 0) currentStep = 0;
				if (currentStep > obj.itemCount-1) currentStep = obj.itemCount-1;
			}
			contentElem.style[vendorPrefix+'Transition'] = 'all '+duration+'ms';
			setStep(currentStep);

			// special				
			if (special) {
				for (var i = 0; i < sliders.length; i += 1) {
					if (i !== currentStep) {
						sliders[i].style[vendorPrefix+'Transition'] = 'all '+duration+'ms';
						render(sliders[i], 0, 0, minScale/maxScale);
						sliders[i].style.opacity = minOpacity;
					}
				}

				sliders[currentStep].style[vendorPrefix+'Transition']='all '+duration+'ms';
				render(sliders[currentStep], 0, 0, 1);
				sliders[currentStep].style.opacity = 1;
			}
		}
		// fade effect
		else if (obj.itemCount > 1) {
			if (currentStep !== prevStep) {
				sliders[prevStep].style[vendorPrefix+'Transition'] = 'opacity '+duration+'ms';
				sliders[prevStep].style.opacity = 0;
				sliders[currentStep].style[vendorPrefix+'Transition'] = 'opacity '+duration+'ms';
				sliders[currentStep].style.opacity = 1;
			}
		}

		if (indicator) updateIndicator();
		if (arrow) updateArrowButton();
		if (obj.bindchange) obj.bindchange(obj.activeIndex);
		if (autoplay) setPlay();

		currentX = null;
		currentY = null;
	}

	/* get step information */
	function getStepInfo(step, dist) {
		var nextStep;
		// for slide view effect
		if (obj.effect === 'slide') {
			if (obj.circular && obj.itemCount > 1) {
				if (step === 1 && dist > 0) step = obj.itemCount+1;
				if (step === obj.itemCount && dist < 0) step = 0;
			}
			if (!obj.circular && (step === 0 && dist > 0 || step === obj.itemCount-1 && dist < 0)
				|| obj.itemCount === 1
			) dist *= 0.25;

			if (obj.itemCount === 1) nextStep = step = 0;
			else nextStep = dist < 0 ? step+1 : step-1;
		}
		// for fade effect
		else {
			if (dist < 0) {
				if (step < obj.itemCount-1) nextStep = step+1;
				else if (obj.circular) nextStep = 0;
			} else {
				if (step > 0) nextStep = step-1;
				else if (obj.circular) nextStep = obj.itemCount-1;
			}		
		}

		return {step: step, dist: dist, nextStep: nextStep};
	}

	/* set step */
	function setStep(step){	
		if (obj.direction === 'horizontal')
			render(contentElem, -step*stepDistance+margin)
		else
			render(contentElem, 0, -step*stepDistance+margin);
	}

	/* set slider  */
	function setSlider(step, nextStep, moveDist) {
		var maxscale = maxopacity = 1,
			minscale = minScale/maxScale,
			minopacity = minOpacity,
			maxDist = obj.direction === 'horizontal' ? width*maxScale : height*maxScale;

		var num = (maxscale-minscale) / maxDist,
			num1 = (maxopacity-minopacity) / maxDist;

		nextScale = minscale + num * Math.abs(moveDist);
		scale = 1 - num * Math.abs(moveDist);
		nextOpacity = minopacity + num1 * Math.abs(moveDist); 
		opacity = 1 - num1 * Math.abs(moveDist);

		if (nextScale > 1) nextScale = 1;
		if (scale < minscale) scale = minscale;

		if (nextOpacity > 1) nextOpacity = 1;
		if (opacity < minopacity) scale = minopacity;

		sliders[step].style[vendorPrefix+'Transition'] = 'all 0ms';	
		sliders[step].style.opacity = opacity;
		render(sliders[step], 0, 0, scale);
		if (nextStep > -1 && nextStep < sliders.length) {
			sliders[nextStep].style[vendorPrefix+'Transition'] = 'all 0ms';
			sliders[nextStep].style.opacity = nextOpacity;
			render(sliders[nextStep], 0, 0, nextScale);
		}
	}


	/* initialize indicator */
	function initIndicator()  {
		var elem = document.createElement('div');
		elem.className = 'miniswiper-indicator';

		// dots
		if (! autoplay || indicator !== 'circle')
			createIndicatorDots(elem);
		// circle
		else 
			createIndicatorCircles(elem);

		swiperElem.appendChild(elem);
	}

	/* create indicator dots */
	function createIndicatorDots(wrap) {
		for (var i = 0; i < obj.itemCount; i += 1) {
			var dot = document.createElement('span');
			dot.className = i!==0 
				? 'indicator-item indicator-dot' 
				: 'indicator-item indicator-dot indicator-item-active';
			dot.setAttribute('data-index', i);

			wrap.appendChild(dot);
			dot.addEventListener('click', function(){
				obj.slideTo( parseInt(this.getAttribute('data-index')) );
			});
		}	
	}

	/* create indicator circles */
	function createIndicatorCircles(wrap) {
		for (var i = 0; i < obj.itemCount; i += 1) {
			var circle = document.createElement('span'),
				svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
				path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path'),
				path2;

			circle.className = 'indicator-item indicator-circle'; 				
			circle.setAttribute('data-index', i);

			svg.setAttribute('viewBox','0 0 100 100');
			path1.setAttribute('d','M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90');
			path1.setAttribute('stroke-width','14');
			path1.setAttribute('fill-opacity','0');

			path2 = path1.cloneNode(true);
			path2.setAttribute('stroke', '#fff');
			path1.setAttribute('stroke', 'rgba(255,255,255,0.3)');

			svg.appendChild(path1);
			svg.appendChild(path2);
			circle.appendChild(svg);
			wrap.appendChild(circle);

			if (i === 0) {
				path2.style[vendorPrefix+'Transition'] = 'stroke-dashoffset '+interval+'ms';
				addClass(circle, 'indicator-item-active');
			}				
			circle.addEventListener('click', function(){
				obj.slideTo( parseInt(this.getAttribute('data-index')) );
			});
		}		
	}

	/* update indicator */	
	function updateIndicator()  {
		var activedItem = swiperElem.getElementsByClassName('indicator-item-active')[0],
			currentItem = swiperElem.getElementsByClassName('indicator-item')[obj.activeIndex];

		if (activedItem && currentItem) {
			if (autoplay && indicator === 'circle') {
				var prevPath = activedItem.getElementsByTagName('path')[1],
					currentPath = currentItem.getElementsByTagName('path')[1];
				prevPath.style[vendorPrefix+'Transition'] = 'stroke-dashoffset 0ms';
				currentPath.style[vendorPrefix+'Transition'] = 'stroke-dashoffset '+interval+'ms';
			}

			removeClass(activedItem, 'indicator-item-active');
			addClass(currentItem, 'indicator-item-active');
		}
	}	


	/* initialize arrow buttons */
	function initArrowButton() {
		if (obj.itemCount > 1) {
			var prevBtn = document.createElement('div'),
				nextBtn = document.createElement('div');

			prevBtn.className = 'miniswiper-button-prev';
			prevBtn.style.display = obj.circular ? 'block' : 'none';
			prevBtn.addEventListener('click', function(){ obj.slideToPrev() });

			nextBtn.className = 'miniswiper-button-next';
			nextBtn.addEventListener('click', function(){ obj.slideToNext() });

			swiperElem.appendChild(prevBtn);
			swiperElem.appendChild(nextBtn);
		}
	}

	/* update arrow buttons */	
	function updateArrowButton()  {
		if (! obj.circular) {
			var prevBtn = swiperElem.getElementsByClassName('miniswiper-button-prev')[0],
				nextBtn = swiperElem.getElementsByClassName('miniswiper-button-next')[0];

			prevBtn.style.display = obj.activeIndex > 0 ? 'block' : 'none';
			nextBtn.style.display = obj.activeIndex < obj.itemCount-1 ? 'block' : 'none';
		}
	}


	/* autoplay */
	function setPlay(){
		if (obj.itemCount > 1) {
			timer[0] = setTimeout(function(){
				var index = obj.activeIndex < obj.itemCount-1 ?  obj.activeIndex+1 : 0;
				obj.slideTo(index);
			}, interval);
		}
	}


	/* slide to run slide show */
	obj.slideTo = function(index) {
		obj.previousIndex = obj.activeIndex;
		clearTimeout(timer[0]);
		clearTimeout(timer[1]);

		// render the slide view
		var fn = function(){
			contentElem.style[vendorPrefix+'Transition'] = 'all '+duration+'ms';
			setStep(currentStep);
			// special effect
			if (special) {
				for (var i = 0; i < sliders.length; i += 1) {
					sliders[i].style[vendorPrefix+'Transition'] = 'transform '+duration+'ms';

					if (i !== currentStep) {
						render(sliders[i], 0, 0, minScale/maxScale);
						sliders[i].style.opacity = minOpacity;
					}
				}
				sliders[currentStep].style[vendorPrefix+'Transition'] = 'transform '+duration+'ms';
				render(sliders[currentStep], 0, 0, 1);
				sliders[currentStep].style.opacity = 1;
			}
		}

		// slide show effect
		if (obj.effect === 'slide') {
			if (! obj.circular) {	
				obj.activeIndex = currentStep = index;	
				contentElem.style[vendorPrefix+'Transition'] = 'all '+duration+'ms';
				setStep(currentStep);
			} else {
				if (index === 0 && obj.activeIndex === obj.itemCount-1
					|| index === obj.itemCount-1 && obj.activeIndex === 0 && obj.itemCount > 2
				) {
					contentElem.style[vendorPrefix+'Transition'] = 'all 0ms';
					setStep(index===0 ? 1 : obj.itemCount+2);	
				}

				currentStep = index+2;
				obj.activeIndex = index;

				timer[1] = setTimeout(fn,25);
			}
		}
		// fade effect
		if (obj.effect === 'fade') {	
			obj.activeIndex = currentStep = index;
			sliders[obj.previousIndex].style[vendorPrefix+'Transition'] = 'all '+duration+'ms';
			sliders[obj.previousIndex].style.opacity = 0;
			sliders[obj.activeIndex].style[vendorPrefix+'Transition'] = 'all '+duration+'ms';
			sliders[obj.activeIndex].style.opacity = 1;
		}

		if (indicator) updateIndicator();
		if (arrow) updateArrowButton();
		if (obj.bindchange) obj.bindchange(obj.activeIndex);
		if (autoplay) setPlay();
	}


	/* slide to previous slide show */
	obj.slideToPrev = function() {		
		if (obj.activeIndex > 0) 
			obj.slideTo( obj.activeIndex-1 );
		else if (obj.circular)
			obj.slideTo( obj.itemCount-1 );
	}


	/* slide to next slide show */
	obj.slideToNext = function() {
		if (obj.activeIndex < obj.itemCount-1) 
			obj.slideTo( obj.activeIndex+1 );
		else if (obj.circular)
			obj.slideTo( 0 );
	}


	return obj;
}