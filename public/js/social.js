// 分享筆記 ------------------------------------------------------------
// 打開分享給特定人隱藏內容
$('#shareToOther-toggle').click(function () {
  const checked = $(this).is(':checked');
  if (checked) {
    $('#shareToOhterDetail').css('visibility', 'visible');
  } else {
    $('#shareToOhterDetail').css('visibility', 'hidden');
  }
});

// 打開分享給所有人隱藏內容
$('#shareToAll-toggle').click(function () {
  const checked = $(this).is(':checked');
  if (checked) {
    $('#shareToAllDetail').css('visibility', 'visible');
    $('#share_url').val(`${server}/shareNotePage?id=${current_note_id}`);
  } else {
    $('#shareToAllDetail').css('visibility', 'hidden');
  }
});

// 分享給特定人的權限設定的按鈕
$('#shareToOtherMenu li').on('click', function () {
  console.log($(this).text());
  console.log($('#shareToOtherMethod-btn').text());
  $('#shareToOtherMethod-btn').text($(this).text());
});

// 分享鍵 ----------------------------------
$('#shareToAll_confirm-btn').click(async function () {
  // Loading圖示
  $('#shareToAll_confirm-btn').prop('disabled', true);
  $('body').css('cursor', 'progress');

  const isComment = $('#allowComment-toggle').is(':checked');
  const isWatch = $('#shareToAll-toggle').is(':checked');

  let tags = $('.badge.bg-success.rounded-pill')
    .map((i, e) => e.outerText)
    .get();
  tags = $.grep(tags, (n) => n == 0 || n);

  const share_description = $('#share_description').val();
  const file = $('#shareNote_image')[0].files[0];
  let share_image;

  if (!file) {
    share_image = '';
  } else {
    share_image = file.name;
  }

  let url_permission;
  let isSharing;

  if (isWatch && !isComment) {
    url_permission = 'read';
    isSharing = 1;
  } else if (!isWatch && !isComment) {
    url_permission = 'forbidden';
    isSharing = 0;
  } else {
    url_permission = 'comment';
    isSharing = 1;
  }

  console.log(url_permission);
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
    Swal.fire('不能為空值');
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

  // 確認使用者存在
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
  const tag_name = $('#tag_input').val();
  if (!tag_name) {
    return;
  }
  if ($('.badge.bg-success.rounded-pill').length === 5) {
    Swal.fire('標籤不能超過5個');
    return;
  }
  let tag_html = `
    <span class="tags badge bg-info rounded-pill" style="color:white;">${tag_name}&nbsp
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
      Swal.fire('留言成功');
      location.reload();
    })
    .catch((error) => {
      console.log(error.response.data.msg);
      Swal.fire(error.response.data.msg);
    });
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
      Swal.fire(error.response.data.msg);
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
      console.log(response);
      Swal.fire('更改設定成功');
      window.location.assign('/socialPage?paging=1&sorting=sharing_time');
    })
    .catch((error) => {
      console.log(error);
      Swal.fire('更改設定失敗');
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
      console.log(response);
      Swal.fire(response.data);
    })
    .catch((error) => {
      console.log(error);
      user_notExist = true;
      Swal.fire(error.response.data.msg);
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
      console.log(response);
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
      Swal.fire('拿取特定人士權限失敗');
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
  const new_content = window.prompt('您要修改的內容?');
  if (!new_content) {
    Swal.fire('內容不能為空');
    return;
  }

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
      Swal.fire('修改留言成功');
      location.reload();
    })
    .catch((error) => {
      console.log(error);
      Swal.fire(error.response.data.msg);
    });
}

// 刪除留言
async function deleteComment(comment_id, note_id) {
  const isdeleted = window.confirm('確定刪除此留言');
  if (!isdeleted) {
    return;
  }
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
      Swal.fire('刪除留言成功');
      location.reload();
    })
    .catch((error) => {
      console.log(error);
      Swal.fire(error.response.data.msg);
    });
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
  const paging = urlParams.get('paging');
  const sorting = urlParams.get('sorting');
  let startDate;
  let endDate;
  let search_url;

  //- 時間搜尋
  if ($('#daterange').val()) {
    startDate = $('#daterange').val().split('-')[0].replace(/\s/g, '');
    endDate = $('#daterange').val().split('-')[1].replace(/\s/g, '');
    search_url = `/socialPage?paging=${paging}&sorting=${sorting}&search_text=${search_text}&search_method=${search_method}&startDate=${startDate}&endDate=${endDate}`;
  } else {
    search_url = `/socialPage?paging=${paging}&sorting=${sorting}&search_text=${search_text}&search_method=${search_method}`;
  }

  let data = {
    'search_input': search_text,
    'search_method': search_method,
    'startDate': startDate,
    'endDate': endDate,
  };

  let config = {
    method: 'GET',
    url: search_url,
    data: data,
  };

  await axios(config)
    .then((response) => {
      console.log(response);
      Swal.fire('搜尋成功');
      window.location = search_url;
    })
    .catch((error) => {
      console.log(error);
      Swal.fire(error.response.data.msg);
    });
}

// 刪除對特定人的分享
async function deleteShareToOther(note_id, delete_email) {
  const isDeleted = confirm(`確定要刪除對${delete_email}的分享?`);
  if (!isDeleted) {
    return;
  }

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
      console.log(response);
      Swal.fire('刪除成功');
      // 刪除該list
      $(`li:contains("${delete_email}")`).remove();
      // TODO: 推播
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

// 刪除推播資訊
async function deleteMsg(msg_id) {
  const isDeleted = confirm(`確定要刪除此則留言?`);
  if (!isDeleted) {
    return;
  }

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
      Swal.fire('刪除成功');
      // 刪除該list
      $(`li:contains("${msg_id}")`).remove();
    })
    .catch((error) => {
      console.log(error);
      Swal.fire(error.response.data.msg);
    });
}
