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
let shared_note_obj;

// OCR info ----------------------------------------
let OCR_ids = [];
let OCR_elements = [];

// Canvas ------------------------------------------
let canvas_width = 600;
let canvas_height = 500;

// Sharing Permission ------------------------------
const authorizationList = {
  'read': 1,
  'comment': 2,
  'update': 4,
  'delete': 8,
  'admin': 16,
};

const permissionToName = {
  1: '允許觀看',
  2: '允許留言',
};

// 筆記公開資訊
let note_isSharing;
let note_url_permission;
let sharing_descrition;
let sharing_image;
let sharing_url;
let tags;

// 預先讀取
$(window).on('load', async function () {
  // [筆記上傳頁面] 限制預覽頁面寬度
  $('#fontOCRCanvas').attr('width', canvas_width).attr('height', canvas_height);

  // 拿取User的Profile;
  await profile();

  // 拿取User所有note的資訊;
  await getUserNotes();

  // 拿取[社群頁面]排序狀態
  // await getSocialSortingColor();

  // console.log('current_user_id: ', user_id);
});
