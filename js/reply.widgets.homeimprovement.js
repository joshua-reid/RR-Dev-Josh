var vloc = null;

function cf1(o) {

    if (o.category.type.toLowerCase().indexOf("select") == 0 && o.category.selectedIndex == 0) {
        _sm("Please choose a project.");
        o.category.focus();
        return false;
    }

    if (_f_mode == "Dropdown" && o.task.selectedIndex == 0 && o.task.options.length > 1) {

        _sm("Please specify project details.");
        o.task.focus();
        return false;

    }

    if (o.location.value == "" || o.location.value == "Enter Zipcode") {
        _sm("Please enter your zipcode.");
        o.location.focus();
        return false;
    }

    if (!/^[0-9]{5}/.test(o.location.value)) {
        _sm("Please enter a valid zipcode.");
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
                    _sm("Please enter a valid zipcode.");
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

function sf(s) {
    document.f.task.value = s;

    if (cf1(document.f)) 
    {
        document.f.submit();
    }
}

// add a filter
function af(a, b) {

    var s = "" +
	"<div onclick=\"javascript:sf('" + b.replace(/'/g, "\\'") + "');\" class=\"task_box\"> " +
	"	<div class=\"btn_task\">" +
	"		<div class=\"task_img\">"

    if (a == 0)
        s += "		<img class=\"task_img_size\" src=\"images/spacer.gif\" />";
    else
        s += "		<img class=\"task_img_size\" src=\"//www.reply.com/clicks/dcs/lib/icons/filter/18/" + a + ".jpg\" />";

    s += "" +
	"		</div>" +
	"		<div class=\"task_text" + (b.length>35 ? "_sm":"") + "\">" +
	"		" + b +
	"		</div>" +
	"	</div>" +
	"	<div class=\"clear\"></div>" +
	"</div>";



    document.getElementById("buttonpanel").innerHTML += s;


}

function cp() {

    if (_f_mode == "Buttons") {
        document.getElementById("buttonpanel").innerHTML = "";
        document.getElementById("btnsbmt").style.visibility = "hidden";
        document.getElementById("btnsbmt").style.display = "none";
    }
    else {
        document.f.task.options.length = 1;
        document.getElementById("taskdiv").style.visibility = "hidden";
        document.getElementById("taskdiv").style.display = "none";
    }

    var cval;

    if (document.f.category.type.toLowerCase().indexOf("select") == 0)
        cval = document.f.category.options[document.f.category.selectedIndex].value;
    else
        cval = document.f.category.value;

    if (cval != "") {

        var i = parseInt(cval);

        for (var x = 0; x < __dcs_lib_filters.length; x++) {

            if (__dcs_lib_filters[x][0] == i) {

                if (_f_mode == "Buttons") {
                    af(__dcs_lib_filters[x][1], __dcs_lib_filters[x][2]);
                } else {
                    document.f.task.options[document.f.task.options.length] = new Option(__dcs_lib_filters[x][3], __dcs_lib_filters[x][2]);
                    if (_f_init == __dcs_lib_filters[x][2])
                        document.f.task.selectedIndex = document.f.task.options.length - 1;

                }
            }

        }
    }


    if (_f_mode == "Dropdown" && document.f.task.options.length > 1) {
        document.getElementById("taskdiv").style.visibility = "visible";
        document.getElementById("taskdiv").style.display = "block";
    }
    else if (_f_mode == "Buttons" && document.getElementById("buttonpanel").innerHTML == "") {
        document.getElementById("btnsbmt").style.visibility = "visible";
        document.getElementById("btnsbmt").style.display = "block";
    }



}