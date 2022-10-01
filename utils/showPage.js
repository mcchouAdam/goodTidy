require('dotenv').config();
const { S3_HOST, SERVER_HOST } = process.env;
const { timeConverter } = require('./util');

const showShareDetail = async function (data) {
  const note_version_info = data[0].version_info;
  const newest_version_elements =
    note_version_info[note_version_info.length - 1].elements;
  const newest_version_name =
    note_version_info[note_version_info.length - 1].version_name;
  const newest_version_text_elements =
    note_version_info[note_version_info.length - 1].text_elements;
  const note_name = data[0].note_name;
  const file_name = `${S3_HOST}/notes/${data[0].file_name}`;
  const user_name = data[0].user_info[0].name;
  const user_picture = `${S3_HOST}/user_picture/${data[0].user_info[0].picture}`;
  const user_email = data[0].user_info[0].email;
  let sharing_time = data[0].sharing_time || '';
  if (sharing_time !== '') {
    sharing_time = timeConverter(sharing_time);
  }

  const result = {
    'note_name': note_name,
    'version_name': newest_version_name,
    'file_name': file_name,
    'elements': newest_version_elements,
    'text_elements': newest_version_text_elements,
    'user_name': user_name,
    'user_picture': user_picture,
    'user_email': user_email,
    'sharing_time': sharing_time,
  };

  return result;
};

