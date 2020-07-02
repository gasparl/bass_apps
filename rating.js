/*jshint esversion: 6 */

var experiment_title = 'silhu_ch';
let fixed_cond = 0;  // TODO different for each link

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
        window.location = "https://labs-univie.sona-systems.com/exp_info.aspx?experiment_id=968";
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
            if (resp == "IP") {
                $('#loading_id').html("It seems that you have completed this test once already.<br><br>If you believe this is a mistake, or if you perhaps want to do the experiment again without earning compensation, just write us an email.");
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
    $("#intro").show();
    window.scrollTo(0, 0);
    window.consent_now = Date.now();
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
        example_imgs[filename].src = './silhou_pics/' + filename;
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
            images[filename].src = './silhou_pics/' + filename;
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
            'pro_id'
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
            userid
        ].join('/');
    window.f_name =
        experiment_title +
        bw_or_wb +
        "_" +
        subject_id +
        "_" + userid +
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
                    $("#passw_display").html('THERE WAS AN ERROR! Please do not close this page but send the data (if you can) to lkcsgaspar@gmail.com');
                } else {
                    let backlink = resp;
                    $("#passw_display").html('<a href=' + backlink + ' target="_blank">' + backlink + '</a>');
                }
            }
        )
        .fail(function(xhr, status, error) {
            console.log(xhr);
            console.log(error);
            $('#div_end_error').show();
            $("#passw_display").html('THERE WAS AN ERROR! Please do not close this page but send the data (if you can) to lkcsgaspar@gmail.com');
            // $("#passw_display").html("<i>(server connection failed)</i>");
        });
}

