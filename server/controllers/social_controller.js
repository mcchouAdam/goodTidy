require('dotenv').config();
const { S3_HOST } = process.env;

const {
  getShareNotes,
  getNoteById,
  createComment,
  updateComment,
  deleteComment,
  getComments,
} = require('../models/note_model');
Notes = require('../models/note_model');
const {
  showShareDetail,
  showSocialCards,
  showPagination,
} = require('../../utils/showPage');

const socialPage = async (req, res) => {
  // console.log('social page session', req.session);
  const user_id = req.session.user.id;
  const paging = +req.query.paging;
  const sorting = req.query.sorting;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const search_text = req.query.search_text;
  const search_method = req.query.search_method;

  const id = req.session.user.id;
  const provider = req.session.user.provider;
  const name = req.session.user.name;
  const email = req.session.user.email;
  const picture = `${S3_HOST}/user_picture/${req.session.user.picture}`;

  const result = await getShareNotes(
    paging,
    sorting,
    search_text,
    search_method,
    user_id,
    startDate,
    endDate
  );
  const cards_html = await showSocialCards(result, user_id);
  const paging_html = await showPagination(paging);

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
  const result = await createComment(data);

  return res.status(200).json(`comment_id ${result} created successfully!`);
};

const updateComments = async (req, res) => {
  req.body.user_id = req.session.user.id;
  const data = req.body;
  const result = await updateComment(data);

  return res
    .status(200)
    .json(`comment_id ${result} update contents successfully!`);
};

const deleteComments = async (req, res) => {
  req.body.user_id = req.session.user.id;
  const data = req.body;
  const result = await deleteComment(data);

  return res.status(200).json(result);
};

// 呈現特定人分享的網頁資訊
const showSharedNote = async (req, res) => {
  const annotion_user_id = req.session.user.id;
  const note_id = req.params.note_id;

  console.log('annotion_user_id', annotion_user_id);

  const result = await getNoteById(note_id);

  const noteDetails = await showShareDetail(result);
  // console.log('5555555', noteDetails);

  return res.render('sharedToOtherNote', {
    annotion_user_id: annotion_user_id,
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

module.exports = {
  socialPage,
  shareNotePage,
  createComments,
  updateComments,
  deleteComments,
  showSharedNote,
};
