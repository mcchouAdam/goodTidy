require('dotenv').config();

const { S3_HOST } = process.env;
const { authorizationList } = require('../../utils/authorization');

const {
  getShareNotes,
  getNoteById,
  createComment,
  updateComment,
  deleteComment,
} = require('../models/note_model');

const {
  getMessages,
  deleteUserMessage,
  deleteUserMessages,
} = require('../models/user_model');

const { showShareDetail, showSocialCards } = require('../../utils/showPage');

// [社群頁面] 顯示所有分享的筆記
const socialPage = async (req, res) => {
  const user_id = req.session.user.id;
  const paging = +req.query.paging;
  const { sorting, search_text, search_method } = req.query;

  // 呈現右上Profile的資訊
  const { id, provider, name, email } = req.session.user;
  const picture = `${S3_HOST}/user_picture/${req.session.user.picture}`;

  if (paging <= 0 || Number.isNaN(paging)) {
    const card_html = `
        <div id="noMatchResult" style="padding: 0 0 0 30vw;">
          <i class="bi bi-exclamation-circle" style="font-size:100px;color:#ffc107;margin: 0 0 0 15vw;"></i>
          <h1>無相關搜尋內容，請您重新查詢</h1>
        </div>`;

    return res.render('socialPage', {
      id,
      provider,
      name,
      email,
      picture,
      sorting,
      cards_html: JSON.stringify(card_html),
      currentPage: paging,
      allPagesCount: '',
    });
  }

  const socialcards_result = await getShareNotes(
    paging,
    sorting,
    search_text,
    search_method,
    user_id
  );

  const { allPages_count, currentPage } = socialcards_result;

  if (currentPage > allPages_count) {
    const card_html = `
        <div id="noMatchResult" style="padding: 0 0 0 30vw;">
          <i class="bi bi-exclamation-circle" style="font-size:100px;color:#ffc107;margin: 0 0 0 15vw;"></i>
          <h1>無相關搜尋內容，請您重新查詢</h1>
        </div>`;

    return res.render('socialPage', {
      id,
      provider,
      name,
      email,
      picture,
      sorting,
      cards_html: JSON.stringify(card_html),
      currentPage,
      allPagesCount: allPages_count,
    });
  }

  const cards_html = await showSocialCards(socialcards_result, user_id);

  return res.render('socialPage', {
    id,
    provider,
    name,
    email,
    picture,
    sorting,
    cards_html: JSON.stringify(cards_html),
    currentPage,
    allPagesCount: allPages_count,
  });
};

const shareNotePage = async (req, res) => {
  const note_id = req.query.id;
  const result = await getNoteById(note_id);
  const noteDetails = await showShareDetail(result);

  return res.render('shareNotePage', {
    id: req.session.user.id,
    provider: req.session.user.provider,
    name: req.session.user.name,
    email: req.session.user.email,
    picture: `${S3_HOST}/user_picture/${req.session.user.picture}`,
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
    return res.status(403).json({
      data: '您無權限留言',
    });
  }

  if (data.contents === '') {
    return res.status(400).json({
      data: '留言不可空白',
    });
  }

  const result = await createComment(data);

  return res.status(200).json({
    data: result,
  });
};

const updateComments = async (req, res) => {
  req.body.user_id = req.session.user.id;
  const data = req.body;
  const result = await updateComment(data);

  if (result === 0) {
    return res.status(403).json({
      data: '您無權修改別人留言',
    });
  }
  return res.status(200).json({
    data: '修改留言成功',
  });
};

const deleteComments = async (req, res) => {
  req.body.user_id = req.session.user.id;
  const data = req.body;
  const result = await deleteComment(data);

  if (result === 0) {
    return res.status(403).json({
      data: '您無權刪除別人留言',
    });
  }
  return res.status(200).json({
    data: '成功刪除留言',
  });
};

// 呈現註釋頁面
const showSharedNote = async (req, res) => {
  const { note_id } = req.params;

  // profile資訊
  const result = await getNoteById(note_id);
  const noteDetails = await showShareDetail(result);

  return res.render('sharedToOtherNote', {
    permission: req.permission,
    annotion_user_id: req.session.user.id,
    annotion_user_name: req.session.user.name,
    id: req.session.user.id,
    provider: req.session.user.provider,
    name: req.session.user.name,
    email: req.session.user.email,
    picture: `${S3_HOST}/user_picture/${req.session.user.picture}`,
    note_id,
    ShareUser_name: noteDetails.user_name,
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

  // console.log('UserMsg:', UserMsg);
  return res.status(200).json({
    data: UserMsg,
  });
};

// 刪除使用者通知
const deleteMessage = async (req, res) => {
  req.body.user_id = req.session.user.id;
  req.body.user_email = req.session.user.email;
  const data = req.body;
  await deleteUserMessage(data);

  return res.status(200).json({
    data: '成功刪除',
  });
};

// 刪除使用者全部通知
const deleteMessages = async (req, res) => {
  await deleteUserMessages(req.body);
  return res.status(200).json({
    data: '成功刪除',
  });
};

module.exports = {
  socialPage,
  shareNotePage,
  createComments,
  updateComments,
  deleteComments,
  showSharedNote,
  showUserMessage,
  deleteMessage,
  deleteMessages,
};
