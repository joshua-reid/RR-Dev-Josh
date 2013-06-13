
function tgDf(o) {
    if (o.value == o.getAttribute("defaultvalue"))
        o.value = "";
}

function tgDb(o) {
    if (o.value == "")
        o.value = o.getAttribute("defaultvalue");
}

function _sm(s) {
    document.getElementById('msg').innerHTML = s;
}

function ajax(url, callback)
{
    var xmlhttp = null;

    /*@cc_on@*/
    /*@if (@_jscript_version >= 5)
    // JScript gives us Conditional compilation, we can cope with old IE versions.
    try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP")
    } catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
        } catch (E) {

        }
    }
    @else
		xmlhttp=false
	@end
    @*/

    if (!xmlhttp) 
    {
        try {
            xmlhttp = new XMLHttpRequest();
        }
        catch (e) { 
        }
    }

    if (xmlhttp) 
    {
        try {

            xmlhttp.open("GET", url, true);
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    callback(xmlhttp.responseText);
                }
            };
            xmlhttp.send(null);
        } 
        catch (e) 
        {
            callback(null);
        }
    } 
    else 
    {
        callback(null);
    }
}