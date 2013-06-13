//This file is used for Top Sliding Widgets in MC listing pages -Parham 11-05-2012
jQuery(document).ready(function () {
    //Location Calls
    var listZip = jQuery('#widg_listZip').val();
    var listCity = jQuery('#widg_listCity').val();
    var listState = jQuery('#widg_listState').val();
    if (listZip === '' || listZip === undefined || listZip === 'undefined') {
        listCity = jQuery('#TopListCity').val();
        listState = jQuery('#TopListState').val();
        if (listCity !== '' && listCity !== undefined && listState !== '' && listState !== undefined) {
            jQuery.getJSON('/quotes/homevalues/Handler/CityStateZipValidationHandler.ashx?input=' + listCity + ', ' + listState, function (data) {
                if (data.success) {
                    jQuery('#TopPcZipCode').val(data.zipcode);
                    jQuery('#TopPcCity').val(data.city);
                    jQuery('#TopPcState').val(data.state);
                } else { jQuery('#TopPcChangeLocationLink').click(); }
            });
        } else { jQuery('#TopPcChangeLocationLink').click(); }
    } else {
        jQuery('#TopPcZipCode').val(listZip);
        jQuery('#TopPcCity').val(listCity);
        jQuery('#TopPcState').val(listState);
        try { jQuery('.TopPcLocation').html(listCity + ', ' + listState); } catch (ex) { }
    }
    jQuery('#TopPcChangeLocationLink').click(function () {
        jQuery(this).hide(400);
        jQuery('.topPC-hideMe').show(400);
    });
    jQuery('#TopPcChangeLocationBtn').click(function (event) {
        event.preventDefault();
        var input = jQuery('#TopPcLocationTextBox').val();
        jQuery.getJSON('/quotes/homevalues/Handler/CityStateZipValidationHandler.ashx?input=' + input, function (data) {
            if (data.success) {
                jQuery('#TopPcZipCode').val(data.zipcode);
                jQuery('#TopPcCity').val(data.city);
                jQuery('#TopPcState').val(data.state);
                jQuery('#TopPcChangeLocationLink').show(400);
                jQuery('.topPC-hideMe').hide(400);
                try { jQuery('.TopPcLocation').html(data.city + ', ' + data.state); } catch (ex) { }
            } else { alert("Please enter a valid zip code or city, state."); }
        });
        return false;
    });
    //Home Improvement
    if (jQuery('#TopPcHIClickSubmit') !== null && jQuery('#TopPcHIClickSubmit').length > 0) {
        jQuery.getJSON('/quotes/contractorestimates/Handler/GetAllCategoriesHandler.ashx', function (categories) {
            jQuery('#TopPcHICategoryDropDown').html(""); jQuery('#TopPcHICategoryDropDown').append(jQuery("<option></option>").val('').html('Select Category'));
            jQuery.each(categories, function () { jQuery('#TopPcHICategoryDropDown').append(jQuery("<option></option>").val(this['id']).html(this['name'])); });
            var navCatId = jQuery('#NavCatId').val();
            if (navCatId !== undefined && navCatId !== '') {
                jQuery.getJSON('/quotes/contractorestimates/Handler/GetCategoryMatchByMCCategoryHandler.ashx?navcatid=' + navCatId, function (match) {
                    if (match.HasMatch) {
                        var exists = 0 != jQuery('#TopPcHICategoryDropDown option[value='+match.Matches[0].CategoryId+']').length;
                        if (exists) {
                            jQuery('#TopPcHICategoryDropDown').val(match.Matches[0].CategoryId);
                            jQuery('#TopPcHICategoryDropDown').change();
                        }
                    }
                });
            } else { jQuery('#TopPcHICategoryDropDown').change(); }
        });
        jQuery("#TopPcHICategoryDropDown").change(function () {
            var categoryId = jQuery(this).val();
            var categoryName = jQuery("#TopPcHICategoryDropDown option:selected").text();
            if (categoryId !== "") {
                jQuery('#TopPcHISubCategoryDropDown').html(""); jQuery('#TopPcHISubCategoryDropDown').append(jQuery("<option></option>").val('Select Project').html('Select Project'));
                jQuery.getJSON('/quotes/contractorestimates/Handler/GetSubCategoryByCategoryIdHandler.ashx?categoryid=' + categoryId, function (subCategories) {
                    jQuery.each(subCategories, function () { jQuery('#TopPcHISubCategoryDropDown').append(jQuery("<option></option>").val(this['name']).html(this['name'])); });
                    if (subCategories === '') { jQuery('#TopPcHISubCategoryDropDown').parent().hide(); } else { jQuery('#TopPcHISubCategoryDropDown').parent().show(); }
                });
            } else {
                jQuery('#TopPcHISubCategoryDropDown').html("");
                jQuery('#TopPcHISubCategoryDropDown').parent().hide();
            }
            jQuery('#TopPcHISubCategoryDropDown').change();
        });
        jQuery('#TopPcHIClickSubmit').click(function (event) {
            event.preventDefault();
            var categoryId = jQuery('#TopPcHICategoryDropDown').val();
            var categoryName = jQuery('#TopPcHICategoryDropDown option:selected').text();
            var subCategory = jQuery('#TopPcHISubCategoryDropDown:visible').val();
            var zipCode = jQuery('#TopPcZipCode').val();
            if (categoryId === "") { alert("Please select a Category"); return false; } if (subCategory == "Select Project") { alert("Please select a Project"); return false; }
            window.ShowLoadingDiv('Searching for ' + categoryName + ' Estimates', 'Presented By Contractor');
            if (subCategory === undefined) { subCategory = ''; }
            jQuery.getJSON('/quotes/ContractorEstimates/Handler/ConsumerSelectHandler.ashx?categoryid=' + categoryId + "&subcategory=" + subCategory + "&zipcode=" + zipCode + '&adid=83661', function (cmpResults) {
                var leadurl = "/quotes/ContractorEstimates/Contact.aspx?categoryid=" + categoryId + "&subcategory=" + subCategory + "&zipcode=" + zipCode + "&trackingid=" + cmpResults.TrackingId + '&adid=83661';
                window.ShowConsumerSelectDiv(cmpResults, leadurl, 'We Found Free ' + categoryName + ' Estimates');
            });
            return false;
        });
    }
    //Autos
    if (jQuery('#TopPcAutoClickSubmit') !== null && jQuery('#TopPcAutoClickSubmit').length > 0) {
        jQuery.getJSON('/quotes/autos/Handler/MakeListHandler.ashx', function (makes) {
            jQuery('#TopPcMakeDropDown').html(""); jQuery('#TopPcMakeDropDown').append(jQuery("<option></option>").val('Select Make').html('Select Make'));
            jQuery.each(makes, function () { jQuery('#TopPcMakeDropDown').append(jQuery("<option></option>").val(this['ID']).html(this['Make'])); });
        });
        jQuery("#TopPcMakeDropDown").change(function () {
            jQuery('#TopPcModelDropDown').html(""); jQuery('#TopPcModelDropDown').append(jQuery("<option></option>").val('Select Model').html('Select Model'));
            var make = jQuery(this).val(); var modelDdl = jQuery('#TopPcModelDropDown');
            if (make != "Select Make") {
                jQuery.getJSON('/quotes/autos/Handler/ModelListHandlerMultiPng.ashx?make=' + make, function (models) {
                    jQuery.each(models, function () { var opt = jQuery("<option></option>").val(this['ID']).html(this['Model']); opt.data('vImg', this['Image']); modelDdl.append(opt); });
                });
                if (jQuery('.TopPcMakeNameTitle').length > 0) { jQuery('.TopPcMakeNameTitle').html(jQuery('#TopPcMakeDropDown option:selected').text()); }
            }
            jQuery('#TopPcModelDropDown').change();
        });
        jQuery('#TopPcModelDropDown').change(function () {
            if (jQuery(this).val() != 'Select Model') {
                var img = jQuery('option:selected', this).data('vImg'); var imagePath = (img.length > 0) ? '/vehicleimages/MultiView/Transparent/320/' + img.replace("640", "320") + '/' + img.replace("640", "320") + '_01.png' : '/static/blue/images/sampleCar2.png';
                jQuery('#TopPcVehicleImage').attr('src', imagePath);
                if (jQuery('.TopPcModelNameTitle').length > 0) { jQuery('.TopPcModelNameTitle').html(jQuery('#TopPcModelDropDown option:selected').text()); }
            }
        });
        jQuery('#TopPcAutoClickSubmit').click(function (event) {
            event.preventDefault();
            var make = jQuery('#TopPcModelDropDown').val(); var model = jQuery('#TopPcModelDropDown').val(); var zipCode = jQuery('#TopPcZipCode').val();
            if (make == "Select Make") { alert("Please select a Make"); return false; } if (model == "Select Model") { alert("Please select a Model"); return false; }
            var leadUrl = '/quotes/autos/autocontact.aspx?zipCode=' + zipCode + '&modelid=' + escape(model) + '&adid=83659';
            window.top.location.href = leadUrl;
            return false;
        });
    }
    //INS
    jQuery('.AutoINSClickSubmit').click(function (event) {
        event.preventDefault();
        var insuredStatus = jQuery(this).attr('id'); //acceptable values are "Currently Insured" and "Uninsured"
        var zipCode = jQuery('#TopPcZipCode').val();
        window.ShowLoadingDiv('Searching for Auto Insurance Quotes', 'Presented by an Insurance Agent');
        jQuery.getJSON('/quotes/insurance/Handler/ConsumerSelectHandler.ashx?zipcode=' + zipCode + '&category=10&insuredstatus=' + insuredStatus + '&adid=85567', function (cmpResults) {
            var leadurl = '';
            window.ShowConsumerSelectDiv(cmpResults, leadurl, 'We Found Auto Insurance Quotes');
        });
    });
    //RE
    jQuery('#TopPcRealEstateClickSubmit').click(function (event) {
        event.preventDefault();
        var zipCode = jQuery('#TopPcZipCode').val();
        if ($('#TopPcHomeValuesCheckbox').is(':checked')) {
            //Home Values
            window.ShowLoadingDiv('Searching for Home Values', 'Presented by a Real Estate Agent');
            jQuery.getJSON('/quotes/homevalues/Handler/ConsumerSelectHandler.ashx?zipcode=' + zipCode + '&Category=17&PropertyType=&adid=83660', function (cmpResults) {
                var leadurl = '/quotes/homevalues/Sell/SellContact.aspx?zipcode=' + zipCode + '&trackingid=' + cmpResults.TrackingId + '&adid=83660';
                window.ShowConsumerSelectDiv(cmpResults, leadurl, 'We Found FREE Home Values');
            });
        } else if ($('#TopPcForeclosureCheckbox').is(':checked')) {
            //Foreclosure
            window.ShowLoadingDiv('Searching for Foreclosed Home Listings', 'Presented by a Real Estate Agent');
            jQuery.getJSON('/quotes/foreclosures/Handler/ConsumerSelectHandler.ashx?zipcode=' + zipCode + '&Category=16&PropertyType=Foreclosure&adid=83660', function (cmpResults) {
                var leadurl = "/quotes/foreclosures/ForeclosureContact.aspx?zipcode=" + zipCode + "&trackingid=" + cmpResults.TrackingId + '&adid=83660';
                window.ShowConsumerSelectDiv(cmpResults, leadurl, 'We Found FREE Foreclosed Home Listings');
            });
        } else {
            //Home Listings
            window.ShowLoadingDiv('Searching for Home Listings', 'Presented by a Real Estate Agent');
            jQuery.getJSON('/quotes/foreclosures/Handler/ConsumerSelectHandler.ashx?zipcode=' + zipCode + '&Category=16&PropertyType=Non-Foreclosure&adid=83660', function (cmpResults) {
                var leadurl = "/quotes/homelistings/BuyContact.aspx?zipcode=" + zipCode + "&trackingid=" + cmpResults.TrackingId + '&adid=83660';
                window.ShowConsumerSelectDiv(cmpResults, leadurl, 'We Found FREE Home Listings');
            });
        }
    });
});
