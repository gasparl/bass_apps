/*jshint esversion: 6 */

var experiment_title = 'silhu_dyn';
let fixed_cond = 0; // TODO different for each link

$(document).ready(() => {
    userid_check();
    window.scrollTo(0, 0);
    detectmob();
    start_php();
});

let all_conditions = [0, 1, 2, 3, 4, 5, 6, 7];
let condition, aro_or_val;

function detectmob() {
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
        window.location = "https://ssisurveys.com/";
    }
}

function set_cond() {
    if (condition > 3) {
        aro_or_val = 'arousal';
    } else {
        aro_or_val = 'valence';
    }
    if (aro_or_val == 'arousal') {
        $('#aro_intro').show();
    } else if (aro_or_val == 'valence') {
        $('#val_intro').show();
    }
    let thelist = condition % 4;
    window.listnums = shuffle([0, 1, 2, 3]);
    listnums = [thelist].concat(listnums.filter(num => {
        return num !== thelist;
    }));
    window.bw_or_wb = '_bw';
    if (aro_or_val == 'arousal') {
        $('#valencefull_id').hide();
    } else if (aro_or_val == 'valence') {
        $('#arousalfull_id').hide();
    }
    $('#loading_id').hide();
    $('#consent').show(); // default: consent
    getexamplepics();
    getmainpics();
    starter();
}

function start_php() {
    $.post("starter.php", function(resp) {
            console.log(resp);
            if (resp == "neverIP") {
                $('#consent').html("It seems that you have completed this test once already.");
                $('#consent').show();
            } else {
                select_condition(resp);
                condition = parseInt(condition);
                if (!all_conditions.includes(condition)) {
                    // for safety
                    console.log('resp', resp);
                    console.log('wrong condition', condition);
                }
                condition = fixed_cond;
                console.log('Fixed condition set! ', condition);
                set_cond();
            }
        })
        .fail(function(xhr, status, error) {
            console.log(error);
            $('#div_start_error').show();
            console.log("Connection failed.");
            condition = fixed_cond;
            console.log('Fixed condition set! ', condition);
            set_cond();
        });
}


function consented() {
    $("#consent").hide();
    $("#demographics").show();
    window.scrollTo(0, 0);
    window.consent_now = Date.now();
}

let init_dems = "";

function save_demo() {
    $("#demographics").hide();
    let s_age = $("#s_age").val();
    let s_sex = $('input[name=s_gender]:checked').val();
    let s_loc = $("#s_country").val();
    if (s_loc == 'mainland' && s_age > 17 && s_age < 96) {
        init_dems = s_age + '/' + s_sex;
        open_fulls();
        $("#intro").show();
        window.scrollTo(0, 0);
    } else {
        init_dems = s_age + '/' + s_sex + '/' + s_loc;
        screenout(init_dems);
    }
}

function screenout(screeninfo) {
    ratings = screeninfo + "/" + userid;
    window.f_name =
        "screened_" +
        experiment_title +
        "_" +
        subject_id +
        ".txt";
    upload();
    let endurl = "https://dkr1.ssisurveys.com/projects/end?rst=2&psid=" + userid;
    window.location = endurl;
}

function neat_date() {
    var m = new Date();
    return m.getFullYear() + "" +
        ("0" + (m.getMonth() + 1)).slice(-2) + "" +
        ("0" + m.getDate()).slice(-2) + "" +
        ("0" + m.getHours()).slice(-2) + "" +
        ("0" + m.getMinutes()).slice(-2) + "" +
        ("0" + m.getSeconds()).slice(-2);
}

function rchoice(array) {
    return array[Math.floor(array.length * Math.random())];
}

var subject_id =
    rchoice("CDFGHJKLMNPQRSTVWXZ") +
    rchoice("AEIOUY") +
    rchoice("CDFGHJKLMNPQRSTVWXZ") + '_' + neat_date();

function getexamplepics() {
    let example_pics = piclists[listnums[1]].splice(0, 3);
    example_pics = example_pics.map((pict) => {
        return (pict + bw_or_wb + '.png');
    });
    var example_imgs = {};
    example_pics.forEach((filename, ind) => {
        example_imgs[filename] = new Image();
        example_imgs[filename].onload = () => {
            document.getElementById("example" + (ind + 1) + '_id').src = example_imgs[filename].src;
        };
        example_imgs[filename].src = 'silhou_pics/' + filename;
    });
}


