const {
  getShareNotes,
  getNoteById,
  createComment,
  getComments,
} = require('../models/note_model');
const {
  showShareDetail,
  showSocialCards,
  showPagination,
  showCommentsDetail,
} = require('../../utils/showPage');

const socialPage = async (req, res) => {
  const paging = +req.query.paging;
  const result = await getShareNotes(paging);
  const cards_html = await showSocialCards(result);
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
  const comments = await getComments(note_id);
  const comments_html = await showCommentsDetail(comments, note_id);

  console.log(noteDetails);

  return res.render('shareDetailPage', {
    elements: JSON.stringify(noteDetails),
    comments: JSON.stringify(comments_html),
  });
};

const createComments = async (req, res) => {
  if (req.permission < 3) {
    return res.status(403).json({ 'data': '您沒有權限留言' });
  }

  req.body.user_id = req.user.id;
  const data = req.body;
  const result = await createComment(data);

  return res.status(200).json(`comment_id ${result} created successfully!`);
};

module.exports = {
  socialPage,
  shareDetailPage,
  createComments,
};
