// 分享筆記 ------------------------------------------------------------

// 打開分享給所有人隱藏內容
$('#share_url').val(`${server}/shareNotePage?id=${current_note_id}`);

// 分享給特定人的權限設定的按鈕
$('#shareToOtherMenu li').on('click', function () {
  console.log($(this).text());
  console.log($('#shareToOtherMethod-btn').text());
  $('#shareToOtherMethod-btn').text($(this).text());
});

// 封面照預覽
async function previewFile(preview_id) {
  const preview = document.getElementById(preview_id);
  // const preview = $('#sharePic_preview');
  const file = $('input[type=file]')[0].files[0];
  const reader = new FileReader();

  reader.addEventListener(
    'load',
    () => {
      // convert image file to base64 string
      preview.src = reader.result;
    },
    false
  );

  if (file) {
    reader.readAsDataURL(file);
  }

  $('#' + preview_id).show();
}

// 分享社群鍵 ----------------------------------
$('#shareToAll_confirm-btn').click(async function () {
  // Loading圖示
  $('#shareToAll_confirm-btn').prop('disabled', true);
  $('body').css('cursor', 'progress');

  let tags = $('.tags')
    .map((i, e) => e.outerText)
    .get();
  tags = $.grep(tags, (n) => n == 0 || n);

  let share_description = $('#share_description').val();

  // 檢查簡介不得為空
  if (share_description == '') {
    Swal.fire({
      icon: 'error',
      title: '分享簡介不能空白',
      showConfirmButton: false,
      timer: 1000,
    });
    // 釋放Loading圖示
    $('#shareToAll_confirm-btn').prop('disabled', false);
    $('body').css('cursor', 'default  ');
    return;
  }

  // 檢查簡介長度為50
  if (share_description.length > 50) {
    Swal.fire({
      icon: 'error',
      title: '分享簡介字數最多50字',
      showConfirmButton: false,
      timer: 1000,
    });
    // 釋放Loading圖示
    $('#shareToAll_confirm-btn').prop('disabled', false);
    $('body').css('cursor', 'default');
    return;
  }
  const file = $('#shareNote_image')[0].files[0];
  let share_image;

  // 照片
  if (!file) {
    share_image = '';
  } else {
    share_image = file.name;
  }

  let url_permission;
  let isSharing;

  const isComment = $('#allowComment-toggle').is(':checked');
  if (!isComment) {
    url_permission = 'read';
    isSharing = 1;
  } else {
    url_permission = 'comment';
    isSharing = 1;
  }

  // alert(url_permission);
  let data = new FormData();
  data.append('isSharing', isSharing);
  data.append('url_permission', url_permission);
  data.append('note_id', current_note_id);
  data.append('sharing_descrition', share_description);
  data.append('share_ImgUpload', file);
  data.append('sharing_url', `/shareNotePage?id=${current_note_id}`);
  data.append('tags', JSON.stringify(tags));
  await shareToAlluser(data);

  // 釋放Loading圖示
  $('#shareToAll_confirm-btn').prop('disabled', false);
  $('body').css('cursor', 'default  ');
});

// 加入分享特定的人按鍵
$('#addShareOther-btn').click(async function () {
  let permission = $('#shareToOtherMethod-btn').text();
  let addOther = $('#addShareOther-input').val();

  if (!addOther) {
    Swal.fire({
      icon: 'error',
      title: '分享者不能空白',
      showConfirmButton: false,
      timer: 1000,
    });
    return;
  }

  switch (permission) {
    case '允許留言':
      user_permission = 'comment';
      break;
    case '允許觀看':
      user_permission = 'read';
      break;
  }

  const data = {
    'permission': user_permission,
    'addPerson': addOther,
    'note_id': current_note_id,
  };

  // 確認使用者是否已存在
  if ($('#' + CSS.escape(addOther)).length > 0) {
    Swal.fire({
      icon: 'error',
      title: '此用戶已經加入過',
      showConfirmButton: false,
      timer: 1000,
    });
    return;
  }
  const user_notExist = await shareToOther(data);
  if (user_notExist) {
    return;
  }

  // 渲染畫面
  let list_html = `
      <li class="list-group-item d-flex justify-content-between align-items-center">
          ${addOther}
          <span class="badge bg-primary rounded-pill">${permission}</span>
          <button id="${addOther}" class="deleteShareToOther-btn btn">
            <a href="javascript:deleteShareToOther('${current_note_id}','${addOther}')">
              <span class='bi bi-x-circle'></span>
            </a>
          </button>
      </li>`;

  $('#shareOtherList').append(list_html);

  // 推播給該用戶
  socket.emit('shareToyou', {
    'user_email': user_email,
    'addOther': addOther,
  });
});

