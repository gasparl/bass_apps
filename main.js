/*jshint esversion: 6 */

let experiment_title = 'silhou_exp3';
let canvas, ctx;
let actual_isi_delay_minmax = [300, 500];
let raf_warmup = 100;
let basic_times = {};
let isi_delay_minmax = [actual_isi_delay_minmax[0] - raf_warmup, actual_isi_delay_minmax[1] - raf_warmup];

$(document).ready(() => {
    window.scrollTo(0, 0);
    let dropChoices = '';
    countrs.forEach((word) => {
        dropChoices += '<option value="' + word + '">' + word + '</option>';
    });
    $("#country").append(dropChoices);
    canvas = document.getElementById('rate_canvas');
    ctx = canvas.getContext('2d');
    detectmob();
    set_block_texts();
    $('#loading_id').hide();
    $('#div_intro_general').show();
    loadpics();
});

let key_for_pos, key_for_neg;

if (Math.random() < 0.5) {
    key_for_pos = 'i';
    key_for_neg = 'e';
} else {
    key_for_pos = 'e';
    key_for_neg = 'i';
}

function consented() {
    $("#consent").hide();
    window.scrollTo(0, 0);
    window.consent_now = Date.now();
    $("#div_intro_dems").show();
}


let once_asked = false;

function validate_form(form_class) {
    if (once_asked === true || (
            $('input[name=gender]:checked').val() != undefined &&
            $("#age").val() != '' &&
            $("#country").val() != '')) {
        $("#div_intro_dems").hide();
        open_fulls();
        window.scrollTo(0, 0);
        nextblock();
    } else {
        once_asked = true;
        alert("Du hast nicht alle Demografische Daten angegeben. Bitte fülle alle Felder aus.");
    }
}

function demson() {}

function rchoice(array) {
    return array[Math.floor(array.length * Math.random())];
}

let subject_id =
    rchoice("CDFGHJKLMNPQRSTVWXZ") +
    rchoice("AEIOUY") +
    rchoice("CDFGHJKLMNPQRSTVWXZ") + '_' + neat_date();


let images = {};

function loadpics() {
    $(".load_screen").show();
    $(".start_button").hide();
    // preload
    let promises = [];
    for (let i = 0; i < all_file_names.length; i++) {
        ((filename, promise) => {
            images[filename] = new Image();
            images[filename].id = filename;
            images[filename].onload = () => {
                promise.resolve();
            };
            images[filename].src = './imgs/' + filename;
            if (filename.endsWith('_p_bw.png')) {
                images[filename].alt = "-- image not loaded --";
                document.getElementById("pos_div").appendChild(images[filename]);
            } else if (filename.endsWith('_n_bw.png')) {
                images[filename].alt = "-- image not loaded --";
                document.getElementById("neg_div").appendChild(images[filename]);
            }
        })(all_file_names[i], promises[i] = $.Deferred());
    }
    $.when.apply($, promises).done(() => {
        console.log("All images ready!");
        $(".load_screen").hide();
        $(".start_button").show();
    });
}

window.params = new URLSearchParams(location.search);
let studcod = params.get('a');

function ending() {
    document.getElementById('Bye').style.display = 'block';
    let duration_full = Math.round((Date.now() - consent_now) / 600) / 100;

    full_data += 'dems\t' + [
            'subject_id',
            'gender',
            'age',
            'country',
            'browser_name',
            'browser_version',
            'first_type',
            'full_dur',
            'user_id'
        ].join('/') +
        '\t' + [
            subject_id,
            $('input[name=gender]:checked').val(),
            $("#age").val(),
            $("#country").val(),
            browser[0],
            browser[1],
            first_type,
            duration_full,
            studcod
        ].join('/');
    window.f_name =
        experiment_title +
        "_" +
        subject_id +
        "_" +
        first_type +
        "_" + studcod +
        ".txt";
    upload();
}

function upload() {
    $.post(
            "store_finish.php", {
                filename_post: f_name,
                results_post: full_data,
                sid_post: subject_id,
                cond_post: 99
            },
            function(resp) {
                console.log(resp);
                if (resp.startsWith("Fail") || resp.startsWith("Warning")) {
                    $('#div_end_error').show();
                    $("#passw_display").html('EIN FEHLER IST AUFGETRETEN! Bitte schließe die Seite NICHT und sende deine Ergebnisdaten, wenn möglich, an lkcsgaspar@gmail.com, zusammen mit folgendem Code: ' + studcod);
                } else {
                    let backlink = 'https://labs-univie.sona-systems.com/webstudy_credit.aspx?experiment_id=1001&credit_token=1e4f14a94e804d7db18d9a28ea8fffe7&survey_code=' + studcod;
                    $("#passw_display").html('<a href=' + backlink + ' target="_blank">' + backlink + '</a>');
                }
            }
        )
        .fail(function(xhr, status, error) {
            console.log(xhr);
            console.log(error);
            $('#div_end_error').show();
            $("#passw_display").html('EIN FEHLER IST AUFGETRETEN! Bitte schließe die Seite NICHT und sende deine Ergebnisdaten, wenn möglich, an lkcsgaspar@gmail.com, zusammen mit folgendem Code: ' + studcod);
        });
}

