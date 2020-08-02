/*jshint esversion: 6 */

let neg_pics = ["injury_n_bw.png", "attack2_n_bw.png", "execution3_n_bw.png", "abuse2_n_bw.png", "abuse_n_bw.png", "hanging_n_bw.png", "drunkard_n_bw.png", "vomit2_n_bw.png", "argument4_n_bw.png", "handcuff2_n_bw.png", "noose_n_bw.png", "argument3_n_bw.png", "argument2_n_bw.png", "dispute_n_bw.png", "argument6_n_bw.png", "hazard_n_bw.png", "hitman_n_bw.png", "sorrow2_n_bw.png", "murder2_n_bw.png", "gunman2_n_bw.png", "beggar2_n_bw.png", "skull2_n_bw.png", "scolding2_n_bw.png", "gunman3_n_bw.png", "knife_n_bw.png", "axe_n_bw.png", "accident2_n_bw.png", "roach2_n_bw.png", "vomit_n_bw.png", "falling6_n_bw.png", "hand_injury_n_bw.png", "granade_n_bw.png", "robber_n_bw.png", "bazooka_n_bw.png", "pollution2_n_bw.png", "gunman_n_bw.png", "drunk_n_bw.png", "tick_n_bw.png", "axe3_n_bw.png", "scorpion2_n_bw.png", "mosquito_n_bw.png", "gasmask2_n_bw.png", "handcuff_n_bw.png", "knife2_n_bw.png", "pollution_n_bw.png", "mosquito2_n_bw.png", "knife4_n_bw.png", "snake2_n_bw.png", "wasp_n_bw.png", "machete_n_bw.png", "tank2_n_bw.png", "soldier2_n_bw.png", "gun_n_bw.png", "kalashnikov_n_bw.png", "tank_n_bw.png", "wildwest_n_bw.png", "sniper_n_bw.png", "rifle_n_bw.png", "skull_n_bw.png", "snake_n_bw.png"];

let pos_pics = ["trapeze4_p_bw.png", "wedding2_p_bw.png", "love_p_bw.png", "singer3_p_bw.png", "couple6_p_bw.png", "romance_p_bw.png", "volleyball_p_bw.png", "champion_p_bw.png", "euphoria_p_bw.png", "iceskater3_p_bw.png", "success2_p_bw.png", "affection2_p_bw.png", "cardio_p_bw.png", "handball_p_bw.png", "kiss4_p_bw.png", "ballet_p_bw.png", "basketball4_p_bw.png", "propose_p_bw.png", "kiss3_p_bw.png", "joy_p_bw.png", "acrobat_p_bw.png", "trapeze_p_bw.png", "jump2_p_bw.png", "happiness_p_bw.png", "surfer2_p_bw.png", "skiing_p_bw.png", "soccer2_p_bw.png", "father2_p_bw.png", "propose3_p_bw.png", "skateboard2_p_bw.png", "badminton_p_bw.png", "jump_p_bw.png", "highjump4_p_bw.png", "highjump_p_bw.png", "acrobat3_p_bw.png", "couple5_p_bw.png", "skiing2_p_bw.png", "dance2_p_bw.png", "ferris_wheel_p_bw.png", "concert_p_bw.png", "iceskater_p_bw.png", "skateboard_p_bw.png", "trapeze3_p_bw.png", "tennis_p_bw.png", "handball2_p_bw.png", "winner_p_bw.png", "rockstar_p_bw.png", "carefree_p_bw.png", "basketball_p_bw.png", "breakdance_p_bw.png", "skiing3_p_bw.png", "soccer_p_bw.png", "aerobics_p_bw.png", "highjump2_p_bw.png", "snowboard2_p_bw.png", "couple7_p_bw.png", "gymnastics3_p_bw.png", "highjump3_p_bw.png", "dog3_p_bw.png", "poledance_p_bw.png"];

neg_pics = shuffle(neg_pics);
pos_pics = shuffle(pos_pics);

function prep_prac() {
    let pracs = [];
    neg_pics.forEach((it, i) => {
        pracs.push(it);
        pracs.push(pos_pics[i]);
    });
    let prac_len = 10;
    let outp = pracs.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / prac_len);
        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [];
        }
        resultArray[chunkIndex].push(item);
        return resultArray;
    }, []);
    outp = outp.map(lst => shuffle(lst));
    return (outp);
}

let stim_practice = prep_prac();

let all_bw = neg_pics.concat(pos_pics);

let stims_colored = all_bw.flatMap(fnam => [fnam.replace('_bw.png', '_red.png'), fnam.replace('_bw.png', '_green.png')]);

let stims_bw = all_bw.flatMap(fnam => [fnam.replace('_bw.png', '_black.png'), fnam.replace('_bw.png', '_white.png')]);

let stim_main1, stim_main2, first_type;

if (Math.random() < 0.5) {
    stim_main1 = stims_colored;
    stim_main2 = stims_bw;
    first_type = 'color';
} else {
    stim_main1 = stims_bw;
    stim_main2 = stims_colored;
    first_type = 'bw';
}


let all_file_names = all_bw.concat(stim_main1, stim_main2);