// [筆記分享] 加入筆記tag鍵
$('#add_note_tag-btn').click(function () {
  add_tag();
});

$('#tag_input').on('keyup', function (e) {
  if (e.key === 'Enter' || e.keyCode === 13) {
    add_tag();
  }
});

// [Tag加入function]
function add_tag() {
  let tag_name = $('#tag_input').val();
  tag_name = tag_name.replaceAll('<', '&lt').replaceAll('>', '&gt');
  if (!tag_name) {
    return;
  }
  if ($('.badge.bg-info.rounded-pill').length === 5) {
    alert('標籤不能超過5個');
    return;
  }
  let tag_html = `
    <span class="tags badge bg-info rounded-pill" style="color:white;">${tag_name}
      <i class="fa fa-times-circle" style="margin-left:-3px;" aria-hidden="true"></i>
    </span>
  `;
  $('.note_tags').append(tag_html);
  $('#tag_input').val('');
}

// [筆記分享] 刪除筆記tag鍵
$(document).on('click', '.tags', function () {
  $(this).remove();
});

// 發出留言
async function createComments(note_id) {
  let data = {
    'user_id': user_id,
    'note_id': note_id,
    'contents': $(`#textarea_${note_id}`).val(),
    'created_time': '',
    'updated_time': '',
    'user_name': user_name,
    'user_picture': user_picture,
  };

  var config = {
    method: 'POST',
    url: `/api/1.0/comment`,
    data: data,
  };

  await axios(config)
    .then((response) => {
      console.log(response);
      const comment_id = response.data.data.comment_id;
      const created_time = response.data.data.created_time;
      const comment = config.data;
      comment.comment_id = comment_id;
      comment.created_time = created_time;
      addComments(comment);
    })
    .catch((error) => {
      console.log(error.response.data.msg);
      Swal.fire({
        icon: 'error',
        title: error.response.data.msg,
        showConfirmButton: false,
        timer: 1000,
      });
    });
}

// 新增留言 - 前端新增留言小板板
async function addComments(comment) {
  // javascript injection
  const commen_content_jsInjection = comment.contents
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

  // 檢查是否為自己的留言，來決定是否需要有三個點的設定
  let comment_menu_html = '';
  let comment_cards_html = '';
  let current_user = user_id;

  if (current_user != comment.user_id) {
    comment_menu_html = '';
  } else {
    comment_menu_html = `
        <div class="d-flex flex-row align-items-center">
          <a class="btn" id="dropdownMenuLink" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="bi bi-three-dots" style="margin-top: -0.16rem;"></i>
          </a>
          <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
            <a id="deleteComment_${comment._id}" class="dropdown-item" href="javascript:deleteComment('${comment.comment_id}', '${comment.note_id}')">刪除</a>
            <a id="updateComment_${comment._id}" class="dropdown-item" href="javascript:updateComment('${comment.comment_id}', '${comment.note_id}')">修改</a>
          </div>
        </div>
        `;
  }

  comment_cards_html += `
          <div id="comment-card-${comment.comment_id}" class="card">
            <div class="comment-card-body">
              <div class="d-flex justify-content-between">
                <div class="d-flex flex-row align-items-center">
                  <img class="comment-pic" src="${S3_HOST}user_picture/${
    comment.user_picture
  }"/>
                  <p class="small mb-0 ms-2">${comment.user_name}</p>
                </div>
                ${comment_menu_html}
              </div>
              <p id="comment-content-${
                comment.comment_id
              }" style="margin: 10px 0;">${commen_content_jsInjection}</p>
              <p id="comment-time-${
                comment.comment_id
              }" style="font-size: 8px;margin: 10px 0;">
              ${timeConverter(new Date(comment.created_time))}
              </p>
            </div>
          </div>`;

  // 加到Comment底下
  let comment_div = $('#msgModal-' + comment.note_id + ' .modal-content .card');
  if (comment_div.length != 0) {
    comment_div.last().after(comment_cards_html);
  } else {
    // 還沒有留言
    comment_div = $('#msgModal-' + comment.note_id + ' .modal-header');
    comment_div.last().after(comment_cards_html);
  }

  // 外面的Comment數字修改
  let comment_count = +$(`#comment-btn-${comment.note_id} span`).text();
  $(`#comment-btn-${comment.note_id} span`).text(comment_count + 1);

  //清空原本的留言
  $('#textarea_' + comment.note_id).val('');
}

