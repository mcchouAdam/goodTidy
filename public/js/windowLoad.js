// HOST
let S3_HOST = 'https://goodtidy.s3.amazonaws.com/';
let server = 'http://localhost:3001';
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
let OCR_delete_ids = [];
let OCR_elements = [];

// Canvas ------------------------------------------
let canvas_width = 600;
let canvas_height = 500;

// Sharing Permission ------------------------------
const authorizationList = {
  'forbidden': 0,
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

// Loading div ------------------------------------
let loading_html = `
      <div class="wrapper-loading">
        <span class="dot-loading"></span>
        <div class="dots-loading">
          <span class="span-loading"></span>
          <span class="span-loading"></span>
          <span class="span-loading"></span>
        </div>
      </div>
    `;

// 筆記公開資訊
let note_isSharing;
let note_url_permission;
let sharing_descrition;
let sharing_image;
let sharing_url;
let tags;

// 當前欲刪除的筆記物件
let current_delete_element;

// 註釋資訊
let current_annotation_element;

// 筆記preview資訊
let upload_preview_element = [];

// // Loading
// $('body').addClass('cover-loading');
// $('body').append(loading_html);

// TODO: 只在有需求的頁面Load相對應的function
// 預先讀取
$(window).on('load', async function () {
  // 拿取User的Profile;
  await profile();

  // 拿取User所有note的資訊;
  await getUserNotes();

  // 拿取[社群頁面]排序狀態
  await getSocialSortingColor();

  // 剛開始讀取使用者最近剛編輯的文章
  await getlatestNode();

  // Loading結束
  // $('.wrapper-loading').remove();
  // $('body').removeClass('cover-loading');

  // dragable 上一步&下一步
  $('.contour-pic') // 圖形
    .add('.div_addtextarea') // 文字
    .mouseup(function (e) {
      const element = e.target.parentElement;
      const top = element.style.top;
      const left = element.style.left;
      stepAppend(element, 'drag', top, left, '');
    });
});
