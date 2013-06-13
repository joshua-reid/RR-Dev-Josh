$(function() {

	//MAIN MENU
	//active function
	$("*").find("a[href='"+window.location.href+"']").each(function(){
	$(this).addClass("active")});
	//mobile function
	$('.menue').click(function() {
		 if ($(this).is('.open')) {
			$('.mOff').hide();
			$('header nav ul').css('height','0');
			$(this).removeClass('open');
		}
		else {
			$('.mOff').css('display','block');
			$('header nav ul').css('height','auto');
			$(this).addClass('open');
		}
	});

	//CAROUSEL
	$('.carousel').carousel();

   //Tiny MCE Fix
   $('.entry span').not('a.sem-button span').contents().unwrap();
   $('.entry a').not('a.cover-photo').removeAttr('style');

	//SOCIAL SHARE
	var _window = $(window),
      _box = $('#social-box'),
      _text = $('.share-text'),
      _icon = $('#social-tab i')
      _tab = $('#social-box li:not(#social-tab)'),
      offset = $('#social-box').offset(),
      topPadding = 15,
      minimizeThreshold = 480;

  //Affix for Social Bar
  $('#social-box').affix({
	offset: $('#social-box').position()
  });

  // clicking #social-tab toggles other li's
  $('#social-tab').click(function(){
    if ( _tab.hasClass('hide') ) {
      _tab.removeClass('hide');
      _box.css('width','65px');
      _text.addClass('hide');
      _text.removeClass('share-text-rotate');
      _icon.removeClass('icon-circle-arrow-right').addClass('icon-circle-arrow-left');
      $(this).css('height','auto');
    } else {
      _tab.addClass('hide');
      _box.css('width','30px');
      _text.removeClass('hide');
      _text.addClass('share-text-rotate');
      _icon.removeClass('icon-circle-arrow-left').addClass('icon-circle-arrow-right');
      $(this).css('height','90px');
    }
  });

  // when user's window is 480px or less wide,
  // hide social li's
  function checkWidth() {
    var windowsize = _window.width();
    if (windowsize <= 480) {
      _tab.addClass('hide');
      _box.css('width','30px');
      _text.removeClass('hide');
      _text.addClass('share-text-rotate');
      _icon.removeClass('icon-circle-arrow-left').addClass('icon-circle-arrow-right');
      $('#social-tab').css('height','90px');
    }
  }
  checkWidth();
  $(window).resize(checkWidth);

	//FOOTER 
	//accordion nav function
	$('.accordion-button').click(function() {
		$(this).find('.icon-plus').toggleClass('icon-minus');
		$(this).next('.accordion-content').toggle('normal');
	});	
	$(".accordion-content").hide();

});