// 發出收藏
async function createSave(note_id) {
  let data = {
    'user_id': user_id,
    'note_id': note_id,
  };

  let config = {
    method: 'POST',
    url: `/api/1.0/note/save`,
    data: data,
  };

  await axios(config)
    .then((response) => {
      // console.log('收藏成功:', response);
      const new_saved_count = response.data;
      note_savedStatus[note_id] = new_saved_count;
      // console.log('note_savedStatus', note_savedStatus);
    })
    .catch((error) => {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: error.response.data.error,
        showConfirmButton: false,
        timer: 1000,
      });
    });
}

// 分享給所有人 -------------------------------------------------------------
async function shareToAlluser(data) {
  let config = {
    method: 'POST',
    url: `/api/${API_VERSION}/note/shareToAll`,
    data: data,
  };

  await axios(config)
    .then((response) => {
      Swal.fire({
        icon: 'success',
        title: '更改設定成功',
        showConfirmButton: false,
        timer: 1000,
      }).then(function () {
        window.location.assign('/socialPage?paging=1&sorting=sharing_time');
      });
    })
    .catch((error) => {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: error.response.data.error,
        showConfirmButton: false,
        timer: 1000,
      });
    });
}

// 分享給特定的人 -------------------------------------------------------------
async function shareToOther(data) {
  let config = {
    method: 'POST',
    url: `/api/${API_VERSION}/note/shareToOther`,
    data: data,
  };

  let user_notExist = false;

  await axios(config)
    .then((response) => {
      Swal.fire({
        icon: 'success',
        title: response.data,
        showConfirmButton: false,
        timer: 1000,
      });
    })
    .catch((error) => {
      user_notExist = true;
      Swal.fire({
        icon: 'error',
        title: error.response.data.msg,
        showConfirmButton: false,
        timer: 1000,
      });
    });

  return user_notExist;
}

// 拿取特定人士權限 -------------------------------------------------------------
async function getShareToOther(note_id) {
  let config = {
    method: 'GET',
    url: `/api/${API_VERSION}/note/ShareToOther/${note_id}`,
    data: '',
  };

  await axios(config)
    .then((response) => {
      $('#shareOtherList').html('');
      $('#shareOtherList').append($.parseHTML(response.data));
    })
    .catch((error) => {
      console.log(error);
      Swal.fire('拿取特定人士權限失敗');
    });
}

// 拿取所有人士權限 -------------------------------------------------------------
async function getShareAll(note_id) {
  let config = {
    method: 'GET',
    url: `/api/${API_VERSION}/note/shareToAll/${note_id}`,
    data: '',
  };

  await axios(config)
    .then((response) => {
      // console.log(response);
      note_isSharing = response.data[0].isSharing;
      note_url_permission = response.data[0].url_permission;
      sharing_descrition = response.data[0].sharing_descrition;
      sharing_image = response.data[0].sharing_image;
      sharing_url = response.data[0].sharing_url;
      tags = response.data[0].tags;
      // $('#shareOtherList').html('');
      // $('#shareOtherList').append($.parseHTML(response.data));
    })
    .catch((error) => {
      console.log(error);
      Swal.fire('拿取分享資訊失敗');
    });
}

// 愛心、時間、留言數 排序 --------------------------------------
// heart_sorting -------
$('#heart_sorting-btn').click(function (e) {
  let heart_color = e.target.style.color;
  let params = new URL(document.location).searchParams;
  let paging = params.get('paging');
  window.location = `/socialPage?paging=${paging}&sorting=saved_count`;
});

// time_sorting -------
$('#time_sorting-btn').click(function (e) {
  let time_color = e.target.style.color;
  let params = new URL(document.location).searchParams;
  let paging = params.get('paging');
  window.location = `/socialPage?paging=${paging}&sorting=sharing_time`;
});

// comments_sorting -------
$('#comments_sorting-btn').click(function (e) {
  let comments_color = e.target.style.color;
  let params = new URL(document.location).searchParams;
  let paging = params.get('paging');
  window.location = `/socialPage?paging=${paging}&sorting=comment_count`;
});

