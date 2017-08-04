export default {
    htmlEncode: function (s) {  
        var div = document.createElement('div');  
        div.appendChild(document.createTextNode(s));  
        return div.innerHTML;  
    } 

};
