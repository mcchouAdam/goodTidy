// HOST
let S3_HOST = 'https://goodtidy.s3.amazonaws.com/';
let server = 'http://localhost:3000';
let API_VERSION = '1.0';

// user info --------------------------------------
let user_id;
let user_picture;
let user_name;
let user_email;

// note info --------------------------------------
let ver_info; // 筆記版本資料
let current_note_id;
let note_name;
let note_bg;
let note_names = [];
let note_classifications = [];
let note_all_elements = [];
let note_ids = [];
let note_list_obj;
let search_note_list_obj;
let showNote_note_obj;
let current_version_obj;

// OCR info ----------------------------------------
let OCR_elements = [];

$(window).on('load', async function () {
  await profile();
  await getUserNotes();
  console.log('current_user_id: ', user_id);
});
