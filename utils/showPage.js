require('dotenv').config();
const { S3_HOST, SERVER_HOST } = process.env;
const { timeConverter } = require('./util');

const showShareDetail = async function (data) {
  // console.log(data);
  const note_version_info = data[0].version_info;
  const newest_version_elements =
    note_version_info[note_version_info.length - 1].elements;
  const newest_version_name =
    note_version_info[note_version_info.length - 1].version_name;
  const newest_version_text_elements =
    note_version_info[note_version_info.length - 1].text_elements;
  const note_name = data[0].note_name;
  const note_pic = data[0].sharing_image;
  const file_name = data[0].file_name;
  // console.log('newest_version_text_elements', newest_version_text_elements);

  const result = {
    'note_name': note_name,
    'note_pic': `${S3_HOST}/sharing_image/${note_pic}`,
    'version_name': newest_version_name,
    'file_name': file_name,
    'elements': newest_version_elements,
    'newest_version_text_elements': newest_version_text_elements,
  };

  return result;
};

// TODO: showCommentsDetail 與 showSocialCards 留言板部分重複
const showCommentsDetail = async function (comments, note_id) {
  // console.log(comments);
  // const note_id = comments[0].note_id;
  const comments_num = comments.length;
  let comment_cards_html = '';
  let comment_btn_html = `<button class="btn" id="comment-btn" type="button" data-bs-toggle="modal" data-bs-target="#msgModal-${note_id}" style="font-size:16px">
      <i class="fa fa-solid fa-comments" style="color:green">
           <span id="comments_num">${comments_num}</span>
       </i>
  </button>`;

  comments.map((comment) => {
    comment_cards_html += `
        <div class="card border-dark mb-3" style="max-width: 18rem;">
            <div class="card-header"><img class="profile-pic mr-3" src="${S3_HOST}/user_picture/${
      comment.user_picture
    }"/><span>${comment.user_name}</span>
            <p class="card-text"><small class="text-muted">留言時間: ${timeConverter(
              +comment.created_time
            )}</small></p>
            </div>
            <div class="card-body text-dark">
            <p class="card-text"><small class="text-muted"></small>${
              comment.contents
            }</p>
            </div>
        </div>`;
  });

  comment_modal_html = `
      <div class="modal fade" id="msgModal-${note_id}" tabindex="-1" aria-labelledby="msgModal-${note_id}" aria-hidden="true">
          <div class="modal-dialog"></div>
          <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">留言板板</h5>
                    <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close" position="right"></button>
                </div>
                <div class="input-group">
                <div class="form-outline"></div>
              </div>
              <div class="modal-body"></div>
              <div class="input-group rounded">
                  <input class="form-control rounded" type="search" placeholder="Search" aria-label="Search" aria-describedby="search-addon"/>
                      <span class="input-group-text border-0" id="search-addon">
                          <i class="fa fa-search"></i>
                      </span>
              </div>
              <div class="input-group rounded">
                  ${comment_cards_html}
              </div>
              <div class="modal-footer"></div>
              <div class="row d-flex justify-content-center">
              <div class="card">
                  <div class="row px-3">
                  <p class="card-text"><small class="text-muted">留言小板板</small><br/> 向原作者留言吧！</p>
                  </div>
                  <div class="row px-3 form-group">
                  <textarea id="textarea_${note_id}" class="msgTextarea text-muted bg-light mt-4 mb-3" placeholder="你的筆記超棒！"></textarea>
                  </div>
                  <div class="row px-3">
                  <div class="btn btn-success ml-auto" onclick="javascript:createComments('${note_id}')">留言</div>
                  </div>
              </div>
              </div>
          </div>
      </div>`;

  let result_html = comment_btn_html + comment_modal_html;
  // console.log(result_html);

  return result_html;
};

