// Reply Javascript Object
var Reply = Reply || {};
window.Reply = Reply;

// support function from reply_cmp.js
Reply.UrlParam = function(name){
  var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results === null) {
    return "";
  }
  return results[1] || "";
};

// support functions from SinglePage.js
Reply.GetAjaxData = function (callBack, url) {
  Reply.api_calls.push(url);
  $.ajax({
    type: "POST",
    url: url,
    dataType: 'JSONP',
    success: function (data) {
      callBack(data);
    },
    error: function (data) {
      Reply.CatchError(callBack, data);
    }
  });
};

Reply.CatchError = function (callBack, cData) {
  Reply.err = cData;
  // check if the latest api call contains 'AutoClick'
  if (/AutoClick/.test(Reply.api_calls[Reply.api_calls.length-1])) {}
};

Reply.ValidateZipCode = function (geoData) {
  var url = 'http://m.reply.com/Handler/SubmitAutoClickHandler.ashx?',
    project_form = $('fieldset#project_info'),
    contact_form = $('fieldset#contact_info'),
    current_model_id = $('#TopPcModelDropDown option:selected').val(),
    zip_code = $('#TopPcZipCode').val(),
    params = 'zipcode=' + zip_code + '&trimid=' + current_model_id + '&adid=' + Reply.adid + '&subid=' + Reply.subid;

  Reply.geo = geoData;
  if (geoData.success) {
    // send off for wait queue id, saved to Reply.waitQueueId
    Reply.GetAjaxData(Reply.SetWaitQueueId, url + params);
    Reply.ShowContact();
  } else {
    Reply.ShowStep1();
    Validation.addError('input.enterzip', 'Invalid ZIP code');
  }
};

Reply.SetWaitQueueId = function (wqidData) {
  if (wqidData.success === true) {
    Reply.waitQueueId = wqidData.wqid;
  } else {
    Reply.waitQueueId = 'rejected';
  }
};

Reply.SubmittedLead = function (lData) {
  Reply.lead = lData;
  if (lData.Valid === "1") {
    Reply.ShowOverlay();
    Count = 0;
    Reply.DSCallBack(Reply.waitQueueId);
  } else if (lData.Valid === "0") {
    Reply.ShowThankYou();
    // for testing on non-Production clouds, show DS to Invalid Lead
    if (!Reply.isProduction) {
      Reply.ShowOverlay();
      Count = 0;
      Reply.DSCallBack(Reply.waitQueueId);
    }
  }
};

Reply.DSCallBack = function (wqid) {
  var url = 'http://m.reply.com/Handler/GetDealerSelectHandler.ashx?',
    ran = escape(Math.random()),
    params = '';

  params = 'wqid=' + wqid + '&ran=' + ran + '&adid=' + Reply.adid;
  Reply.GetAjaxData(Reply.DSCheck, url + params);
};

Reply.DSCheck = function (dsData) {
  // cache dealers data in global variable window.Reply.dealers
  Reply.dealers = dsData.Dealers;
  if (dsData.Retry) {
    Count++;
    if (Count < 10) {
      setTimeout(function () { Reply.DSCallBack(Reply.waitQueueId); }, 1000);
    } else {
      Reply.ShowThankYou();
    }
  } else {
    Reply.ShowOverlay();
    Reply.BuildDealerSelect();
    Reply.ShowDealerSelect();
  }
};

Reply.BuildDealerSelect = function (dealers) {
  var html = '';

  $.each(Reply.dealers, function (i, item) {
    html += '<div class="dealerSel' + ((item['PreSelected']) ? ' preferred' : '') + '">' +
      '<h4><input class="dCheckBox" type="checkbox" ' + ((item['PreSelected']) ? ' checked' : '') + ' value="' + item['Zipcode'] + '"/>' +
      item['Name'] + '</h4>' +
      '<span>' + item['Address'] + '</span>' +
      '<span>' + item['City'] + ' ' + item['State'] + ', ' + item['Zipcode'] + '</span>' +
      '</div>';
  });
  $('.buyer_field').html(html);
};

Reply.SubmittedDS = function (response) {
  if (response.success) {
    Reply.ShowThankYou();
  } else {
    Reply.ShowDealerSelect();
  }
};

