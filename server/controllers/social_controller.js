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
  showCommentsDetail,
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

  console.log('search_text', search_text, 'search_method', search_method);

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
    cards_html: JSON.stringify(cards_html),
    paging_html: JSON.stringify(paging_html),
  });
};

const shareDetailPage = async (req, res) => {
  const note_id = req.query.id;
  console.log(req.query);
  const result = await getNoteById(note_id);
  const noteDetails = await showShareDetail(result);
  // const comments = await getComments(note_id);
  // const comments_html = await showCommentsDetail(comments, note_id);

  console.log(noteDetails);

  return res.render('shareDetailPage', {
    elements: JSON.stringify(noteDetails),
    // comments: JSON.stringify(comments_html),
  });
};

const createComments = async (req, res) => {
  // if (req.permission < 3) {
  //   return res.status(403).json({ 'data': '您沒有權限留言' });
  // }
  req.body.user_id = req.session.user.id;
  const data = req.body;
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

module.exports = {
  socialPage,
  shareDetailPage,
  createComments,
  updateComments,
  deleteComments,
};
