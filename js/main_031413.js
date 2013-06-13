$(function() {

	//Main menu active function
	$("*").find("a[href='"+window.location.href+"']").each(function(){
	$(this).addClass("active")});

	//Main menu mobile function
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

	//Carousel
	$('.carousel').carousel();

	//Footer accordion nav function
	$('.accordion-button').click(function() {
		$(this).find('.icon-plus').toggleClass('icon-minus');
		$(this).next('.accordion-content').toggle('normal');
	});	
	$(".accordion-content").hide();

});