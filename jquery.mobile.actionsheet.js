/*
 * jquery.mobile.actionsheet v2
 *
 * Copyright (c) 2011, Stefan Gebhardt and Tobias Seelinger
 * Dual licensed under the MIT and GPL Version 2 licenses.
 * 
 * Date: 2011-05-03 17:11:00 (Tue, 3 May 2011)
 * Revision: 2.1
 */
(function($,window){
	$.widget("mobile.actionsheet",$.mobile.widget,{
		options: {
			ok: undefined,
			cancel: undefined
		},
		ok_call: undefined,
		cancel_call: undefined,
		wallpaper: undefined,
		content: undefined,
		_init: function() {
			this.ok_call = this.options.ok;
			this.cancel_call = this.options.cancel;
			//console.log("ok: "+this.ok_call);
			//console.log("cancel: "+this.cancel_call);
			
			var self = this;
			//console.log(this.element.jqmData('sheet'));
			this.content = ((typeof this.element.jqmData('sheet') !== 'undefined')
				? $('#' + this.element.jqmData('sheet'))
				: this.element.next('div')).addClass('ui-actionsheet-content'); //TODO: custom widget
			// Move content to parent page
			// Otherwise there is an error i will describe here soon
			var parentPage = this.element.parents(':jqmData(role="page")');
			this.content.remove().appendTo(parentPage).hide();

			//setup command buttons
			/*
			this.content.find(':jqmData(role="button")').filter(':jqmData(rel!="ok")').filter(':jqmData(rel!="cancel")')
				.addClass('ui-actionsheet-commandbtn');*/
			//setup ok button
			this.content.find(':jqmData(rel="ok")').addClass('ui-actionsheet-closebtn')
				.bind('click', function(){
				console.log('ok');
					if (self.ok_call !== undefined)
						if (self.ok_call() == false)
							return;
					self.close();
				});
			this.content.find(':jqmData(rel="cancel")').addClass('ui-actionsheet-closebtn')
				.bind('click', function(){
					if (self.cancel_call !== undefined)
						self.cancel_call();
					self.close();
				});
			this.element.bind('click', function(){
				self.open();
			});
			if( this.element.parents( ':jqmData(role="content")' ).length !== 0 ) {
				this.element.buttonMarkup();
			}
		},
		open: function() {
			if(this.wallpaper !== undefined) //this function will call twice if call actionsheet in js. why? init twice?
				this.wallpaper.remove();
			this.element.unbind('click'); //avoid twice opening
			var cc = this.content.parents(':jqmData(role="page")');
			this.wallpaper = $('<div>', {'class':'ui-actionsheet-wallpaper'}).appendTo(cc).show();
			
			//window.setTimeout($.proxy(this._wbc, this), 500);
			this.wallpaper.bind("click",$.proxy(function(e) { e.preventDefault();/*this.close();*/ },this));
			this._positionContent();

			$(window).bind('orientationchange.actionsheet',$.proxy(function () {
				this._positionContent();
			}, this));
		
			if( $.support.cssTransitions ) {
				this.content.animationComplete(function(event) {
						$(event.target).removeClass("ui-actionsheet-animateIn");
					});
				this.content.addClass("ui-actionsheet-animateIn").show();
			} else {
				this.content.fadeIn();
			}
		},
		close: function(event) {
			var self = this;
			this.wallpaper.unbind('click');
			$(window).unbind('orientationchange.actionsheet');
			if( $.support.cssTransitions ) {
				this.content.addClass("ui-actionsheet-animateOut");
				this.wallpaper.remove();
				this.content.animationComplete(function() {
					self.reset();
				});
			} else {
				this.wallpaper.remove();
				this.content.fadeOut();
				this.element.bind('click', function(){
					self.open();
				});
			}
		},
		reset: function() {
			this.wallpaper.remove();
			this.content.removeClass("ui-actionsheet-animateOut").removeClass("ui-actionsheet-animateIn").hide();
			var self= this;
			this.element.bind('click', function(){self.open();});
		},
		_positionContent: function() {
			var height = $(window).height(),
				width = $.mobile.activePage.width(), //page center, not window center
				scrollPosition = $(window).scrollTop();
			//console.log("h: " + height + " w: " + width + " s: " +scrollPosition);
			this.content.css({
				'top': (scrollPosition + height / 2 - this.content.height() / 2),
				'left': (width / 2 - this.content.width() / 2)
			});
		}
	});

	$( ":jqmData(role='page')" ).live( "pagecreate", function() { 
		$( ":jqmData(role='actionsheet')", this ).each(function() {
			$(this).actionsheet();
		});
	});

}) (jQuery,this);
