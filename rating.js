/*jshint esversion: 6 */

var experiment_title = 'silhu_univie_chi_full';

$(document).ready(() => {
    let dropChoices = '';
    countrs.forEach((word) => {
        dropChoices += '<option value="' + word + '">' + word + '</option>';
    });
    $("#country").append(dropChoices);
    if (aro_or_val == 'arousal') {
        $('#valencefull_id').hide();
    } else if (aro_or_val == 'valence') {
        $('#arousalfull_id').hide();
    }
    $('#consent').show(); // default: consent
    getexamplepics();
    getmainpics();
    starter();
    window.scrollTo(0, 0);
});

function consented() {
    $("#consent").hide();
    $("#demographics").show();
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

var bw_or_wb = rchoice(['_bw', '_wb']);
var aro_or_val = rchoice(['arousal', 'valence']); //['arousal', 'valence', 'both']);


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
        example_imgs[filename].src = 'pics/' + filename;
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
            images[filename].src = 'pics/' + filename;
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
        $('#submit_button').hide();
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
            'gender',
            'age',
            'country',
            'browser_name',
            'browser_version',
            'list',
            'attention',
            'full_dur'
        ].join('/') +
        '\t' + [
            subject_id,
            bw_or_wb.slice(1),
            aro_or_val,
            $('input[name=gender]:checked').val(),
            $("#age").val(),
            $("#country").val(),
            browser[0],
            browser[1],
            listnums[0] + 1,
            $('input[name=acheck]:checked').val(),
            duration_full
        ].join('/');
    window.f_name =
        experiment_title +
        bw_or_wb +
        "_" +
        subject_id +
        ".txt";
    upload();
}

function upload() {
    $.post(
            "store_finish.php", {
                filename_post: f_name,
                results_post: ratings
            },
            function(resp) {
                console.log(resp);
                if (resp.startsWith("Fail")) {
                    $('#div_end_error').show();
                } else {
                    $('#scs_id').show();
                }
            }
        )
        .fail(function(xhr, status, error) {
            console.log(xhr);
            console.log(error);
            $('#div_end_error').show();
            // $("#passw_display").html("<i>(server connection failed)</i>");
        });
}

function save_demo() {
    $("#demographics").hide();
    if (aro_or_val == 'arousal') {
        $('#aro_intro').show();
    } else if (aro_or_val == 'valence') {
        $('#val_intro').show();
    } else {
        $('#both_intro').show();
    }
    $("#intro").show();
    window.scrollTo(0, 0);
    //next_pic_rate();
}

var resp_valence, resp_arousal, resp_clarity;

function reset_scales() {
    resp_valence = 'NA';
    resp_arousal = 'NA';
    resp_clarity = 'NA';
    $(".slider").addClass("slider_hide_thumb");
    if (aro_or_val == 'arousal') {
        resp_valence = '-';
        $("#valence_id").removeClass("slider_hide_thumb");
    } else if (aro_or_val == 'valence') {
        resp_arousal = '-';
        $("#arousal_id").removeClass("slider_hide_thumb");
    }
    $("#display_v, #display_a, #display_c").text("");
}

