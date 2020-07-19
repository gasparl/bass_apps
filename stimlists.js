/*jshint esversion: 6 */

let stim_practice = ["shark_n_red.png", "truck_n_black.png"];

let stims_colored = ["shark_n_red.png", "carefree_p_green.png", "kitten_p_red.png", "kitten_p_green.png", "truck_n_green.png", "truck_n_red.png", "carefree_p_red.png", "shark_n_green.png"];

let stims_bw = ["shark_n_white.png", "carefree_p_black.png", "carefree_p_white.png", "shark_n_black.png", "truck_n_white.png", "kitten_p_white.png", "kitten_p_black.png", "truck_n_black.png"];

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


let all_file_names = stim_practice.concat(stim_main1, stim_main2);
