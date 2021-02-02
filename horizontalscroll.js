(function() {
    function scrollHorizontally(e) {
        e = window.event || e;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        document.getElementById('chat_input').scrollLeft -= (delta * 40); // Multiplied by 40
        e.preventDefault();
    }
    if (document.getElementById('chat_input').addEventListener) {
        // IE9, Chrome, Safari, Opera
        document.getElementById('chat_input').addEventListener('mousewheel', scrollHorizontally, false);
        // Firefox
        document.getElementById('chat_input').addEventListener('DOMMouseScroll', scrollHorizontally, false);
    } else {
        // IE 6/7/8
        document.getElementById('chat_input').attachEvent('onmousewheel', scrollHorizontally);
    }
})();
