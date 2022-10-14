// HOST
const S3_HOST = 'https://d3it5ttaa2apin.cloudfront.net/';
const server = 'http://localhost:3001';
const API_VERSION = '1.0';

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
const note_names = [];
const note_classifications = [];
const note_all_elements = [];
const note_ids = [];
let note_list_obj;
let search_note_list_obj;
let showNote_note_obj;
let current_version_obj;
let shared_note_obj;

// OCR info ----------------------------------------
const OCR_delete_ids = [];
const OCR_elements = [];

// Canvas ------------------------------------------
const canvas_width = 600;
const canvas_height = 500;

// Sharing Permission ------------------------------
const authorizationList = {
  forbidden: 0,
  read: 1,
  comment: 2,
  update: 4,
  delete: 8,
  admin: 16,
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

// 當前欲刪除的筆記物件
let current_delete_element;

// 按蒐藏的狀態
const note_savedStatus = {};

// 註釋資訊
let current_annotation_element;

// 筆記preview資訊
const upload_preview_element = [];