function getmainpics() {
    window.main_pics = piclists[listnums[0]];
    main_pics = shuffle(main_pics);
    main_pics.push('0car');
    main_pics = main_pics.map((pict) => {
        return (pict + bw_or_wb + '.png');
    });
    getpicset();
}

function getpicset() {
    $(".load_screen").show();
    $(".start_button").hide();
    // preload
    var promises = [];
    window.images = {};
    for (var i = 0; i < main_pics.length; i++) {
        ((filename, promise) => {
            images[filename] = new Image();
            images[filename].id = filename;
            images[filename].onload = () => {
                promise.resolve();
            };
            images[filename].src = 'silhou_pics/' + filename;
        })(main_pics[i], promises[i] = $.Deferred());
    }
    $.when.apply($, promises).done(() => {
        console.log("All images ready!");
        $(".load_screen").hide();
        $(".start_button").show();
    });
}

// shuffle array function
function shuffle(arr) {
    var array = JSON.parse(JSON.stringify(arr));
    var newarr = [];
    var currentIndex = array.length,
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


function starttask() {
    $("#intro").hide();
    $("#intermission").hide();
    $("#rating").show();
    window.scrollTo(0, 0);
    next_pic_rate();
}


var trial = 0;

function next_pic_rate() {
    if (main_pics.length !== 0) {
        $('#rating_actual').hide();
        disabl();
        $('#stimulus_rate').show();
        window.trial_stim = main_pics.shift();
        trial += 1;
        console.log('Current Trial:', trial);
        image_display_rate();
    } else {
        $("#rating").hide();
        ending();
        close_fulls();
        $("#Bye").show();
    }
}

function ending() {
    var duration_full = Math.round((Date.now() - consent_now) / 600) / 100;
    ratings += 'dems\t' + [
            'subject_id',
            'bw_or_wb',
            'rating_type',
            'browser_name',
            'browser_version',
            'list',
            'attention',
            'full_dur',
            'age',
            'gender',
            'ps_id'
        ].join('/') +
        '\t' + [
            subject_id,
            bw_or_wb.slice(1),
            aro_or_val,
            browser[0],
            browser[1],
            listnums[0] + 1,
            $('input[name=acheck]:checked').val(),
            duration_full,
            init_dems,
            userid
        ].join('/');
    window.f_name =
        experiment_title +
        "_" +
        subject_id +
        ".txt";
    upload();
}


function upload() {
    $.post(
            "store_finish.php", {
                filename_post: f_name,
                results_post: ratings,
                sid_post: subject_id,
                cond_post: condition
            },
            function(resp) {
                console.log(resp);
                if (!resp.startsWith('http')) {
                    $('#div_end_error').show();
                    $("#passw_display").html('错误!');
                } else if (userid != "noid") {
                    let backlink = resp.replace('TOREPL', userid);
                    setTimeout(() => {
                        window.location = backlink;
                        setTimeout(() => {
                            $("#passw_display").html('<a href=' + backlink + ' target="_blank">' + backlink + '</a>');
                        }, 5000);
                    }, 2000);
                }
            }
        )
        .fail(function(xhr, status, error) {
            console.log(xhr);
            console.log(error);
            $('#div_end_error').show();
            $("#passw_display").html('错误!');
        });
}

function userid_check() {
    window.params = new URLSearchParams(location.search);
    window.userid = params.get('psid');
    if (userid != null) {
        $("#pay_info").html("完成并有效的参与，将根据主办平台的安排获得奖励。");
    } else {
        window.userid = "noid";
        $("#passw_container").hide();
    }
}


var resp_valence, resp_arousal;
let times = {
    'shown': 'NA',
    'clicked': 'NA'
};

function reset_scales() {
    resp_valence = 'NA';
    resp_arousal = 'NA';
    $(".slider").addClass("slider_hide_thumb");
    if (aro_or_val == 'arousal') {
        resp_valence = '-';
        $("#valence_id").removeClass("slider_hide_thumb");
    } else if (aro_or_val == 'valence') {
        resp_arousal = '-';
        $("#arousal_id").removeClass("slider_hide_thumb");
    }
    $("#display_v, #display_a").text("");
}

function disabl() {
    $("#submit_button").addClass("kbutdis");
    $("#submit_button").removeClass("kbutt");
    document.getElementById("submit_button").disabled = true;
}

function enabl() {
    $("#submit_button").addClass("kbutt");
    $("#submit_button").removeClass("kbutdis");
    document.getElementById("submit_button").disabled = false;
}

function starter() {
    reset_scales();
    // VALENCE RATING SCALE
    $("#valence_id").on("click", () => {
        times.clicked = Date.now();
        resp_valence = $("#valence_id").val();
        $("#display_v").text(resp_valence);
        $("#valence_id").removeClass("slider_hide_thumb");
        enabl();
    });
    // AROUSAL RATING SCALE
    $("#arousal_id").on("click", () => {
        times.clicked = Date.now();
        resp_arousal = $("#arousal_id").val();
        $("#display_a").text(resp_arousal);
        $("#arousal_id").removeClass("slider_hide_thumb");
        enabl();
    });
    // submit and next
    $("#submit_button").on("click", () => {
        console.log('SUBMIT');
        save_response();
    });
    window.canvas = document.getElementById('rate_canvas');
    window.ctx = canvas.getContext('2d');
}

var ratings = [
    "subject_id", "trial_number", "pic", "valence", "arousal", 'display_end', 'rate_time'
].join("\t") + '\n';

var rated = {};

function save_response() {
    ratings += [
        subject_id, trial, trial_stim,
        resp_valence, resp_arousal, times.shown,
        (times.clicked - times.shown)
    ].join("\t") + "\n";
    console.log('trial: ' + trial, 'stim: ' + trial_stim, 'resp_valence: ' + resp_valence, 'resp_arousal: ' + resp_arousal);
    if (resp_valence !== 'NA' && resp_arousal !== 'NA') {
        rated[trial_stim] = [resp_valence, resp_arousal];
    }
    times = {
        'shown': 'NA',
        'clicked': 'NA'
    };
    reset_scales();
    next_pic_rate();
}

var extr_num = 5;

function extremes() {
    if (aro_or_val === 'arousal') {
        all_keys = Object.keys(rated).sort((a, b) => {
            return rated[a][1] - rated[b][1];
        });
    } else {
        all_keys = Object.keys(rated).sort((a, b) => {
            return rated[a][0] - rated[b][0];
        });
    }
    let lowest = all_keys.slice(0, extr_num);
    let highest = all_keys.slice(all_keys.length - extr_num);
    main_pics = shuffle(lowest.concat(highest));
    if (main_pics.length !== (extr_num * 2)) {
        console.log('not enough valid: ', main_pics.length);
        main_pics = shuffle(Object.keys(rated)).slice(0, (extr_num * 2));
    }
    getpicset();
}

function image_display_rate() {
    var img = images[trial_stim];
    setTimeout(() => {
        ctx.drawImage(img, 0, 0);
        setTimeout(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            $('#stimulus_rate').hide();
            times.shown = Date.now();
            setTimeout(() => {
                if (trial_stim[0] === '0') {
                    trial = 9000;
                    extremes();
                    $('#attention_check').show();
                } else {
                    $('#rating_actual').show();
                }
            }, 500);
        }, 2000);
    }, 300);
}

