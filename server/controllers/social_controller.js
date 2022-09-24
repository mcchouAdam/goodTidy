require('dotenv').config();
const { S3_HOST } = process.env;
const authorizationList = {
  'forbidden': 0,
  'read': 1,
  'comment': 2,
  'update': 4,
  'delete': 8,
  'admin': 16,
};

const {
  getShareNotes,
  getNoteById,
  createComment,
  updateComment,
  deleteComment,
  getComments,
} = require('../models/note_model');

const { getMessages } = require('../models/user_model');

Notes = require('../models/note_model');
const {
  showShareDetail,
  showSocialCards,
  showPagination,
} = require('../../utils/showPage');

// [社群頁面] 顯示所有分享的筆記
const socialPage = async (req, res) => {
  const user_id = req.session.user.id;
  const paging = +req.query.paging;
  const sorting = req.query.sorting;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const search_text = req.query.search_text;
  const search_method = req.query.search_method;

  // 呈現右上Profile的資訊
  const id = req.session.user.id;
  const provider = req.session.user.provider;
  const name = req.session.user.name;
  const email = req.session.user.email;
  const picture = `${S3_HOST}/user_picture/${req.session.user.picture}`;

  const socialcards_result = await getShareNotes(
    paging,
    sorting,
    search_text,
    search_method,
    user_id,
    startDate,
    endDate
  );

  const allPages_count = socialcards_result.allPages_count;
  const currentPage = socialcards_result.currentPage;

  const cards_html = await showSocialCards(socialcards_result, user_id);
  const paging_html = await showPagination(
    paging,
    sorting,
    allPages_count,
    currentPage
  );

  return res.render('socialPage', {
    id: id,
    provider: provider,
    name: name,
    email: email,
    picture: picture,
    cards_html: JSON.stringify(cards_html),
    paging_html: JSON.stringify(paging_html),
  });
};

const shareNotePage = async (req, res) => {
  const note_id = req.query.id;
  const id = req.session.user.id;
  const provider = req.session.user.provider;
  const name = req.session.user.name;
  const email = req.session.user.email;
  const picture = `${S3_HOST}/user_picture/${req.session.user.picture}`;

  const result = await getNoteById(note_id);
  const noteDetails = await showShareDetail(result);

  return res.render('shareNotePage', {
    id: id,
    provider: provider,
    name: name,
    email: email,
    picture: picture,
    user_name: noteDetails.user_name,
    user_picture: noteDetails.user_picture,
    note_name: noteDetails.note_name,
    sharing_time: noteDetails.sharing_time,
    file_name: noteDetails.file_name,
    text_elements: JSON.stringify(noteDetails.text_elements),
    elements: JSON.stringify(noteDetails.elements),
  });
};

const createComments = async (req, res) => {
  req.body.user_id = req.session.user.id;
  const data = req.body;
  data.permission = req.permission;

  if (data.permission < authorizationList.comment) {
    return res.status(403).json({ 'msg': '您無權限留言' });
  }

  const result = await createComment(data);

  return res.status(200).json(`comment_id ${result} created successfully!`);
};

const updateComments = async (req, res) => {
  req.body.user_id = req.session.user.id;
  const data = req.body;
  const result = await updateComment(data);

  if (result === 0) {
    return res.status(403).json({ 'msg': '您無權修改別人留言' });
  } else {
    return res.status(200).json({ 'msg': '修改留言成功' });
  }
};

const deleteComments = async (req, res) => {
  req.body.user_id = req.session.user.id;
  const data = req.body;
  const result = await deleteComment(data);

  if (result === 0) {
    return res.status(403).json({ 'msg': '您無權刪除別人留言' });
  } else {
    return res.status(200).json({ 'msg': '成功刪除留言' });
  }
};

// 呈現特定人分享的網頁資訊
const showSharedNote = async (req, res) => {
  const annotion_user_id = req.session.user.id;
  const annotion_user_name = req.session.user.name;
  const note_id = req.params.note_id;

  // profile資訊
  const id = req.session.user.id;
  const provider = req.session.user.provider;
  const name = req.session.user.name;
  const email = req.session.user.email;
  const picture = `${S3_HOST}/user_picture/${req.session.user.picture}`;

  const result = await getNoteById(note_id);
  const noteDetails = await showShareDetail(result);

  return res.render('sharedToOtherNote', {
    permission: req.permission,
    annotion_user_id: annotion_user_id,
    annotion_user_name: annotion_user_name,
    id: id,
    provider: provider,
    name: name,
    email: email,
    picture: picture,
    note_id: note_id,
    user_name: noteDetails.user_name,
    user_email: noteDetails.user_email,
    user_picture: noteDetails.user_picture,
    note_name: noteDetails.note_name,
    file_name: noteDetails.file_name,
    text_elements: JSON.stringify(noteDetails.text_elements),
    elements: JSON.stringify(noteDetails.elements),
  });
};

// 拿取使用者的所有通知
const showUserMessage = async (req, res) => {
  req.body.user_id = req.session.user.id;
  req.body.user_email = req.session.user.email;
  const data = req.body;
  const UserMsg = await getMessages(data);

  console.log('UserMsg:', UserMsg);
  return res.status(200).json({ 'data': UserMsg });
  // if (result === 0) {
  //   return res.status(403).json({ 'msg': '您無權刪除別人留言' });
  // } else {
  //   return res.status(200).json({ 'msg': '成功刪除留言' });
  // }
};

module.exports = {
  socialPage,
  shareNotePage,
  createComments,
  updateComments,
  deleteComments,
  showSharedNote,
  showUserMessage,
};
