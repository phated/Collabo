/**
 * Hangout injection to change the DOM.
 *
 * @author Blaine Bublitz (gplus.to/phated)
 * @constructor
 */
var LAZY_LOAD_MS = 10000;

dojo.declare('HangoutInjection', null,{
	/* Youtube Selectors and Nodes */
	youtubeIframeId: ':kh',
	youtubeClassSelector: '.hangout-youtube',
	youtubeClass: 'hangout-youtube',
	youtubeNode: null,
	/* Video Nodes and Selectors */
	videoId: 'gcmvwi',
	videoDisplay: '',
	videoChild: '',
	/* Created/Injected Nodes */
	gameClass: 'hangout-games',
	gameDisplay: null,
	gameNode: null,
	gameNodeText: 'Collabo',
	gameNodeImage: '/img/hangout-toolbar.png',
	/* Other Utilites */
	toolbarCheckedClass: 'hangout-toolbar-button-checked',
	iframeUrl: 'http://tinywebdbjs.appspot.com/embed',
	uniqueKey: '',
	constructor: function(args) {
		dojo.safeMixin(this, args);
		// Parse the Google Hangout Url
		var parsePassOne = window.location.href.split('/hangouts/');
		var parsePassTwo = parsePassOne[1].split('?');
		this.uniqueKey = parsePassTwo[0];
	},
	domInject: function() {
		/* Retrieve the Youtube node that will be cloned a little later */
		this.youtubeNode = dojo.query(this.youtubeClassSelector)[0];
		if (this.youtubeNode) {
			/* If Youtube node exists, Clone it as gameNode */
			this.gameNode = dojo.clone(this.youtubeNode);
			/* Remove the class that makes the Youtube node special and then give gameNode its own class (this may break something if multiples of this plugin are installed so probably make it unique)*/
			dojo.removeClass(this.gameNode, this.youtubeClass);
			dojo.addClass(this.gameNode, this.gameClass);
			/* Give the gameNode some cool text and image */
			dojo.query('.hangout-toolbar-text', this.gameNode)[0].innerHTML = this.gameNodeText;
			dojo.query('.hangout-toolbar-icon', this.gameNode).style('backgroundImage', 'url(chrome-extension://' + chrome.i18n.getMessage('@@extension_id') + this.gameNodeImage + ')');
			/* Put the gameNode after the Youtube node */
			dojo.place(this.gameNode, this.youtubeNode, 'after');
			/* Retrieve the video node and its child for showing/hiding later */
			this.videoDisplay = dojo.byId(this.videoId);
			this.videoChild = dojo.query(this.videoDisplay).children('div:first-child')[0];
			/* Time to inject our iframe wrapped in a super awesome div */
			this.gameDisplay = dojo.create('div', {class: 'CSS_LAYOUT_COMPONENT', style: {display: 'none'}}, this.videoDisplay, 'before');
			var iframe = dojo.create('iframe', {src: this.iframeUrl + '?hangoutUrl=' + this.uniqueKey, frameBorder: '0', style: {width: '100%', height: '100%'}}, this.gameDisplay, 'first');
			/* Register a couple of onclick events for the Youtube node and the gameNode */
			dojo.connect(this.gameNode, "onclick", this, this.onGameButtonClick);
			dojo.connect(this.youtubeNode, "onclick", this, this.onYoutubeButtonClick);
		}
	},
	onGameButtonClick: function() {
		/* Hide the Youtube stuff if it is shown while the user clicks the gameNode */
		if (dojo.hasClass(this.youtubeNode, this.toolbarCheckedClass)) {
			dojo.style(dojo.byId(this.youtubeIframeId), {top: '0', left: '0', width: '0', height: '0'});
			dojo.removeClass(this.youtubeNode, this.toolbarCheckedClass);
		}
		/* Toggle the look of the gameNode to indicate whether it is active or not */
		dojo.toggleClass(this.gameNode, this.toolbarCheckedClass);
		/* Hide everything that Goggle wants to show....because WE are in control here! */
		dojo.query(this.gameDisplay).siblings().forEach(function(sibling){
			if (dojo.attr(sibling, 'id') != this.videoId) {
				/* Display: none on all siblings of the injected iframe's awesome div wrapper EXCEPT the video display */
				dojo.style(sibling, {display: 'none'});
			} else {
				/* Can't apply Display: none to the video display because it breaks everything, and this seemed to be the only way to "hide" it... */
				dojo.style(sibling, {position: 'absolute', top: '5000px'});
			}
		}, this);
		if (dojo.hasClass(this.gameNode, this.toolbarCheckedClass)) {
			/* Make the injected iframe visible and hide the video display */
			dojo.style(this.gameDisplay, {display: 'block'});
			dojo.style(this.videoChild, {height: '1px', width: '1px'});
		} else {
			/* Hide the injected iframe and show the video display with the super awesome hack that probably shouldn't work but does... */
			dojo.style(this.gameDisplay, {display: 'none'});
			dojo.style(this.videoDisplay, {top: '0'});
			dojo.style(this.videoDisplay, {position: 'relative'});
			dojo.style(this.videoChild, {height: '100%', width: '100%'});
		}
	},
	onYoutubeButtonClick: function() {
		/* Hide the injected stuff if it is shown while the user clicks the Youtube node */
		if (dojo.hasClass(this.gameNode, this.toolbarCheckedClass)) {
			dojo.removeClass(this.gameNode, this.toolbarCheckedClass);
			dojo.style(this.gameDisplay, {display: 'none'});
		}
		if (dojo.hasClass(this.youtubeNode, this.toolbarCheckedClass)) {
			/* Hide the video display so it doesn't get in the way of the Youtube node */
			dojo.style(this.videoChild, {height: '1px', width: '1px'});
		} else {
			/* Display: none on all siblings of the injected iframe's awesome div wrapper EXCEPT the video display */
			dojo.query(this.gameDisplay).siblings().forEach(function(sibling){
				if (dojo.attr(sibling, 'id') != this.videoId) {
					dojo.style(sibling, {display: 'none'});
				}
			}, this);
			/* Display the video display with the super awesome hack that probably shouldn't work but does... */
			dojo.style(this.videoDisplay, {top: '0'});
			dojo.style(this.videoDisplay, {position: 'relative'});
			dojo.style(this.videoChild, {height: '100%', width: '100%'});
		}
	}
})

/* Inject the heck out of that hangout! */
dojo.ready(function(){
	/* We need to do a 10 second timeout because we need to make sure everything is loaded before we do our injection */
	setTimeout(function(){
		/* Instantiate our object and then tell it to inject */
		var injection = new HangoutInjection();
		injection.domInject();
	}, LAZY_LOAD_MS);
});