// Reply.dropdown object stores utility functions for auto dropdowns
Reply.dropdown = {};
Reply.dropdown.BuildMakes = function() {
  var makes = Reply.autos,
    select_make = jQuery("#TopPcMakeDropDown");

  select_make.empty();
  html = '<option value="" selected="selected">' + Reply.dropdown.make_default + '</option>';
  html = html + jQuery.map(makes, function (s) { return '<option value="' + s.MakeId + '">' + s.MakeName + "</option>\n"; }).join('');
  select_make.append(html);
};
Reply.dropdown.SelectMake = function(make) {
  var select_make = jQuery("#TopPcMakeDropDown");

  // select option with default make
  $("option:contains(" + Reply.dropdown.make_prepop + ")", select_make).attr('selected', 'selected');
  current_make_id = $("option:contains(" + Reply.dropdown.make_prepop + ")", select_make).val();
  // select_model.change();
};
Reply.dropdown.BuildModels = function() {
  var select_model = jQuery("#TopPcModelDropDown"),
    current_make_id = jQuery("#TopPcMakeDropDown").val(),
    makes = Reply.autos,
    models = jQuery.map(makes, function (s) { if (parseInt(s.MakeId, 10) === parseInt(current_make_id, 10)) { return jQuery.map(s.Models, function (t) { return t; }); } });

  // build models dropdown for Template Variables
  select_model.empty();
  html = '<option value="" selected>' + Reply.dropdown.model_default + '</option>';
  if (current_make_id !== "") {
    html = html + jQuery.map(models, function (s) { return '<option value="' + s.DefaultTrimId + '">' + s.ModelName + "</option>\n"; }).join('');
  }
  select_model.append(html);
};
Reply.dropdown.SelectModel = function(model) {
  var select_model = jQuery("#TopPcModelDropDown"),
    this_model = Reply.dropdown.model_prepop;
console.log(this_model);
  // select option with default make
  if (this_model === "") {
    $("option:first", select_model).attr('selected', 'selected');
  } else {
    $("option:contains(" + this_model + ")", select_model).attr('selected', 'selected');
  }
};
Reply.dropdown.LoadPhoto = function(model) {
  var imagePath = '',
    makes = Reply.autos,
    models = jQuery.map(makes, function (s) { if (parseInt(s.MakeId, 10) === parseInt(current_make_id, 10)) { return jQuery.map(s.Models, function (t) { return t; }); } }),
    select_model = jQuery("#TopPcModelDropDown"),
    auto_img = jQuery('#TopPcVehicleImage');

  if (Reply.dropdown.model_prepop === Reply.dropdown.model_default) {
    auto_img.attr('src', img_default);
  } else {
    $("option:contains(" + Reply.dropdown.model_prepop + ")", select_model).attr('selected', 'selected');
    current_model_id = jQuery("#TopPcModelDropDown option:selected").val();

    // collect image url from cached data using current_model_id
    imagePath = jQuery.map(models, function (u) {if (parseInt(u.DefaultTrimId, 10) === parseInt(current_model_id, 10)) { return u.CMImage; } });
    if (imagePath == "/Images/dImage.png") { auto_img.attr('src', img_default); }
      else { auto_img.attr('src', imagePath); }
  }
};

Reply.Init = function () {
  // build makes and models dropdowns on page load using cached autos data

  // - build make dropdown
  Reply.dropdown.BuildMakes();

  // - select make from prepop
  Reply.dropdown.SelectMake( Reply.dropdown.make_prepop );

  // - build model dropdown
  Reply.dropdown.BuildModels();

  // - select model from prepop
  Reply.dropdown.SelectModel( Reply.dropdown.model_prepop );

  // - load image for model from prepop
  Reply.dropdown.LoadPhoto();
};

Reply.ShowStep1 = function () {
  $('#project_info .main-button').val('Continue').css({opacity: '1.0', filter: 'alpha(opacity=100)'}).removeAttr('disabled', 'disabled');
  $("fieldset#project_info").slideDown();
  $("fieldset#contact_info").fadeOut();
  $("fieldset#overlay").fadeOut();
  $("fieldset#dealer_select").fadeOut();
  jQuery('#TopPcZipCode').select();
  return true;
};

Reply.ShowContact = function () {
  $('#contact_info .main-button').val('See Quotes!').css({opacity: '1.0', filter: 'alpha(opacity=100)'}).removeAttr('disabled', 'disabled');
  $("fieldset#contact_info").slideDown();
  $("fieldset#project_info").fadeOut();
  $("fieldset#overlay").fadeOut();
  $("fieldset#dealer_select").fadeOut();
  jQuery('#first_name').select();
  return true;
};

Reply.ShowThankYou = function () {
  $("fieldset#thank_you").slideDown();
  $("fieldset#contact_info").fadeOut();
  $("fieldset#overlay").fadeOut();
  $("fieldset#dealer_select").fadeOut();
  return true;
};