function skip() {
    reset_scales();
    enabl();
}

function dl_as_file() {
    var blobx = new Blob([ratings], {
        type: 'text/plain'
    });
    var elemx = window.document.createElement('a');
    elemx.href = window.URL.createObjectURL(blobx);
    elemx.download = f_name;
    document.body.appendChild(elemx);
    elemx.click();
    document.body.removeChild(elemx);
}

let browser = (function() {
    var ua = navigator.userAgent,
        tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge?)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera').replace('Edg ', 'Edge ');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M;
})();

let piclists = [
    [
        "ant2", "basketball", "slide"
    ],
    [
        "gorilla", "skateboard", "bodybuilder3"
    ],
    [
        "musician2", "cardio2", "volleyball"
    ],
    [
        "boy_bicycle", "hammer", "skateboard3"
    ]
];


function sum(array_to_sum) {
    var sum = 0;
    array_to_sum.forEach(function(item) {
        sum += item;
    });
    return sum;
}

function select_condition(conds_received) {
    console.log("conds_received:", conds_received);
    group_sizes = [];
    all_conditions.forEach(function(cond_n) {
        group_sizes.push(conds_received[cond_n] || 0);
    });
    min_size = Math.min.apply(null, group_sizes);
    weights = {};
    weight_arr = [];
    all_conditions.forEach(function(cond_num) {
        var weight = conds_received[cond_num] || 0;
        weights[cond_num] =
            1 / (5 + (conds_received[cond_num] || 0) - min_size);
        weight_arr.push(weights[cond_num]);
    });
    var random_size = Math.random() * sum(weight_arr),
        scale = 0;
    for (var groupkey in weights) {
        scale += weights[groupkey];
        if (random_size <= scale) {
            condition = groupkey;
            break;
        }
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
