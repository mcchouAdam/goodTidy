// HOST
let S3_HOST = 'https://goodtidy.s3.amazonaws.com/';
let server = 'http://localhost:3000';

// user info --------------------------------------
let user_id;
let user_picture;
let user_name;
let user_email;

// note info --------------------------------------
let ver_info; // 筆記版本資料
let note_id = 1;
let note_name;

$(window).on('load', async function () {
  await profile();
});
