require('dotenv').config();
const { S3_HOST, SERVER_HOST } = process.env;
const { timeConverter } = require('./util');

const showShareDetail = async function (data) {
  const note_version_info = data[0].version_info;
  const newest_version_elements =
    note_version_info[note_version_info.length - 1].elements;

  return newest_version_elements;
};

const showSocialCards = async function (data) {
  let html_template = '';

  // 三個分成一列，排版較好看
  let change_cardGroup = 3;
  for (let i = 0; i < data.length; i++) {
    const user_name = data[i].user_info[0].name;
    const user_picture = data[i].user_info[0].picture;
    const sharing_image = data[i].sharing_image;
    const note_name = data[i].note_name;
    const sharing_descrition = data[i].sharing_descrition;
    const lastEdit_time = data[i].lastEdit_time;
    const note_id_href = data[i]._id.toString();
    const show_time = timeConverter(+lastEdit_time);
    // 好看照片 https://i.imgur.com/6tPhTUn.jpg

    if (change_cardGroup == 3) {
      html_template += '<div class="card-group">';
    }
    html_template += `<div class="card">
        <div class="card-header"><img class="profile-pic mr-3" src="${S3_HOST}/user_picture/${user_picture}"/>
        <span>${user_name}</span></div>
        <img class="card-img-top" src="${S3_HOST}/sharing_image/${sharing_image}" alt="Card image cap">
        <div class="card-body">
        <h5 class="card-title">${note_name}</h5>
        <p class="card-text">${sharing_descrition}</p>
        <p class="card-text"><small class="text-muted">最後修改時間: ${show_time}</small>
        <br />
        <button>留言</button>
        <button>收藏</button>
        <button><a href="${SERVER_HOST}/shareDetailPage?id=${note_id_href}">進入</a></button>
        </p>
        </div>
    </div>`;
    change_cardGroup--;
    if (change_cardGroup == 0) {
      change_cardGroup = 3;
      html_template += '</div>';
    }
  }

  return html_template;
};

const showPagination = async function (paging) {
  // 三個分成一列，排版較好看
  const paging_html = `
    <nav aria-label="Page navigation">
    <ul class="pagination justify-content-center">
        <li class="page-item"></li><a class="page-link" href="${SERVER_HOST}/socialPage?paging=${
    paging - 1
  }" aria-label="Previous"><span aria-hidden="true">&laquo;</span><span class="sr-only">Previous</span></a>
        <li class="page-item"></li><a class="page-link" href="${SERVER_HOST}/socialPage?paging=${paging}">${paging}</a>
        <li class="page-item"></li><a class="page-link" href="${SERVER_HOST}/socialPage?paging=${
    paging + 1
  }" aria-label="Next"><span aria-hidden="true">&raquo;</span><span class="sr-only">Next</span></a>
    </ul>
    </nav>`;

  return paging_html;
};

module.exports = { showShareDetail, showSocialCards, showPagination };