function userid_check() {
    window.params = new URLSearchParams(location.search);
    window.userid = params.get('psid');
    if (userid != null) {
        $("#pay_info").html("完成并有效的参与，将根据您与主办平台的安排获得奖励。");
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
        "ant2", "basketball", "slide", "abuse", "accident", "ache", "acrobat3", "airplane", "amusementpark", "argument4", "armchair", "axe", "balance", "ballet", "bathtub", "bear", "beetle2", "bench", "bird", "bodybuilder2", "boxer", "boy", "bug", "businessman", "candle", "cat", "cat5", "champion", "child_flower", "cleaning4", "climbing", "conductor", "couple_date", "couple4", "couple8", "crane_flying", "crossbow", "cute", "dance2", "deer2", "depression", "doctor", "dog_defecate", "dog5", "dog9", "eagle", "elephant", "execution3", "falling3", "family2", "family6", "father", "father5", "fear", "firefighter", "flamingo", "flight", "football", "gardener2", "girl", "goodbye", "gun", "gunman2", "gymnastics2", "hammer2", "handball", "handsome", "happiness3", "helicopter2", "highjump3", "homosexual", "icehockey", "injury", "insect3", "jet", "jump", "karate2", "key3", "kickboxer2", "kiss4", "knife", "lacrosse", "liberty_statue", "love2", "man_dog3", "meditation2", "model", "mother", "motocross", "murder2", "musician4", "nude2", "nude6", "old_man", "pagoda", "palmtree2", "pesticide", "photographer4", "plug", "poledance3", "pollution", "powerlines2", "pregnant2", "propose2", "rat2", "reading3", "relationship", "riding", "robber", "romance", "sadness2", "saw", "scolding3", "screwdriver", "sexy", "shark", "ship2", "sick", "singer3", "skeleton", "skiing3", "snake", "snowboard2", "soldier", "soldier5", "spider", "stork", "stripper2", "suicide_gun", "surfer", "syringe2", "tank", "telephone", "tick", "tortoise", "trapeze", "travel", "tree2", "truck", "violin", "waitress", "wedding", "wheelchair_couple", "windmill2", "wolf2", "wrestling"
    ],
    [
        "gorilla", "skateboard", "bodybuilder3", "abuse2", "ache2", "aerobics", "agreement", "airplane2", "analyse", "argument", "argument5", "army", "axe2", "ballerina", "balloon", "basketball2", "bathtub2", "bear2", "beggar", "bend", "bird2", "boxer2", "break2", "bull", "butterfly", "cardio", "cat2", "cat6", "chaplin", "cleaning", "cleaver", "climbing2", "construction_worker", "couple_sports", "couple5", "couple9", "cranes", "crow", "cutter_knife", "dead_tree", "delivery", "desperation2", "dog_ball", "dog2", "dog6", "dolphin", "eagle2", "euphoria", "exhausted", "falling5", "family3", "family7", "father2", "father6", "fencing", "fish", "flamingo2", "fly", "game", "gasmask2", "girl2", "gun2", "gunman3", "gymnastics3", "hammock", "handball2", "hanging", "happiness4", "helicopter3", "highjump4", "horse", "hummingbird2", "iceskater", "injury2", "island", "jump2", "karate3", "kick", "kiss", "kite", "knife2", "lamp", "lighthouse", "machete", "man_walking", "megaphone", "monkey", "mother2", "motocross2", "musician", "musician5", "nude3", "nude7", "old_man2", "old_man3", "painter", "paragliding2", "physiotherapy", "pointing", "police", "pollution2", "powerlines3", "pregnant3", "propose3", "rat3", "reading4", "relaxation", "rifle", "rocket", "romance2", "sailing", "scissors", "scorpion", "seahorse", "sexy2", "shark2", "ship3", "silent", "skeleton_dinosaur", "skipping", "slide2", "snake2", "soccer_boy", "soldier2", "sorrow", "spider2", "stretching", "submarine", "suicide_gun2", "suicide_hang", "syringe", "tank2", "tennis", "training", "trapeze2", "travel2", "triumph", "tuba", "tug", "vomit", "war_jet", "wedding_cake", "wildwest", "winner", "woman_umbrella", "worker"
    ],
    [
        "musician2", "cardio2", "volleyball", "acrobat", "affection", "affection3", "aircraft", "airplane3", "anger", "argument2", "argument6", "attack", "axe3", "ballerina2", "balloon2", "basketball3", "bazooka", "bee", "beggar2", "bicycle", "bird3", "bottles", "boxers", "breakdance", "bullriding", "butterfly2", "cat3", "chainsaw", "cheetah", "cleaning2", "cleaver2", "climbing3", "couple_bicycle", "couple2", "couple6", "coyote", "cricket", "crutch", "cyclist", "dead_tree3", "demonstration2", "dice", "dog", "dog3", "dog7", "drunk", "eagle3", "execution", "falling", "falling6", "family4", "family8", "father3", "father7", "ferris_wheel", "fisherman", "fleeing", "foetus", "garbageman", "gecko", "golfer", "graduation", "gun3", "gunman4", "hairdresser", "hand", "handcuff", "happiness", "hazard", "highjump", "hitchhiker", "hotairballoon", "hummingbird", "hunger2", "iceskater2", "insect", "kalashnikov", "key", "kick2", "kiss2", "kitten", "knife3", "leopard", "lion", "man_dog", "medicine", "megaphone2", "mosquito", "mother3", "motorbike", "noose", "nude4", "observation2", "painting", "paragliding3", "photographer", "photographer2", "piano", "poledance", "police2", "poodle", "pray", "programmer", "quill", "reading", "referee", "relaxation2", "roach", "rockstar", "running", "sailing2", "scolding", "scooter", "selfie", "sexy3", "sheep", "shopping", "singer", "skateboard2", "skiing", "skull", "smartphone", "sniper", "soccer", "soldier3", "sorrow2", "spider3", "stretching2", "success", "surfer2", "surveillance", "swing2", "teapot", "tennis2", "tiger", "tiger2", "training2", "trapeze3", "travel3", "triumph2", "warmup", "wedding2", "wind_engine", "wolf", "yoga", "yoga2"
    ],
    [
        "boy_bicycle", "hammer", "skateboard3", "accident2", "acrobat2", "affection2", "aircraft2", "ambulance", "ant", "argument3", "argument7", "attack2", "badminton", "ballerina3", "barrier", "basketball4", "beach", "beetle", "begging2", "bicycle_old", "bodybuilder", "bowling", "bridge", "business_partners", "cage", "carefree", "cat4", "chainsaw2", "chemicals", "cleaning3", "cliff", "concert", "couple", "couple3", "couple7", "crane", "crocodile", "cup", "dance", "deer", "demonstration3", "dispute", "dog_cat", "dog4", "dog8", "drunkard", "eiffeltour", "execution2", "falling_couple", "family", "family5", "family9", "father4", "faucet", "fireextinguisher", "fisherman2", "fleeing3", "foetus2", "gardener", "gift", "golfer2", "granade", "gunman", "gymnastics", "hand_injury", "handcuff2", "happiness2", "helicopter", "highjump2", "hitman", "hotairballoon2", "hunter", "iceskater3", "insect2", "joy", "karate", "key2", "kickboxer", "kiss3", "knife_attack", "knife4", "libella", "love", "man_dog2", "meditation", "megaphone3", "mosquito2", "mother4", "motorbike2", "musician3", "nude", "nude5", "octopus", "osprey", "palmtree", "parrot", "photographer3", "pineapple", "poledance2", "police3", "powerlines", "pregnant", "propose", "rat", "reading2", "referee2", "rhinoceros", "roach2", "rollercoaster", "sadness", "salute", "scolding2", "scorpion2", "sex", "sexy4", "ship", "shopping2", "singer2", "skiing2", "skull2", "smoking", "snowboard", "soccer2", "soldier4", "spaceshuttle2", "sportscar", "stripper", "success2", "suicide_hang2", "swing", "syringe3", "teapot2", "terrace", "tooth", "tram", "trapeze4", "tree", "trophy", "vacuum", "vomit2", "wasp", "wheelchair", "windmill", "wolf_howling", "worker2"
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