function dl_as_file() {
    let blobx = new Blob([full_data], {
        type: 'text/plain'
    });
    let elemx = window.document.createElement('a');
    elemx.href = window.URL.createObjectURL(blobx);
    elemx.download = f_name;
    document.body.appendChild(elemx);
    elemx.click();
    document.body.removeChild(elemx);
}

let browser = (function() {
    let ua = navigator.userAgent,
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


// texts to display before blocks

let block_texts = [];

function set_block_texts() {
    block_texts.push(`
        Sehr gut! Nun beginnt der erste der beiden Experimentalblöcke. Die Aufgabe bleibt gleich, aber die Bilder sind eingefärbt. Zur Erinnerung:<br>
        <br>
        Drücke <b>"<span class="pos_key"></span>"</b>, wenn das Bild etwas <b>Positives</b> zeigt.<br>Drücke <b>"<span class="neg_key"></span>"</b>, wenn das Bild etwas <b>Negatives</b> zeigt.
        <br>
        <br>
        Bitte antworte sowohl schnell als auch korrekt.
    `);
    block_texts.push(`
        Nun folgt der letzte der beiden Experimentalblöcke. Die Farbe der Bilder ist erneut verändert, doch die Aufgabe bleibt gleich:
        <br>
        Drücke <b>"<span class="pos_key"></span>"</b>, wenn das Bild etwas <b>Positives</b> zeigt.<br>Drücke <b>"<span class="neg_key"></span>"</b>, wenn das Bild etwas <b>Negatives</b> zeigt.
        <br>
        <br>
        Antworte sowohl schnell als auch korrekt.
    `);
}


// stimulus sequence generation

function names_to_dicts(thefilenames) {
    let dict_list = [];
    let abbr_dict = {
        'p': 'positive',
        'n': 'negative'
    };
    shuffle(thefilenames).forEach((fname) => {
        let bits;
        let newdict = {
            'file': fname
        };
        fname = fname.slice(0, -4);
        let splitted;
        if (fname.indexOf("_p_") !== -1) {
            newdict.valence = 'positive';
            splitted = fname.split("_p_");
        } else {
            newdict.valence = 'negative';
            splitted = fname.split("_n_");
        }
        newdict.name = splitted[0];
        newdict.color = splitted[1];
        dict_list.push(newdict);
    });
    return dict_list;
}

// the task

let teststim,
    incorrect = 0,
    block_trialnum,
    rt_data_dict,
    trial_stim,
    keys_code = 'NA';
let can_start = false;

let correct_key = "none";
let blocknum = 1;
let rt_start = 99999;
let stim_start = 0;
let listen = false;

function image_display(img_name) {
    if (trial_stim.valence == "positive") {
        correct_key = key_for_pos;
    } else {
        correct_key = key_for_neg;
    }
    window.warmup_needed = true;
    chromeWorkaroundLoop();
    setTimeout(function() {
        let img = images[img_name];
        let ratio = img.naturalHeight / img.naturalWidth;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.width * ratio);
        requestPostAnimationFrame(function() {
            stim_start = now();
            warmup_needed = false;
            listen = true;
        });
    }, raf_warmup); // time needed for raF timing "warmup"
}

// isi
let isi_delay;

function isi() {
    isi_delay = randomdigit(1, isi_delay_minmax[1] - isi_delay_minmax[0]);
    setTimeout(function() {
        image_display(trial_stim.file);
    }, isi_delay);
}

function practice_eval() {
    let min_ratio;
    min_ratio = 0.8;
    let is_valid = true;
    let types_failed = [];
    for (let it_type in rt_data_dict) {
        let rts_correct = $.grep(rt_data_dict[it_type], function(rt_item) {
            return rt_item > 150;
        });
        corr_ratio = rts_correct.length / rt_data_dict[it_type].length;
        if (corr_ratio < min_ratio) {
            is_valid = false;
            types_failed.push(
                " " +
                it_type +
                " Bilder (" +
                Math.floor(corr_ratio * 10000) / 100 +
                '% korrekt)'
            );
        }
    }
    if (is_valid == false) {
        let feedback_text =
            "Du musst die Übungsrunde wiederholen, da du zu wenig korrekte Antworten für " +
            types_failed.join(" und ") +
            " hast.<br><br>Zur Erinnerung siehst du unten noch einmal die Instruktionen.<br><hr>";
        $("#feedback_id").html(feedback_text);
    }
    return is_valid;
}

let warn_set;

function next_trial() {
    if (teststim.length > 0) {
        trial_stim = teststim.shift();
        block_trialnum++;
        isi();
    } else {
        if ((crrnt_phase !== 'practice') || (practice_eval())) {
            blocknum++;
            $("#infotext").html(block_texts.shift());
            $("#feedback_id").text('');
            nextblock();
        } else {
            nextblock();
        }
    }
}

let full_data = ["subject_id", "phase", "block_number", "trial_number", "resp_number", "stimulus_shown", "color", "valence", "response_key", "rt_start", "incorrect", "isi", "date_in_ms"].join('\t') + '\n';

let resp_num = 1;

function add_response() {
    let curr_type = trial_stim.valence;
    if (!(curr_type in rt_data_dict)) {
        rt_data_dict[curr_type] = [];
    }
    if (resp_num == 1) {
        if (incorrect == 1) {
            rt_data_dict[curr_type].push(-1);
        } else {
            rt_data_dict[curr_type].push(rt_start);
        }
    }
    full_data += [subject_id,
        crrnt_phase,
        blocknum,
        block_trialnum,
        resp_num,
        trial_stim.file,
        trial_stim.color,
        trial_stim.valence,
        keys_code,
        rt_start,
        incorrect,
        isi_delay + isi_delay_minmax[0] + raf_warmup,
        String(new Date().getTime())
    ].join('\t') + '\n';
    rt_start = 99999;
    keys_code = "NA";
    if (incorrect == 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resp_num = 1;
        next_trial();
    } else {
        incorrect = 0;
        listen = true;
        resp_num++;
    }
}

let crrnt_phase;

let prc_num = 0;

function nextblock() {
    document.documentElement.style.cursor = 'auto';
    if (blocknum <= 3) {
        block_trialnum = 0;
        if (blocknum == 1) {
            crrnt_phase = 'practice';
            teststim = names_to_dicts(stim_practice[prc_num]);
            prc_num++;
            if (prc_num >= stim_practice.length) {
                prc_num = 0;
                console.log('Practice reset to zero!');
            }
        } else if (blocknum == 2) {
            if (first_type == 'color') {
                crrnt_phase = 'colors';
            } else {
                crrnt_phase = 'bws';
            }
            teststim = get_main(stim_main1);
        } else {
            if (first_type == 'color') {
                crrnt_phase = 'bws';
            } else {
                crrnt_phase = 'colors';
            }
            teststim = get_main(stim_main2);
        }
        // teststim = teststim.slice(-6);
        rt_data_dict = {};
        $("#div_stimdisp").hide();
        $('.pos_key').text(key_for_pos.toUpperCase());
        $('.neg_key').text(key_for_neg.toUpperCase());
        $("#intro").show();
    } else {
        document.body.style.backgroundColor = '#ccc';
        $("#div_stimdisp").hide();
        ending();
        close_fulls();
        $("#Bye").show();
    }
}

function runblock() {
    $("#intro").hide();
    $("#start_text").show();
    $("#div_stimdisp").show();
    document.documentElement.style.cursor = 'none';
    window.scrollTo(0, 0);
    can_start = true;
}

function get_main(thefilenams) {
    console.log('get_main()');
    let blck_itms_temp = names_to_dicts(thefilenams);
    blck_itms_temp = shuffle(blck_itms_temp); // shuffle it, why not
    let safecount = 0; // just to not freeze the app if sth goes wrong
    let stim_dicts_f = []; // in here the final list of dictionary items is collected, one by one
    while (blck_itms_temp.length > 0) { // stop if all items from blck_itms_temp were use up
        let dict_item = blck_itms_temp[0];
        safecount++;
        if (safecount > 9911) {
            console.log('break due to unfeasable safecount');
            break;
        }
        let good_indexes = []; // will collect the indexes where the dict item may be inserted
        let dummy_dict = [{
            'item': '-',
            'type': '-'
        }]; // dummy dict to the end
        let stim_dicts_f_d = stim_dicts_f.concat(dummy_dict);
        stim_dicts_f_d.forEach((f_item, f_index) => {
            if (!diginto_dict(stim_dicts_f, f_index, 'name', 20).includes(dict_item.name)) {
                good_indexes.push(f_index); // if fine, do add as good index
            }
        });
        if (good_indexes.length == 0) {
            if (safecount > 99) {
                console.log('no good_indexes - count', safecount);
            }
            blck_itms_temp = shuffle(blck_itms_temp); // reshuffle
        } else { // if there are good places, choose one randomly, insert the new item, and remove it from blck_itms_temp
            stim_dicts_f.splice(rchoice(good_indexes), 0, blck_itms_temp.shift());
        }
    }
    console.log('safe count:', safecount);
    return (stim_dicts_f); // return final list (for blck_items let assignment)
}


function diginto_dict(dcts, indx, key_name, min_dstnc) {
    let strt;
    if (indx - min_dstnc < 0) { // if starting index is negative, it counts from the end of the list; thats no good
        strt = 0; // so if negative, we just set it to 0
    } else {
        strt = indx - min_dstnc; // if not negative, it can remain the same
    }
    let all_vals = dcts.slice(strt, indx + min_dstnc).map(a => a[key_name]);
    return (all_vals); // return all values for the specified dict key within the specified distance (from the specified dictionary)
}

$(document).ready(function() {
    $(document).keyup(function(es) {
        if (can_start === true && (es.code == 'Space' || es.keyCode == 32)) {
            can_start = false;
            $("#start_text").hide();
            next_trial();
        }
    });
    $(document).keydown(function(e) {
        if (listen === true) {
            rt_start = now() - stim_start;
            keys_code = e.key;
            if (['e', 'i'].includes(keys_code)) {
                listen = false;
                if (keys_code == correct_key) {
                    add_response();
                } else {
                    incorrect = 1;
                    add_response();
                }
            }
        }
    });
});

let countrs = ["Österreich", "Afghanistan", "Albanien", "Algerien", "Andorra", "Angola", "Antigua und Barbuda", "Argentinien", "Armenien", "Aserbaidschan", "Australien", "Bahamas", "Bahrain", "Bangladesch", "Barbados", "Belarus", "Belgien", "Belize", "Benin", "Bhutan", "Bolivien", "Bosnien und Herzegowina", "Botswana", "Brasilien", "Brunei", "Bulgarien", "Burkina Faso", "Burma", "Burundi", "Chile", "China", "Costa Rica", "Deutschland", "Dominica", "Dominikanische Republik", "Dschibuti", "Dänemark", "Ecuador", "El Salvador", "Elfenbeinküste", "Eritrea", "Estland", "Fidschi", "Finnland", "Frankreich", "Gabun", "Gambia", "Georgien", "Ghana", "Grenada", "Griechenland", "Guatemala", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Honduras", "Hongkong", "Indien", "Indonesien", "Irak", "Iran", "Irland", "Island", "Israel", "Italien", "Jamaika", "Japan", "Jemen", "Jordanien", "Kambodscha", "Kamerun", "Kanada", "Kap Verde", "Kasachstan", "Katar", "Kenia", "Kirgisistan", "Kiribati", "Kolumbien", "Komoren", "Kongo", "Kosovo", "Kroatien", "Kuba", "Kuwait", "Laos", "Lesotho", "Lettland", "Libanon", "Liberia", "Libyen", "Liechtenstein", "Litauen", "Luxemburg", "Macau", "Madagaskar", "Malawi", "Malaysia", "Malediven", "Mali", "Malta", "Marokko", "Marshallinseln", "Mauretanien", "Mauritius", "Mazedonien", "Mexiko", "Mikronesien", "Moldawien", "Monaco", "Mongolei", "Montenegro", "Mosambik", "Namibia", "Nauru", "Nepal", "Neuseeland", "Nicaragua", "Niederlande", "Niger", "Nigeria", "Nordkorea", "Norwegen", "Oman", "Pakistan", "Palau", "Panama", "Papua-Neuguinea", "Paraguay", "Peru", "Philippinen", "Polen", "Portugal", "Ruanda", "Rumänien", "Russland", "Salomonen", "Sambia", "Samoa", "San Marino", "Saudi-Arabien", "Schweden", "Schweiz", "Senegal", "Serbien", "Seychellen", "Sierra Leone", "Simbabwe", "Singapur", "Slowakei", "Slowenien", "Somalia", "Spanien", "Sri Lanka", "St. Kitts und Nevis", "St. Lucia", "St. Vincent", "Sudan", "Surinam", "Swasiland", "Syrien", "São Tomé und Príncipe", "Südafrika", "Südkorea", "Südsudan", "Tadschikistan", "Taiwan", "Tansania", "Thailand", "Timor Leste", "Togo", "Tonga", "Trinidad und Tobago", "Tschad", "Tschechische Republik", "Tunesien", "Turkmenistan", "Tuvalu", "Türkei", "Uganda", "Ukraine", "Ungarn", "Uruguay", "Usbekistan", "Vanuatu", "Vatikanstadt", "Venezuela", "Vereinigte Arabische Emirate", "Vereinigte Staaten", "Vereinigtes Königreich", "Vietnam", "Zentralafrikanische Republik", "Zypern", "Ägypten", "Äquatorialguinea", "Äthiopien"];
