// HOST
let S3_HOST = 'https://d3it5ttaa2apin.cloudfront.net/';
let server = 'http://localhost:3001';
let API_VERSION = '1.0';

// user info --------------------------------------
let user_id;
let user_picture;
let user_name;
let user_email;

// user_msg_info ----------------------------------
let current_user_msg;

// note info --------------------------------------
let ver_info; // 筆記版本資料
let current_note_id;
let current_note_class;
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

// 按蒐藏的狀態
let note_savedStatus = {};

// 註釋資訊
let current_annotation_element;

// 筆記preview資訊
let upload_preview_element = [];

// 轉換時間格式
const timeConverter = (date) => {
  dataValues = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ];
  let timeFormat = `${date.getFullYear()}/${
    date.getMonth() + 1
  }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  return timeFormat;
};

// // Socket
// let socket = io();

// // Loading
// $('body').addClass('cover-loading');
// $('body').append(loading_html);

// TODO: 只在有需求的頁面Load相對應的function
// 預先讀取
$(window).on('load', async function () {
  // $('#share-btn').prop('disabled', true);

  // 拿取User的Profile;
  await profile();

  // 發送socket上線
  socket.emit('authentication', user_email);

  // 拿取User所有通知
  await getUserMsg();
  await showUserMsg();

  // 拿取User所有note的資訊;
  await getUserNotes();

  // 畫出NavList資訊
  await showNoteList(note_list_obj, $('#sidebar-nav'));

  // 剛開始讀取使用者最近剛編輯的文章
  await getlatestNode();

  // 剛開始就點選筆記
  await notePreClick();

  // 讀取完頁面後，Note Nav點開目前的note

  // Loading結束
  // $('.wrapper-loading').remove();
  // $('body').removeClass('cover-loading');
});