// 分享筆記卡片
const showSocialCards = async function (data, user_id) {
  // console.log('req.session.user.id', req.session.user.id);
  console.log('showSocialCards: ', data);

  let sharingNote_cards_html = '';
  let comment_modal_html = '';
  let comment_cards_html = '';

  // 三個分成一列，排版較好看
  let change_cardGroup = 3;
  for (let i = 0; i < data.length; i++) {
    const user_name = data[i].user_info[0].name;
    const user_picture = data[i].user_info[0].picture;
    const sharing_image = data[i].sharing_image || 'share_image_default.jpg';
    const note_name = data[i].note_name;
    const sharing_descrition = data[i].sharing_descrition;
    const sharing_time = data[i].sharing_time;
    const note_id = data[i]._id.toString();
    const show_time = timeConverter(sharing_time);
    const tags = data[i].tags;
    const comments_info = data[i].comments_info;
    const comments_num = comments_info.length;
    const url_permission = data[i].url_permission;

    // 畫tags
    let tags_html = '';
    if (tags) {
      tags.map((t) => {
        tags_html += `<span class="badge bg-primary rounded-pill" style="margin:0 10px 0 0">${t}</span>`;
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

    let comment_icon_html;
    if (url_permission == 1) {
      // 只允許觀看
      comment_icon_html = `
        <button class="btn" type="button" style="font-size:16px;padding: 0 10px 10px 0;">
            <i class="fa fa-solid fa-comments" style="color:grey">
                <span id="comments-num-${note_id}">無開放留言</span>
            </i>
        </button>`;
    } else if (url_permission == 2) {
      // 允許留言
      comment_icon_html = `
        <button class="btn" id="comment-btn-${note_id}" type="button" data-bs-toggle="modal" data-bs-target="#msgModal-${note_id}" style="font-size:16px; padding: 0 10px 10px 0;">
            <i class="fa fa-solid fa-comments" style="color:green">
                <span id="comments-num-${note_id}">${comments_num}</span>
            </i>
        </button>`;
    }

    sharingNote_cards_html += `
      <div class="card card-social">
        <div class="card-header"><img class="profile-pic mr-3" src="${S3_HOST}/user_picture/${user_picture}"/>
          <span>${user_name}</span></div>
          <a href="${SERVER_HOST}/shareNotePage?id=${note_id}" target="blank">
            <img class="card-img-top" style="width:100%;height:200px;object-fit: contain;"src="${S3_HOST}/sharing_image/${sharing_image}" alt="Card image cap">
          </a>
        <div class="card-body">
        <h5 class="card-title" style="height: 50px;">${note_name}</h5>
        <p class="card-text" style="height: 50px;">${sharing_descrition}</p>
        <br />
        <p class="card-text"><small class="text-muted">發文時間: ${show_time}</small></p>
        ${comment_icon_html}
        <button id="${note_id}" class="btn btn-heart" onclick="javascript:createSave('${note_id}')" style="padding: 0 10px 10px 0;">
            <i class="fa fa-heart" aria-hidden="true" style="color:${heart_color}"></i>
            <span class="saved_num">${saved_num}</span>
        </button>
        <br />        
        ${tags_html}
        </div>
    </div>`;

    change_cardGroup--;
    // 三個一分
    if (change_cardGroup == 0) {
      change_cardGroup = 3;
      sharingNote_cards_html += '</div>';
    }

    comments_info.map((comment) => {
      // javascript injection
      const commen_content_jsInjection = comment.contents
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');

      // 檢查是否為自己的留言
      let comment_menu_html;
      if (current_user != comment.user_id) {
        comment_menu_html = '';
      } else {
        comment_menu_html = `
        <div class="d-flex flex-row align-items-center">
          <a class="btn" id="dropdownMenuLink" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="bi bi-three-dots" style="margin-top: -0.16rem;"></i>
          </a>
          <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
            <a id="deleteComment_${comment._id}" class="dropdown-item deleteComment" href="javascript:deleteComment('${comment._id}', '${comment.note_id}')">刪除</a>
            <a id="updateComment_${comment._id}" class="dropdown-item" href="javascript:updateComment('${comment._id}', '${comment.note_id}')">修改</a>
          </div>
        </div>
        `;
      }

      comment_cards_html += `
          <div id="comment-card-${comment._id}" class="card">
            <div class="comment-card-body">
              <div class="d-flex justify-content-between">
                <div class="d-flex flex-row align-items-center">
                  <img class="comment-pic" src="${S3_HOST}/user_picture/${
        comment.user_picture
      }"/>
                  <p class="small mb-0 ms-2">${comment.user_name}</p>
                </div>
                ${comment_menu_html}
              </div>
              <p id="comment-content-${
                comment._id
              }" style="margin: 10px 0;">${commen_content_jsInjection}</p>
              <p id="comment-time-${
                comment._id
              }" style="font-size: 8px;margin: 10px 0;">
              ${timeConverter(comment.created_time)}
              </p>
            </div>
          </div>`;
    });

    comment_modal_html += `
        <div class="modal fade" id="msgModal-${note_id}" tabindex="-1">
          <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">留言小板板</h5>
                <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              ${comment_cards_html}
            <div class="modal-footer">
              <div class="input-group">
                <div class="form-outline">
                  <input class="form-control" id="textarea_${note_id}" onKeyDown="if(event.keyCode==13) javascript:createComments('${note_id}');" style="width:400px" type="text" placeholder="向作者講句話吧..."/>
                </div>
                <button class="btn" type="button" onclick="javascript:createComments('${note_id}')"><i class="bi bi-send"></i></button>
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
const showPagination = async function (
  paging,
  sorting,
  allPages_count,
  currentPage
) {
  // console.log('allPages_count: ', allPages_count);
  let prevPage_html = '';
  let currentPage_html = '';
  let nextPage_html = '';

  let prevPage_href = `${SERVER_HOST}/socialPage?paging=${
    paging - 1
  }&sorting=${sorting}`;

  let nextPage_href = `${SERVER_HOST}/socialPage?paging=${
    paging + 1
  }&sorting=${sorting}`;

  // 最後一頁
  if (currentPage == allPages_count && allPages_count != 1) {
    prevPage_html = `
      <li class="page-item"></li>
      <a class="page-link" href="${prevPage_href}" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span><span class="sr-only">Previous</span>
      </a>
      `;
    currentPage_html = `
      <li class="page-item"></li>
      <input id="setPage" style="width:36px;height:36px;border:white;text-align:center;" value="${paging}" onKeyDown="if(event.keyCode==13) getInputPage('${SERVER_HOST}')" />
      <li class="page-item disabled" style="border: white;">
        <a class="page-link" href="#" tabindex="-1" style="border: white;"> / ${allPages_count}</a>
      </li>
    `;
    nextPage_html = '';
  }
  // 第一頁
  else if (currentPage == 1 && allPages_count != 1) {
    prevPage_html = '';
    currentPage_html = `
      <li class="page-item"></li>
      <input id="setPage" style="width:36px;height:36px;border:white;text-align:center;" value="${paging}" onKeyDown="if(event.keyCode==13) getInputPage('${SERVER_HOST}')" />
      <li class="page-item disabled" style="border: white;">
        <a class="page-link" href="#" tabindex="-1" style="border: white;"> / ${allPages_count}</a>
      </li>
    `;

    nextPage_html = `
        <li class="page-item"></li>
        <a class="page-link" href="${nextPage_href}" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
          <span class="sr-only">Next</span>
        </a>`;
  }
  // 只有一頁且第一頁
  else if (currentPage == 1 && allPages_count == 1) {
    prevPage_html = '';
    currentPage_html = `
      <li class="page-item"></li>
      <input id="setPage" style="width:36px;height:36px;border:white;text-align:center;" value="${paging}" onKeyDown="if(event.keyCode==13) getInputPage('${SERVER_HOST}')" />
      <li class="page-item disabled" style="border: white;">
        <a class="page-link" href="#" tabindex="-1" style="border: white;"> / ${allPages_count}</a>
      </li>
    `;
    nextPage_html = '';
  }
  // 中間頁
  else {
    prevPage_html = `
      <li class="page-item"></li>
      <a class="page-link" href="${prevPage_href}" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span><span class="sr-only">Previous</span>
      </a>
      `;
    currentPage_html = `
      <li class="page-item"></li>
      <input id="setPage" style="width:36px;height:36px;border:white;text-align:center;" value="${paging}" onKeyDown="if(event.keyCode==13) getInputPage('${SERVER_HOST}')" />
      <li class="page-item disabled" style="border: white;">
        <a class="page-link" href="#" tabindex="-1" style="border: white;"> / ${allPages_count}</a>
      </li>
    `;
    nextPage_html = `
        <li class="page-item"></li>
        <a class="page-link" href="${nextPage_href}" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
          <span class="sr-only">Next</span>
        </a>`;
  }

  // // 判斷第一頁&最後一頁的前後頁
  // if (currentPage == allPages_count) {
  //   nextPage_href = `javascript:alert_paging('最後一頁')`;
  // }
  // if (currentPage == 1) {
  //   prevPage_href = `javascript:alert_paging('第一頁')`;
  // }

  // prevPage_html = `
  //     <li class="page-item"></li>
  //     <a class="page-link" href="${prevPage_href}" aria-label="Previous">
  //       <span aria-hidden="true">&laquo;</span><span class="sr-only">Previous</span>
  //     </a>
  //     `;

  // currentPage_html = `
  //     <li class="page-item"></li>
  //     <input id="setPage" style="width:36px;height:36px;border:white;text-align:center;" value="${paging}" onKeyDown="if(event.keyCode==13) getInputPage('${SERVER_HOST}')" />
  //     <li class="page-item disabled" style="border: white;">
  //       <a class="page-link" href="#" tabindex="-1" style="border: white;"> / ${allPages_count}</a>
  //     </li>
  //   `;

  // nextPage_html = `
  //       <li class="page-item"></li>
  //       <a class="page-link" href="${nextPage_href}" aria-label="Next">
  //         <span aria-hidden="true">&raquo;</span>
  //         <span class="sr-only">Next</span>
  //       </a>`;

  const paging_html = `
    <nav aria-label="Page navigation">
    <ul class="pagination justify-content-center">
        ${prevPage_html}
        ${currentPage_html}
        ${nextPage_html}
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
        case 2:
          permission = '允許留言';
          break;
      }
      shareList_html += `<li class="list-group-item d-flex justify-content-between align-items-center">
                            ${p.user_email}
                          <span class="badge bg-primary rounded-pill">${permission}</span>
                          <button id="${p.user_email}" class="deleteShareToOther-btn btn">
                            <a href="javascript:deleteShareToOther('${note_id}','${p.user_email}')">
                              <span class='bi bi-x-circle'></span>
                            </a>
                          </button>
                        </li>`;
    });
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
};
