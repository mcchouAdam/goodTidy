const { getShareNotes, getNoteById } = require('../models/note_model');
const {
  showShareDetail,
  showSocialCards,
  showPagination,
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
  const result = await getNoteById(note_id);
  const elements_html = await showShareDetail(result);

  return res.render('shareDetailPage', {
    elements: JSON.stringify(elements_html),
  });
};

module.exports = {
  socialPage,
  shareDetailPage,
};