// 分享筆記卡片
const showSocialCards = async function (data, user_id) {
  // console.log('req.session.user.id', req.session.user.id);
  // console.log('showSocialCards: ', data);

  let sharingNote_cards_html = '';
  let comment_modal_html = '';
  let comment_cards_html = '';

  // 三個分成一列，排版較好看
  let change_cardGroup = 3;
  for (let i = 0; i < data.length; i++) {
    const user_name = data[i].user_info[0].name;
    const user_picture = data[i].user_info[0].picture;
    const sharing_image = data[i].sharing_image;
    const note_name = data[i].note_name;
    const sharing_descrition = data[i].sharing_descrition;
    const sharing_time = data[i].sharing_time;
    const note_id = data[i]._id.toString();
    // const show_time = timeConverter(+sharing_time);
    const show_time = sharing_time;
    const tags = data[i].tags;
    const comments_info = data[i].comments_info;
    const comments_num = comments_info.length;

    // 畫tags
    let tags_html = '';
    if (tags) {
      tags.map((t) => {
        tags_html += `<span class="badge bg-success rounded-pill">${t}</span>`;
      });
    }

    // 檢查此篇筆記是否有被收藏過，畫紅色愛心
    const current_user = user_id;
    const red_heart = data[i].saved_user_id.indexOf(current_user);
    let heart_color;

    if (red_heart === -1) {
      heart_color = 'grey';
    } else {
      heart_color = 'red';
    }

    let saved_num = 0;
    if (data[i].saved_user_id) {
      const saved_info = data[i].saved_user_id;
      saved_num = saved_info.length;
    }

    comment_cards_html = '';

    // 好看照片 https://i.imgur.com/6tPhTUn.jpg

    if (change_cardGroup == 3) {
      sharingNote_cards_html += '<div class="card-group">';
    }

    sharingNote_cards_html += `<div class="card">
        <div class="card-header"><img class="profile-pic mr-3" src="${S3_HOST}/user_picture/${user_picture}"/>
        <span>${user_name}</span></div>
        <img class="card-img-top" style="width:100%;height:200px;"src="${S3_HOST}/sharing_image/${sharing_image}" alt="Card image cap">
        <div class="card-body">
        <h5 class="card-title">${note_name}</h5>
        <p class="card-text">${sharing_descrition}</p>
        <p class="card-text"><small class="text-muted">發文時間: ${show_time}</small>
        <br />
        <button class="btn" id="comment-btn" type="button" data-bs-toggle="modal" data-bs-target="#msgModal-${note_id}" style="font-size:16px">
            <i class="fa fa-solid fa-comments" style="color:green">
                <span id="comments_num">${comments_num}</span>
            </i>
        </button>
        <button class="btn btn-heart" onclick="javascript:createSave('${note_id}')">
            <i class="fa fa-heart" aria-hidden="true" style="color:${heart_color}"></i>
            <span class="saved_num">${saved_num}</span>
        </button>
        <button class="btn">
            <a href="${SERVER_HOST}/shareDetailPage?id=${note_id}">
                <i class="fa fa-eye" aria-hidden="true"></i>
            </a>
        </button>
        </p>
        ${tags_html}
        </div>
    </div>`;

    change_cardGroup--;
    if (change_cardGroup == 0) {
      change_cardGroup = 3;
      sharingNote_cards_html += '</div>';
    }

    // TODO: 重構把 comments_info 拉成獨立的function
    comments_info.map((comment) => {
      comment_cards_html += `
        <div class="card border-dark mb-3" style="max-width: 18rem;">
          <div class="card-header">
            <img class="profile-pic mr-3" src="${S3_HOST}/user_picture/${comment.user_picture}"/>
            <span>${comment.user_name}</span>
            <a href="javascript:updateComment('${comment._id}', '${comment.note_id}')">
              <i class="fa fa-ellipsis-h" aria-hidden="true"></i>
            </a>
            <a href="javascript:deleteComment('${comment._id}', '${comment.note_id}')">
              <i class="fa fa-times" aria-hidden="true"></i>
            </a>
            <p class="card-text"><small class="text-muted">留言時間: ${comment.created_time}</small></p>
            </div>
            <div class="card-body text-dark">
            <p class="card-text"><small class="text-muted"></small>${comment.contents}</p>
            </div>
        </div>`;
    });

    comment_modal_html += `
    <div class="modal fade" id="msgModal-${note_id}" tabindex="-1" aria-labelledby="msgModal-${note_id}" aria-hidden="true">
        <div class="modal-dialog"></div>
        <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">留言板板</h5>
                  <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close" position="right"></button>
              </div>
              <div class="input-group">
              <div class="form-outline"></div>
            </div>
            <div class="modal-body"></div>
            <div class="input-group rounded">
                <input class="form-control rounded" type="search" placeholder="Search" aria-label="Search" aria-describedby="search-addon"/>
                    <span class="input-group-text border-0" id="search-addon">
                        <i class="fa fa-search"></i>
                    </span>
            </div>
            <div class="input-group rounded">
                ${comment_cards_html}
            </div>
            <div class="modal-footer"></div>
            <div class="row d-flex justify-content-center">
            <div class="card">
                <div class="row px-3">
                <p class="card-text"><small class="text-muted">留言小板板</small><br/> 向原作者留言吧！</p>
                </div>
                <div class="row px-3 form-group">
                <textarea id="textarea_${note_id}" class="text-muted bg-light mt-4 mb-3" placeholder="你的筆記超棒！"></textarea>
                </div>
                <div class="row px-3">
                <div class="btn btn-success ml-auto" onclick="javascript:createComments('${note_id}')">留言</div>
                </div>
            </div>
            </div>
        </div>
    </div>`;
  }

  sharingNote_cards_html += comment_modal_html;

  return sharingNote_cards_html;
};

// Draw分頁
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

const showShareToOtherList = async function (shareList, note_id) {
  // console.log(shareList[0]);

  let shareList_html = '';
  let permission;
  try {
    shareList.map((p) => {
      switch (p.permission) {
        case 1:
          permission = '允許觀看';
          break;
        case 3:
          permission = '允許留言';
          break;
      }
      shareList_html += `<li class="list-group-item d-flex justify-content-between align-items-center">
                            ${p.user_email}
                          <span class="badge bg-primary rounded-pill">${permission}</span>
                        </li>`;
    });

    // href icon
    // <a href="${SERVER_HOST}/shareDetailPage?id=${current_note_id}">
    //   <i class="fa fa-share-alt" aria-hidden="true"></i>
    // </a>;
  } catch (error) {
    console.log(error);
  }

  return shareList_html;
};

module.exports = {
  showShareDetail,
  showSocialCards,
  showPagination,
  showShareToOtherList,
  showCommentsDetail,
};