function starter() {
    reset_scales();
    // VALENCE RATING SCALE
    $("#valence_id").on("click", () => {
        resp_valence = $("#valence_id").val();
        $("#display_v").text(resp_valence);
        $("#valence_id").removeClass("slider_hide_thumb");
        if (!$(".slider").hasClass("slider_hide_thumb")) {
            $('#submit_button').show();
        }
    });
    // AROUSAL RATING SCALE
    $("#arousal_id").on("click", () => {
        resp_arousal = $("#arousal_id").val();
        $("#display_a").text(resp_arousal);
        $("#arousal_id").removeClass("slider_hide_thumb");
        if (!$(".slider").hasClass("slider_hide_thumb")) {
            $('#submit_button').show();
        }
    });
    // CLARITY RATING SCALE
    $("#clarity_id").on("click", () => {
        resp_clarity = $("#clarity_id").val();
        $("#display_c").text(resp_clarity);
        $("#clarity_id").removeClass("slider_hide_thumb");
        if (!$(".slider").hasClass("slider_hide_thumb")) {
            $('#submit_button').show();
        }
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
    "subject_id", "trial_number", "pic", "valence", "arousal", "clarity"
].join("\t") + '\n';

var rated = {};

function save_response() {
    ratings += [
        subject_id, trial, trial_stim, resp_valence, resp_arousal, resp_clarity
    ].join("\t") + "\n";
    console.log('trial: ' + trial, 'stim: ' + trial_stim, 'resp_valence: ' + resp_valence, 'resp_arousal: ' + resp_arousal, 'resp_clarity: ' + resp_clarity);
    if (resp_valence !== 'NA' && resp_arousal !== 'NA') {
        rated[trial_stim] = [resp_valence, resp_arousal];
    }
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
    ctx.drawImage(img, 0, 0);
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        $('#stimulus_rate').hide();
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
}

function skip() {
    reset_scales();
    $('#submit_button').show();
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

browser = (function() {
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

var countrs = ["Austria", "Germany", "Switzerland", "Italy", "Hungary", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burma", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea ", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea ", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];

let listnums = shuffle([0, 1, 2, 3]);
let piclists = [
    ['accident2', 'ache3', 'aerobics', 'agreement', 'airplane2', 'amusementpark2', 'ant2', 'argument3', 'argument7', 'axe', 'balance', 'ballet', 'barrier', 'basketball4', 'beach', 'beetle', 'begging2', 'bicycle_old', 'bodybuilder', 'bowling', 'boy', 'break2', 'bull', 'butterfly', 'cardio', 'cat', 'cat5', 'champion', 'child_flower', 'cleaning4', 'climbing', 'conductor', 'couple_date', 'couple4', 'couple8', 'crane_flying', 'crossbow', 'cute', 'dance2', 'deer', 'demonstration2', 'desperation2', 'doctor', 'dog_defecate', 'dog5', 'dog9', 'eagle2', 'euphoria', 'falling_couple', 'falling5', 'family3', 'family7', 'father2', 'father6', 'ferris_wheel', 'fisherman', 'fleeing', 'foetus', 'garbage', 'gasmask', 'girl', 'goodbye', 'granade', 'gunman', 'gymnastics', 'hammer', 'handball', 'handsome', 'happiness3', 'helicopter3', 'highjump4', 'horse', 'hummingbird2', 'iceskater2', 'insect2', 'joy', 'karate', 'key2', 'kickboxer', 'kiss3', 'knife', 'lacrosse', 'liberty_statue', 'love2', 'man_dog3', 'meditation2', 'model', 'mother', 'motocross', 'musician', 'musician5', 'nude3', 'observation2', 'old_man2', 'painter', 'paragliding', 'patriot', 'photographer4', 'play_ball', 'poledance2', 'police3', 'powerlines', 'pray2', 'programmer', 'pull', 'rat3', 'reading4', 'relaxation', 'rifle', 'rocket', 'romance2', 'sailing', 'scissors', 'scooter', 'seahorse', 'sexy2', 'shark2', 'ship2', 'sick', 'singer3', 'skeleton', 'skiing2', 'skull2', 'smoking', 'sniper', 'soccer_boy', 'soldier3', 'sorrow2', 'spider', 'stork', 'submarine', 'surfer', 'swing', 'syringe3', 'teapot2', 'terrace', 'tiger2', 'training2', 'trapeze3', 'travel3', 'triumph2', 'tuba', 'violin', 'war_jet', 'wedding_cake', 'wildwest', 'winner', 'woman_umbrella', 'yelling', 'abuse2', 'execution2', 'hunger', 'murder', 'suicide_hang', 'army2'],
    ['axe2', 'ballerina', 'balloon', 'accident', 'ache', 'acrobat', 'affection', 'analyse', 'ant', 'apology', 'argument4', 'armchair', 'basketball', 'bathtub', 'bear', 'beetle2', 'bench', 'bird', 'bodybuilder2', 'boxer', 'boy_bicycle', 'breakdance', 'bullriding', 'butterfly2', 'cardio2', 'cat2', 'cat6', 'chainsaw', 'cleaning', 'cleaver', 'climbing2', 'construction_worker', 'couple_sports', 'couple5', 'couple9', 'cranes', 'crow', 'cutter_knife', 'dead_tree', 'deer2', 'demonstration3', 'dice', 'dog', 'dog2', 'dog6', 'dolphin', 'eagle3', 'execution', 'falling2', 'falling6', 'family4', 'family8', 'father3', 'father7', 'fight', 'fisherman2', 'fleeing2', 'foetus2', 'garbageman', 'gasmask2', 'girl2', 'goodbye2', 'gun', 'gunman2', 'gymnastics2', 'hammer2', 'handball2', 'hanging', 'happiness4', 'highjump', 'hitchhiker', 'hotairballoon', 'hunter', 'iceskater3', 'insect3', 'jump', 'karate2', 'key3', 'kickboxer2', 'kiss4', 'knife2', 'lamp', 'lighthouse', 'machete', 'man_walking', 'megaphone', 'monkey', 'mother2', 'motocross2', 'musician2', 'noose', 'nude4', 'nude7', 'old_man3', 'painting', 'paragliding2', 'photographer', 'physiotherapy', 'plug', 'poledance3', 'pollution', 'powerlines2', 'pregnant', 'propose', 'quill', 'reading', 'referee', 'relaxation2', 'roach', 'rockstar', 'running', 'sailing2', 'scolding', 'scorpion', 'selfie', 'sexy3', 'sheep', 'ship3', 'silent', 'skateboard', 'skeleton_amphibian', 'skiing3', 'slide', 'smoking2', 'snowboard', 'soccer2', 'soldier4', 'sorrow3', 'spider2', 'stretching', 'stripper2', 'surfer2', 'swing2', 'tank', 'telephone', 'thumbsup', 'tooth', 'tram', 'trapeze4', 'tree', 'triumph3', 'tug', 'volleyball', 'warmup', 'wedding2', 'wind_engine', 'wolf', 'worker', 'yoga', 'attack2', 'execution3', 'hunger2', 'murder2', 'suicide_hang2', 'firefighter'],
    ['spaceshuttle', 'spider3', 'stretching2', 'acrobat2', 'affection2', 'aircraft', 'aircraft2', 'airplane3', 'amusementpark', 'argument2', 'argument5', 'army', 'axe3', 'ballerina2', 'balloon2', 'basketball2', 'bathtub2', 'bear2', 'beggar2', 'bend', 'bird2', 'bodybuilder3', 'boxer2', 'boy2', 'bridge', 'business_partners', 'cage', 'carefree', 'cat3', 'chaplin', 'cheetah', 'cleaning2', 'cleaver2', 'climbing3', 'couple', 'couple2', 'couple6', 'coyote', 'cricket', 'crutch', 'cyclist', 'dead_tree2', 'delivery', 'depression', 'dispute', 'dog_ball', 'dog3', 'dog7', 'drunkard', 'eiffeltour', 'exhausted', 'falling3', 'family', 'family5', 'family9', 'father4', 'faucet', 'fireextinguisher', 'flamingo', 'fleeing3', 'football', 'gardener', 'gecko', 'golfer', 'gorilla', 'gun2', 'gunman3', 'gymnastics3', 'hammock', 'handcuff', 'happiness', 'helicopter', 'highjump2', 'hitman', 'hotairballoon2', 'icehockey', 'injury', 'island', 'jump2', 'karate3', 'kick', 'kiss', 'kite', 'knife3', 'leopard', 'lion', 'man_dog', 'medicine', 'megaphone2', 'mosquito', 'mother3', 'motorbike', 'musician3', 'nude', 'nude5', 'octopus', 'osprey', 'palmtree', 'paragliding3', 'photographer2', 'piano', 'pointing', 'police', 'pollution2', 'powerlines3', 'pregnant2', 'propose2', 'rat', 'reading2', 'referee2', 'rhinoceros', 'roach2', 'rollercoaster', 'sadness', 'salute', 'scolding2', 'scorpion2', 'sex', 'sexy4', 'sheep2', 'shopping', 'singer', 'skateboard2', 'skeleton_dinosaur', 'skipping', 'slide2', 'snake', 'snowboard2', 'soldier', 'soldier5', 'success', 'surprise', 'syringe', 'tank2', 'tennis', 'tick', 'tortoise', 'trapeze', 'travel', 'tree2', 'trophy', 'vacuum', 'vomit', 'wasp', 'wheelchair', 'windmill', 'wolf_howling', 'worker2', 'yoga2', 'beggar', 'fear', 'injury2', 'suicide_gun', 'vomit2', 'hazard'],
    ['basketball3', 'bazooka', 'bee', 'ache2', 'acrobat3', 'affection3', 'airplane', 'ambulance', 'anger', 'argument', 'argument6', 'attack', 'badminton', 'ballerina3', 'barbed_wire', 'begging', 'bicycle', 'bird3', 'bottles', 'boxers', 'break', 'bug', 'businessman', 'candle', 'carrying', 'cat4', 'chainsaw2', 'chemicals', 'cleaning3', 'cliff', 'concert', 'couple_bicycle', 'couple3', 'couple7', 'crane', 'crocodile', 'cup', 'dance', 'dead_tree3', 'demonstration', 'desperation', 'dive', 'dog_cat', 'dog4', 'dog8', 'eagle', 'elephant', 'falling', 'falling4', 'family2', 'family6', 'father', 'father5', 'fencing', 'fish', 'flamingo2', 'fly', 'game', 'gardener2', 'gift', 'golfer2', 'graduation', 'gun3', 'gunman4', 'hairdresser', 'hand', 'handcuff2', 'happiness2', 'helicopter2', 'highjump3', 'homosexual', 'hummingbird', 'iceskater', 'insect', 'jet', 'kalashnikov', 'key', 'kick2', 'kiss2', 'kitten', 'knife4', 'libella', 'love', 'man_dog2', 'meditation', 'megaphone3', 'mosquito2', 'mother4', 'motorbike2', 'musician4', 'nude2', 'nude6', 'old_man', 'pagoda', 'palmtree2', 'parrot', 'photographer3', 'pineapple', 'poledance', 'police2', 'poodle', 'pray', 'pregnant3', 'propose3', 'rat2', 'reading3', 'relationship', 'riding', 'robber', 'romance', 'sadness2', 'saw', 'scolding3', 'screwdriver', 'sexy', 'shark', 'ship', 'shopping2', 'singer2', 'skateboard3', 'skiing', 'skull', 'smartphone', 'snake2', 'soccer', 'soldier2', 'sorrow', 'spaceshuttle2', 'sportscar', 'stripper', 'success2', 'surveillance', 'syringe2', 'teapot', 'tennis2', 'tiger', 'training', 'trapeze2', 'travel2', 'triumph', 'truck', 'vaping', 'waitress', 'wedding', 'wheelchair_couple', 'windmill2', 'wolf2', 'wrestling', 'abuse', 'drunk', 'hand_injury', 'knife_attack', 'suicide_gun2', 'pesticide', 'flight']
];