// 留言 修改/刪除
async function updateComment(comment_id, note_id) {
  $('#updateComment_' + comment_id).addClass('disabled');
  const content_id = `comment-content-${comment_id}`;
  const old_content = $('#' + content_id).text();

  const update_textarea = $(
    `
    <div id="${content_id}">
      <textarea style="width: 100%;" id="textarea-${content_id}">${old_content}</textarea></br>
      <div style="float:right;">
        <button class="btn updateComment-confirm-btn" id="${comment_id}" value="${note_id}">修改</button>
        <button class="btn updateComment-cancel-btn" id="${comment_id}" value="${old_content}">取消</button>
      </div>
    </div>
    `
  );

  $('#' + content_id).replaceWith(update_textarea);

  // 取消鍵
  $('.updateComment-cancel-btn').click(async function (e) {
    const content_id = `comment-content-${e.target.id}`;
    const old_content = e.target.value;

    $('#' + content_id).replaceWith(
      `<p id="${content_id}" style="margin: 10px 0;">${old_content}</p>`
    );

    $('#updateComment_' + comment_id).removeClass('disabled');
  });

  // 修改鍵
  $('.updateComment-confirm-btn').click(async function (e) {
    const comment_id = e.target.id;
    const note_id = e.target.value;
    const new_content = $('#textarea-comment-content-' + comment_id).val();

    // alert(comment_id);
    // alert(note_id);
    // alert(new_content);

    let data = {
      'new_content': new_content,
      'comment_id': comment_id,
      'note_id': note_id,
    };

    let config = {
      method: 'PATCH',
      url: `/api/1.0/comment`,
      data: data,
    };

    await axios(config)
      .then((response) => {
        console.log(response);
        const comment_id = config.data.comment_id;
        const new_content = config.data.new_content;

        $('#' + content_id).replaceWith(
          `<p id="${content_id}" style="margin: 10px 0;">${new_content}</p>`
        );
      })
      .catch((error) => {
        console.log(error);
        Swal.fire({
          icon: 'error',
          title: error.response.data.msg,
          showConfirmButton: false,
          timer: 1000,
        });
      });

    $('#updateComment_' + comment_id).removeClass('disabled');
  });
}

// 刪除留言
async function deleteComment(comment_id, note_id) {
  Swal.fire({
    title: '確定刪除此留言?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '刪除',
    cancelButtonText: '取消',
  }).then(async (result) => {
    if (result.isConfirmed) {
      let data = {
        'comment_id': comment_id,
        'note_id': note_id,
      };

      let config = {
        method: 'DELETE',
        url: `/api/1.0/comment`,
        data: data,
      };

      await axios(config)
        .then((response) => {
          const comment_id = config.data.comment_id;
          const note_id = config.data.note_id;
          Swal.fire({
            icon: 'success',
            title: '刪除留言成功',
            showConfirmButton: false,
            timer: 1000,
          }).then((result) => {
            deleteComments(comment_id, note_id);
          });
          // location.reload();
        })
        .catch((error) => {
          console.log(error);
          Swal.fire({
            icon: 'error',
            title: error.response.data.msg,
            showConfirmButton: false,
            timer: 1000,
          });
        });
    }
  });
}

// 刪除留言 - 前端刪除留言小板板
async function deleteComments(comment_id, note_id) {
  $('#comment-card-' + comment_id).remove();

  // 外面的Comment數字修改
  let comment_count = +$(`#comment-btn-${note_id} span`).text();
  $(`#comment-btn-${note_id} span`).text(comment_count - 1);
}

// [社群頁面]
// 搜尋Bar的選項按鈕
$('#socialPageSearchMenu li').on('click', function () {
  console.log($(this).text());
  console.log($('#socialPageSearch-btn').text());
  $('#socialPageSearch-btn').text($(this).text());

  // 收藏文章不需要輸入搜尋文字
  if (
    $('#socialPageSearch-btn').text() === '收藏' ||
    $('#socialPageSearch-btn').text() === '時間'
  ) {
    $('#socialPageSearch-input').prop('disabled', true);
  } else {
    $('#socialPageSearch-input').prop('disabled', false);
  }

  // 時間搜尋去點日曆
  if ($('#socialPageSearch-btn').text() === '時間') {
    $('#daterange').click();
  }
});

// [社群頁面]
$('#socialSearchBar').on('click', async function () {
  await socialSearch();
});

