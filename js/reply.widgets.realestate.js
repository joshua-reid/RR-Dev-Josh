var vloc = null;

function cf1(o) {

    if (o.category.value == "") {
        _sm("Please choose a service.");
        return false;
    }



    if (o.location.value == "" || o.location.value == "Enter Zip or City, State") {
        _sm("Please enter your location.");
        o.location.focus();
        return false;
    }

    // can't use async with auto-redir, so return true
    if (o.autoredirect != undefined && o.autoredirect.value.toLowerCase() == "true")
        return true;

    // detect state change 
    if (vloc != o.location.value) {
        // note: only run if not autoredirect
        ajax(
            "/shared/handlers/ajax_validatelocation.ashx?location=" + escape(o.location.value),
            function (s) {
                if (s == "0") {
                    _sm("Please enter a valid location.");
                    o.location.focus();
                } else {
                    vloc = o.location.value;
                    document.f.submit();
                }

            });

        return false;

    }

    return true;

}

function scv(c) {
    document.f.category.value = c;
}

function sfc(c, s) {
    scv(c);
    sf(s);
}

function spt(s) {
    document.f.propertytype.value = s;
}

function sf(s) {
    if (cf1(document.f)) {
        document.f.submit();
    }
}


// add a filter
function af(a, b) {

    var s = "" +
	"<div onclick=\"javascript:sf('" + b.replace(/'/g, "\\'") + "');\" class=\"task_box2\"> " +
	"	<div class=\"btn_task_" + b + "\"></div>" +
	"	<div class=\"clear\"></div>" +
	"</div>";

    document.getElementById("buttonpanel").innerHTML += s;

}

function cp(cval) {
   
    _sm("");

    if (_f_mode == "Buttons") {

        document.getElementById("buttonpanel").innerHTML = "";


    }
    else {
        
        document.getElementById("taskdiv").innerHTML = "";
        document.getElementById("taskdivwrap").style.display = "none";
    }

    
    
    document.f.category.value = "";

    

    var ctr = 0;
    if (cval != 0) {

        if (_f_mode == "Dropdown" && document.getElementById("catdiv")!=null)
            document.getElementById("catdiv").style.display = "none";

        document.f.category.value = cval;

        if (document.getElementById("catbuttons"))
            document.getElementById("catbuttons").style.display = "none";

        var i = parseInt(cval);

        
        
        for (var x = 0; x < __dcs_lib_filters.length; x++) {

            if (__dcs_lib_filters[x][0] == i) {

                if (_f_mode == "Buttons") {
                    af(__dcs_lib_filters[x][1], __dcs_lib_filters[x][2]);
                } else {

                    ctr++;

                    document.getElementById("taskdiv").innerHTML += "<div class=\"taskdivp\" id=\"task" + ctr + "div\">" +
                                                                    "<input " + (_f_init == __dcs_lib_filters[x][2] ? "checked" : "") + " type=\"radio\" name=\"taskradio\" id=\"task" + ctr + "\" value=\"" + __dcs_lib_filters[x][2] + "\" onclick=\"javascript:spt(this.value);\" />" +
                                                                    "<label for=\"task" + ctr + "\" class=\"tasklabel\" id=\"task" + ctr + "label\">" + __dcs_lib_filters[x][3] + "</label></div>";


                    if (_f_init == __dcs_lib_filters[x][2]) {
                        spt(__dcs_lib_filters[x][2]);
                    }


                }
            }

        }
    }

    

    if (_f_mode == "Buttons" && document.getElementById("buttonpanel").innerHTML != "")
        document.getElementById("buttonpanelwrap").style.display = "block";

    if (_f_mode == "Dropdown" && ctr > 0) {

        document.getElementById("taskdivwrap").style.display = "block";
    }
    else if (_f_mode == "Buttons" && document.getElementById("buttonpanel").innerHTML == "" && document.getElementById("btnsbmt")!=null) {


        document.getElementById("btnsbmt").style.visibility = "visible";
        document.getElementById("btnsbmt").style.display = "block";


    }



}