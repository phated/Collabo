/**
 * Hangout injection to change the DOM.
 *
 * @author Mohamed Mansour 2011 (http://mohamedmansour.com)
 * @constructor
 */
var LAZY_LOAD_MS = 10000;

dojo.declare('HangoutInjection', null,{
	youtubeClassSelector: '.hangout-youtube',
	youtubeClass: 'hangout-youtube',
	youtubeNode: null,
	gameClass: 'hangout-games',
	toolbarCheckedClass: 'hangout-toolbar-button-checked',
	videoId: 'gcmvwi',
	iframeUrl: 'http://tinywebdbjs.appspot.com/embed',
	uniqueKey: '',
	videoDisplay: '',
	gameDisplay: null,
	gameNode: null,
	gameNodeText: 'Collabo',
	gameNodeImage: '/img/hangout-toolbar.png',
	constructor: function(args) {
		dojo.safeMixin(this, args);
		// Parse the Google Hangout Url
		var parsePassOne = window.location.href.split('/hangouts/');
		var parsePassTwo = parsePassOne[1].split('?');
		this.uniqueKey = parsePassTwo[0];
	},
	domInject: function() {
		var youtubeNode = dojo.query(this.youtubeClassSelector)[0];
		this.youtubeNode = youtubeNode;
		if (youtubeNode) {
			//var copyNode = dojo.query(this.youtubeClassSelector)[0];
			var gameNode = dojo.clone(youtubeNode);
			this.gameNode = gameNode;
			dojo.removeClass(gameNode, this.youtubeClass);
			dojo.addClass(gameNode, this.gameClass);
			dojo.attr(gameNode, {id: ':rg'});
			dojo.query('.hangout-toolbar-text', gameNode)[0].innerHTML = this.gameNodeText;
			dojo.query('.hangout-toolbar-icon', gameNode).style('backgroundImage', 'url(chrome-extension://' + chrome.i18n.getMessage('@@extension_id') + this.gameNodeImage + ')');
			dojo.place(gameNode, youtubeNode, 'after');
			
			this.videoDisplay = dojo.byId(this.videoId);
			
			this.gameDisplay = dojo.create('div', {class: 'CSS_LAYOUT_COMPONENT', style: {display: 'none'}}, this.videoDisplay, 'before');
			var iframe = dojo.create('iframe', {src: this.iframeUrl + '?hangoutUrl=' + this.uniqueKey, frameBorder: '0', style: {width: '100%', height: '100%'}}, this.gameDisplay, 'first');
			
			dojo.connect(gameNode, "onclick", this, this.onGameButtonClick);
			dojo.connect(youtubeNode, "onclick", this, this.onYoutubeButtonClick);
		}
	},
	onGameButtonClick: function() {
		if (dojo.hasClass(this.youtubeNode, this.toolbarCheckedClass)) {
			dojo.style(dojo.byId(':mt'), {top: '0', left: '0', width: '0', height: '0'});
			dojo.removeClass(this.youtubeNode, this.toolbarCheckedClass);
		}
		var videoChild = dojo.query(this.videoDisplay).children('div:first-child')[0];
		dojo.toggleClass(this.gameNode, this.toolbarCheckedClass);
		if (dojo.hasClass(this.gameNode, this.toolbarCheckedClass)) { // VISIBLE
			dojo.query(this.gameDisplay).siblings().forEach(function(sibling){
				if (dojo.attr(sibling, 'id') != this.videoId) {
					dojo.style(sibling, {display: 'none'});
				}
			}, this);
			dojo.style(this.gameDisplay, {display: 'block'});
			dojo.style(videoChild, {height: '1px', width: '1px'});
			
		} else { // NOT VISIBLE
			dojo.style(this.gameDisplay, {display: 'none'});
			dojo.style(videoChild, {height: '100%', width: '100%'});
		}
	},
	onYoutubeButtonClick: function() {
		var videoChild = dojo.query(this.videoDisplay).children('div:first-child')[0];
		dojo.removeClass(this.gameNode, this.toolbarCheckedClass);
		dojo.style(this.gameDisplay, {display: 'none'});
		//dojo.style(dojo.byId(':mt'), {display: ''});
		dojo.query(this.gameDisplay).siblings().forEach(function(sibling){
				dojo.style(sibling, {display: 'none'});
		}, this);
		dojo.style(videoChild, {height: '1px', width: '1px'});
		/*if (!dojo.hasClass(this.youtubeNode, this.toolbarCheckedClass)) { // VISIBLE
			dojo.query(this.gameDisplay).siblings().forEach(function(sibling){
				if (dojo.attr(sibling, 'id') != ':ms') {
					dojo.style(sibling, {display: 'none'});
				}
			}, this);
			dojo.style(videoChild, {height: '1px', width: '1px'});
			
		} else { // NOT VISIBLE
			dojo.style(this.gameDisplay, {display: 'none'});
		}*/
	}
})

// Inject
dojo.ready(function(){
	setTimeout(function(){
		var injection = new HangoutInjection();
		injection.domInject();
	}, LAZY_LOAD_MS);
});