// [func] 搜尋列轉網址
async function socialSearch() {
  // Loading圖示
  $('#socialPageSearch-input').prop('disabled', true);
  $('#socialSearchBar').prop('disabled', true);
  $('body').css('cursor', 'progress');

  const search_text = $('#socialPageSearch-input').val();
  const search_method = $('#socialPageSearch-btn').text();
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const paging = 1; // 搜尋頁都從第一頁開始
  const sorting = urlParams.get('sorting');
  let startDate;
  let endDate;
  let search_url;

  //- 時間搜尋
  if (search_method == '時間') {
    startDate = $('#daterange').val().split('-')[0].replace(/\s/g, '');
    endDate = $('#daterange').val().split('-')[1].replace(/\s/g, '');
    // search_url = `/socialPage?paging=${paging}&sorting=${sorting}&search_text=${search_text}&search_method=${search_method}&startDate=${startDate}&endDate=${endDate}`;
    search_url = `/socialPage?paging=${paging}&sorting=${sorting}&search_text=${startDate}-${endDate}&search_method=${search_method}`;
  } else {
    search_url = `/socialPage?paging=${paging}&sorting=${sorting}&search_text=${search_text}&search_method=${search_method}`;
  }

  let data = {
    'search_input': search_text,
    'search_method': search_method,
    // 'startDate': startDate,
    // 'endDate': endDate,
  };

  let config = {
    method: 'GET',
    url: search_url,
    data: data,
  };

  await axios(config)
    .then((response) => {
      console.log(response);
      window.location = search_url;
    })
    .catch((error) => {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: error.response.data.error,
        showConfirmButton: false,
        timer: 1000,
      });
    });
}

// 刪除對特定人的分享
async function deleteShareToOther(note_id, delete_email) {
  Swal.fire({
    title: `確定要刪除對${delete_email}的分享?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '刪除',
    cancelButtonText: '取消',
  }).then(async (result) => {
    if (result.isConfirmed) {
      let data = {
        'note_id': note_id,
        'delete_email': delete_email,
      };

      let config = {
        method: 'DELETE',
        url: `/api/${API_VERSION}/note/shareToOther`,
        data: data,
      };

      await axios(config)
        .then((response) => {
          // console.log(response);
          Swal.fire({
            icon: 'success',
            title: '刪除成功',
            showConfirmButton: false,
            timer: 1000,
          });
          // 刪除該list
          $(`li:contains("${delete_email}")`).remove();

          // 推播
          socket.emit('delete_ShareToYou', {
            'user_email': user_email,
            'delete_email': delete_email,
          });
        })
        .catch((error) => {
          console.log(error);
          Swal.fire(error.response.data.msg);
        });
    }
  });

  // const isDeleted = confirm(`確定要刪除對${delete_email}的分享?`);
  // if (!isDeleted) {
  //   return;
  // }
}

// 刪除推播資訊
async function deleteMsg(msg_id) {
  Swal.fire({
    title: '確定要刪除此則通知?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '刪除',
    cancelButtonText: '取消',
  }).then(async (result) => {
    if (result.isConfirmed) {
      let data = {
        'msg_id': msg_id,
      };

      let config = {
        method: 'DELETE',
        url: `/api/${API_VERSION}/message`,
        data: data,
      };

      await axios(config)
        .then((response) => {
          console.log(response);
          Swal.fire({
            icon: 'success',
            title: '刪除成功',
            showConfirmButton: false,
            timer: 1000,
          });
          // 刪除該list
          $(`li:contains("${msg_id}")`).remove();
          // 修改原通知值
          let msg_count = $('#msg_count').text();
          msg_count--;
          $('#msg_count').text(msg_count);
        })
        .catch((error) => {
          console.log(error);
          Swal.fire({
            icon: 'error',
            title: error.response.data.error,
            showConfirmButton: false,
            timer: 1000,
          });
        });
    }
  });

  // const isDeleted = confirm(`確定要刪除此則通知?`);
  // if (!isDeleted) {
  //   return;
  // }
}

// 刪除分享給所有人
async function deleteShareAll() {
  const isDeleted = confirm(`確定要關閉此篇文章的分享`);
  if (!isDeleted) {
    return;
  }

  let data = {
    'note_id': current_note_id,
  };

  let config = {
    method: 'DELETE',
    url: `/api/${API_VERSION}/note/shareToAll`,
    data: data,
  };

  await axios(config)
    .then((response) => {
      console.log(response);
      Swal.fire({
        icon: 'success',
        title: '關閉成功',
        showConfirmButton: false,
        timer: 1000,
      });
    })
    .catch((error) => {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: error.response.data.msg,
        showConfirmButton: false,
        timer: 1000,
      });
    });
}
