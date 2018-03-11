# Miniswiper

This is a simple swiper, it will helps you to easily create a slide container view for webpage.


## License

Code is under the [MIT License](https://github.com/miniswiper/miniswiper/blob/master/LICENSE)


## Constructor Options

|key|usable values|default|options|
|:---|---|---|---|
|`effect`|`'slide'`, `'fade'`|`'slide'`|`String`|
|`direction`|`'horizontal'`, `'vertical'`|`'horizontal'`|`String`|
|`width`|`'auto'`, `'{Number}px'`, `'{Number}%'`|`'auto'`|`Number` or `String`|
|`height`|`'auto'`, `'{Number}px'`, `'{Number}%'`|`'auto'`|`Number` or `String`|
|`circular`|`true`, `false`|`false`|`Boolean`|
|`indicator`|`true`, `false`, `'circle'`|`false`|`Boolean` or `String`|
|`arrow`|`true`,`false`|`false`|`Boolean`|
|`autoplay`|`true`, `false`, object|`false`|`Boolean` or `Object`|
|- `interval`|integer|`3000`|`Number`|
|- `duration`|integer|`300`|`Number`|
|`special`|`null`, object|`null`|`Object`|
|- `maxScale`|positive number(<= 1)|`1`|`Number`|
|- `minScale`|positive number(<= special.maxScale)|`1`|`Number`|
|`bindchange`|`function(index){...}`|`null`|`Function`|


## Example

Please visit the [Miniswiper Examples](https://miniswiper.github.io/miniswiper/example/index.html)