Reply.ShowOverlay = function () {
  $("fieldset#overlay").slideDown();
  $("fieldset#contact_info").fadeOut();
  $("fieldset#dealer_select").fadeOut();
  $("fieldset#thank_you").fadeOut();
  return true;
};

Reply.ShowDealerSelect = function () {
  $("fieldset#dealer_select").slideDown();
  $("fieldset#overlay").fadeOut();
  $("fieldset#contact_info").fadeOut();
  $("fieldset#thank_you").fadeOut();
  return true;
};

// internal article link clicked
Reply.ClickArticle = function (pixel_trade) {
  _gaq.push(['_trackEvent', 'Article Links', 'Clicked', 'Article Link']);
};

// internal trade link clicked
Reply.ClickTrade = function (pixel_trade) {
  _gaq.push(['_trackEvent', 'Article Links', 'Clicked', 'Trade Link (' + pixel_trade + ')']);
};

// external website link clicked
Reply.ClickExternal = function (pixel_trade) {
  _gaq.push(['_trackEvent', 'Article Links', 'Clicked', 'External Link']);
};

jQuery(document).ready(function () {

  var isMobile = {
      Android: function() { return navigator.userAgent.match(/Android/i); },
      BlackBerry: function() { return navigator.userAgent.match(/BlackBerry/i); },
      iOS: function() { return navigator.userAgent.match(/iPhone|iPad|iPod/i); },
      Opera: function() { return navigator.userAgent.match(/Opera Mini/i); },
      Windows: function() { return navigator.userAgent.match(/IEMobile/i); },
      any: function() { return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()); }
    },
    isProduction = (window.location.href.indexOf('reply.com') === -1) ? 0: 1;

  // automobiles
  if (jQuery("#WidgetAutos")) {
    var url = 'http://m.reply.com/Handler/AutoDataHandler.ashx?callback=?',
      img_default = 'http://reply-articles.reply.modxcloud.com/assets/images/forms/car_130x98.png',
      adid_hidden = jQuery('input[name=adid]').val(),
      subid_hidden = jQuery('input[name=subid]').val(),
      make_prepop = jQuery("#TopPcMakeDropDown option"),
      model_prepop = jQuery("#TopPcModelDropDown option"),
      this_selected = "";

    Reply.autos = null;
    Reply.waitQueueId = null;
    Reply.dropdown.make_prepop = null;
    Reply.dropdown.model_prepop = null;
    Reply.dropdown.make_default = "SELECT MAKE";
    Reply.dropdown.model_default = "SELECT MODEL";
    Reply.adid = 52150;
    if (adid_hidden !== "") Reply.adid = adid_hidden;
    if (Reply.UrlParam("adid") !== "") Reply.adid = Reply.UrlParam("adid");
    Reply.subid = null;
    if (subid_hidden !== "" && typeof subid_hidden !== "undefined") Reply.subid = subid_hidden;
    if (Reply.UrlParam("subid") !== "") Reply.subid = Reply.UrlParam("subid");
    Reply.api_calls = [];
    Reply.estimate_link = {};
    Reply.isProduction = isProduction;

    // autotab_magic on three-box phone entry, requires jquery.autotab...
    $("#PhoneArea, #PhonePrefix, #PhoneSuffix").autotab_magic().autotab_filter('numeric');

    // MODx is placing the prepop value for articles, here we capture that value
    if (make_prepop.length === 1) {
      Reply.dropdown.make_prepop = (make_prepop.text() === "") ? Reply.dropdown.make_default : make_prepop.text() ;
      Reply.dropdown.model_prepop = (model_prepop.text() === "") ? Reply.dropdown.model_default : model_prepop.text() ;
    }

    // retreive autos data from Reply! 
    jQuery.getJSON(url, null, function (json) {
      // cache autos data in global variable window.Reply.autos
      Reply.autos = json;
      Reply.api_calls.push(url);

      // initial setup of page
      Reply.Init();
    });

    // build models dropdown when make selected
    jQuery("#TopPcMakeDropDown").change(function (e) {
      var auto_img = jQuery('#TopPcVehicleImage');

      auto_img.attr('src', img_default);

      Reply.dropdown.BuildModels();
      Reply.dropdown.SelectModel( Reply.dropdown.model_prepop );
    });

    // load vehicle image when model selected
    jQuery("#TopPcModelDropDown").change(function (e) {
      var current_make_id = jQuery("#TopPcMakeDropDown option:selected").val(),
        current_model_id = jQuery("#TopPcModelDropDown option:selected").val(),
        auto_img = jQuery('#TopPcVehicleImage'),
        models = '';

      // filter models
      models = jQuery.map(Reply.autos, function (s) { if (parseInt(s.MakeId, 10) === parseInt(current_make_id, 10)) { return jQuery.map(s.Models, function (t) { return t; }); } });

      if (current_model_id !== "") {
        var imagePath = "";

        // collect image url from cached data using current_model_id
        imagePath = jQuery.map(models, function (u) {if (parseInt(u.DefaultTrimId, 10) === parseInt(current_model_id, 10)) { return u.CMImage; } });
        if (imagePath == "/Images/dImage.png") { auto_img.attr('src', img_default); }
          else { auto_img.attr('src', imagePath); }
      } else { auto_img.attr('src', img_default); }

      $('#TopPcZipCode').select();
    });

    // validate make/model + zip and load contact form
    jQuery('#ProjectSubmit').click(function (event) {
      event.preventDefault();
      var url = 'http://m.reply.com/Handler/CityStateZipValidationHandler.ashx',
        project_form = $('fieldset#project_info'),
        contact_form = $('fieldset#contact_info'),
        current_make_id = jQuery('#TopPcMakeDropDown option:selected').val(),
        current_model_id = jQuery('#TopPcModelDropDown option:selected').val(),
        zip_code = jQuery('#TopPcZipCode').val(),
        zip_codeStep2 = jQuery('#step_2_zip'),
        initial_field = jQuery('#first_name'),
        zipRegEx = /(^)(\d{5})($)/g;

      if (Validation.validateAll($('fieldset#project_info'))) {
        // show contact form
        $('.mini_form_container').popover('hide');
        project_form.find('input[type=submit]').val('loading...').css({opacity: '0.5', filter: 'alpha(opacity=50)'}).attr('disabled', 'disabled');
        zip_codeStep2.html(zip_code);

        // validate zipcode
        if (current_model_id !== "" && current_model_id !== null && zip_code.length === 5) {
          Reply.GetAjaxData(Reply.ValidateZipCode, url + '?input=' + zip_code);
        } else {
          $("#TopPcZipCode").select();
        }
      }

    });

    jQuery('#ContactSubmit').click(function (event) {
      event.preventDefault();
      var url = 'http://m.reply.com/Handler/SubmitAutoLeadHandler.ashx?',
        contact_form = $('fieldset#contact_info'),
        first_name = $("#first_name").val(),
        last_name = $("#last_name").val(),
        address = $("#address").val(),
        phone = $("#PhoneArea").val() + $("#PhonePrefix").val() + $("#PhoneSuffix").val(),
        email = $("#email").val(),
        zip_code = $("#TopPcZipCode").val(),
        current_make_id = jQuery('#TopPcMakeDropDown option:selected').val(),
        current_model_id = jQuery('#TopPcModelDropDown option:selected').val(),
        modelId = "",
        params = "";

      // collect ModelId from cached data using current_model_id, which is actually DefaultTrimId - due to it's uniqueness
      Reply.trimid = current_model_id;
      modelId = jQuery.map(Reply.autos, function (s) { if (parseInt(s.MakeId, 10) === parseInt(current_make_id, 10)) { return jQuery.map(s.Models, function (t) { if (parseInt(t.DefaultTrimId, 10) === parseInt(current_model_id, 10)) { return t.ModelId; } else { return; } }); } }).join("");
      params = "FirstName=" + escape(first_name) +
        "&LastName=" + escape(last_name) +
        "&EmailAddress=" + escape(email) +
        "&StreetAddress=" + escape(address) +
        "&ZipCode=" + zip_code +
        "&PhoneNumber=" + phone +
        "&wqid=" + Reply.waitQueueId +
        "&trimid=" + Reply.trimid +
        "&adid=" + Reply.adid;

      if (Validation.validateAll( contact_form ) ) {
        contact_form.find('input[type=submit]').val('submitting...').css({opacity: '0.5', filter: 'alpha(opacity=50)'}).attr('disabled', 'disabled');
        Reply.GetAjaxData(Reply.SubmittedLead, url + params);
      }
    });
    // back button on Contact Form
    jQuery('.back_button').click(function (event) {
      Reply.ShowStep1();
    });

    // when user clicks on cta button at page bottom, send to sidebar lead form
    jQuery('a.sem-btn-automotive').click(function (event) {
      event.preventDefault();
      var anchor = $("a[name='widget_side']"); // to use: anchor.offset().top for animation
      $(this).attr('href', '');

      // toggle popover
      $('.mini_form_container').popover('show');

      // scroll to top, only if not mobile
      if (!isMobile.any() ) {
        $('html,body').animate({ scrollTop: 0 },'slow');
      }
      // focus zip
      setTimeout( function () {$('#TopPcZipCode').select();}, 600 );
      // custom event
      _gaq.push(['_trackEvent', 'Autos Widget', 'Clicked', 'Bottom CTA Button']);
      return false;
    });
    // use popover from bootstrap
    $('.mini_form_container').popover({
      content: 'Start Here!',
      trigger: 'manual',
      placement: 'top'
    });

    // catch autos links outgoing from footer links, 
    // redirect user to on-page form
    /*
    $('ul.accordion-content').siblings('a[title=Automotive]').click(function (ev) {
      ev.preventDefault();
      $(this).attr('href', '');
      jQuery("#TopPcMakeDropDown option:selected").removeAttr('selected');
      jQuery("#TopPcModelDropDown option:selected").removeAttr('selected');
        // toggle popover
        $('.mini_form_container').popover('show');

        // scroll to top, only if not mobile
        if (!isMobile.any() ) {
          $('html,body').animate({ scrollTop: 0 },'slow');
        }
        // focus zip
        setTimeout( function () {$('#TopPcZipCode').select();}, 600 );
        // custom event
        _gaq.push(['_trackEvent', 'Autos Widget', 'Clicked', 'Bottom Footer Link']);
        return false;
    }); */
    $('ul.accordion-content a').click(function (ev) {
      var target = this.href,
        reply = /reply.com/,
        modx = /modxcloud.com/,
        trade = /.com\/(.*?)\//,
        article = /.com\/.*?\/(.*?)/,
        newcar = /newcar-pricing/,
        make = /make=(.*?)\&/,
        model = /model=(.*?)\&/,
        adid = /adid=(.*?)\&/,
        subid = /subid=(.*?)\&/;

      if ( /(^javascript|#$)/.test(target) === false ) { ev.preventDefault(); }
      else { return true; }

      if ( newcar.test(target) ) {
        // internal link type: automotive
        Reply.estimate_link.trade = "automotive";

        // determine make, adid, and subid from regex capture groups
        match_make = target.match(make);
        if ( match_make !== null && match_make.length > 1 ) {
          Reply.estimate_link.make = match_make[1];
          Reply.dropdown.make_prepop = Reply.estimate_link.make;
        } else {
          Reply.dropdown.make_prepop = "";
        }
        match_model = target.match(model);
        if ( match_model !== null && match_model.length > 1 ) {
          Reply.estimate_link.model = match_model[1];
          Reply.dropdown.model_prepop = Reply.estimate_link.model;
        } else {
          Reply.dropdown.model_prepop = "";
        }
        match_adid = target.match(adid);
        if ( match_adid !== null && match_adid.length > 1 ) {
          Reply.estimate_link.adid = match_adid[1];
        }
        match_subid = target.match(subid);
        if ( match_subid !== null && match_subid.length > 1 ) {
          Reply.estimate_link.subid = match_subid[1];
        }

        // send user to widget on this page
        // $(this).attr('href', '');

        // prepop form with link's make and model
        Reply.dropdown.SelectMake();
        Reply.dropdown.SelectModel();

        // toggle popover
        $('.mini_form_container').popover('show');

        // scroll to top, only if not mobile
        if (!isMobile.any() ) {
          $('html,body').animate({ scrollTop: 0 },'slow');
        }
        // focus zip
        setTimeout( function () {$('#TopPcZipCode').select();}, 600 );
        // custom event
        _gaq.push(['_trackEvent', 'Autos Widget', 'Clicked', 'Bottom Footer Link']);
        return false;

      } else {
        // link to external domain
        Reply.estimate_link.trade = "other";
        window.open(target);
      }
    });

    jQuery('#DealerSubmit').click(function (event) {
      event.preventDefault();
      var url = 'http://m.reply.com/Handler/SubmitDsHandler.ashx?',
        dealer_form = $('fieldset#dealer_select'),
        dealersZips = $(".dCheckBox:checkbox:checked").map(function () { return escape($(this).val()); }).get().join(","),
        params = "DealersZips=" + dealersZips + "&wqid=" + Reply.waitQueueId + "&adid=" + Reply.adid;

      if ( dealersZips === "" ) {
        alert('Please at least select one dealer that you are interested in.');
      } else {
        dealer_form.find('input[type=submit]').val('submitting...').css({opacity: '0.5', filter: 'alpha(opacity=50)'}).attr('disabled', 'disabled');
        Reply.GetAjaxData(Reply.SubmittedDS, url + params);
      }
    });

  } // end automobiles

}); // document ready
