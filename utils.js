/*jshint esversion: 6 */

// detect mobile device
function detectmob() {
    let is_valid = true;
    if (
        navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i)
    ) {
        alert(
            "You are using a smartphone or tablet. In this phase there is no mobile version of the test available. \nUnfortunately you cannot do this experiment on your mobile device. \nStart the experiment again with a normal webbrowser on your computer."
        );
        is_valid = false;
        window.location = end_url;
    }
    return is_valid;
}

//do nothing
function noop() {
    $.noop();
}

// change div - if good to go. Two optional function to include in execution (default does nothing)
function change_div(
    current,
    next,
    good_to_go = true,
    onchange_function1 = noop,
    onchange_function2 = noop
) {
    if (good_to_go === true) {
        onchange_function1();
        onchange_function2();
        let toHide = "#" + current.parentNode.id;
        $(toHide).hide();
        $(next).show();
    }
}

function open_fulls() {
    try {
        let elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            /* Chrome, Safari and Opera */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            /* IE/Edge */
            elem.msRequestFullscreen();
        }
    } catch (err) {
        console.log(err);
    }
}

/* Close fullscreen */
function close_fulls() {
    try {
        let elem = document.documentElement;
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            /* IE/Edge */
            document.msExitFullscreen();
        }
    } catch (err) {
        console.log(err);
    }
}


//calculate sum
function sum(array_to_sum) {
    let sum = 0;
    array_to_sum.forEach(function(item) {
        sum += item;
    });
    return sum;
}
//calculate mean
function mean(array_to_avg) {
    let mean = sum(array_to_avg) / array_to_avg.length;
    return mean;
}


function randomdigit(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// timing
let now = function() {
    let performance = window.performance || {};
    performance.now = (function() {
        return (
            performance.now ||
            performance.webkitNow ||
            performance.msNow ||
            performance.oNow ||
            performance.mozNow ||
            function() {
                return new Date().getTime();
            }
        );
    })();
    return performance.now();
};
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

//shuffle
function shuffle(arr) {
    let array = JSON.parse(JSON.stringify(arr));
    let newarr = [];
    let currentIndex = array.length,
        temporaryValue,
        randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        newarr[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return newarr;
}

// random choice from array
function rchoice(array) {
    return array[Math.floor(array.length * Math.random())];
}

// pythonic range (integers from START until before END)
function range(start, end) {
    let r = [];
    for (let i = start; i < end; i++) {
        r.push(i);
    }
    return r;
}

function neat_date() {
    let m = new Date();
    return m.getFullYear() + "" +
        ("0" + (m.getMonth() + 1)).slice(-2) + "" +
        ("0" + m.getDate()).slice(-2) + "" +
        ("0" + m.getHours()).slice(-2) + "" +
        ("0" + m.getMinutes()).slice(-2) + "" +
        ("0" + m.getSeconds()).slice(-2);
}

function monkeyPatchRequestPostAnimationFrame() {
    const channel = new MessageChannel();
    const callbacks = [];
    let timestamp = 0;
    let called = false;
    channel.port2.onmessage = e => {
        called = false;
        const toCall = callbacks.slice();
        callbacks.length = 0;
        toCall.forEach(fn => {
            try {
                fn(timestamp);
            } catch (e) {}
        });
    };
    window.requestPostAnimationFrame = function(callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('Argument 1 is not callable');
        }
        callbacks.push(callback);
        if (!called) {
            requestAnimationFrame((time) => {
                timestamp = time;
                channel.port1.postMessage('');
            });
            called = true;
        }
    };
}
if (typeof requestPostAnimationFrame !== 'function') {
    monkeyPatchRequestPostAnimationFrame();
}

function chromeWorkaroundLoop() {
    if (warmup_needed) {
        requestAnimationFrame(chromeWorkaroundLoop);
    }
}
