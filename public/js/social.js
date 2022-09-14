// 發出留言
async function createComments(note_id) {
  let data = {
    'user_id': user_id,
    'note_id': note_id,
    'contents': $(`#textarea_${note_id}`).val(),
    'created_time': Date.now(),
    'user_name': user_name,
    'user_picture': user_picture,
  };

  var config = {
    method: 'POST',
    url: `${server}/api/1.0/comment`,
    data: data,
  };

  await axios(config)
    .then((response) => {
      console.log(response);
      alert('留言成功');
      location.reload();
    })
    .catch((error) => {
      console.log(error);
      alert(error.response.data.msg);
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
    url: `${server}/api/1.0/note/save`,
    data: data,
  };

  await axios(config)
    .then((response) => {
      console.log(response);
      // alert('收藏成功');
      location.reload();
    })
    .catch((error) => {
      console.log(error);
      alert(error.response.data.msg);
    });
}

// 分享給所有人 -------------------------------------------------------------
async function shareToAlluser(data) {
  let config = {
    method: 'POST',
    url: `${server}/api/${API_VERSION}/note/shareToAll`,
    data: data,
  };

  await axios(config)
    .then((response) => {
      console.log(response);
      alert('分享所有人成功');
      location.reload();
    })
    .catch((error) => {
      console.log(error);
      alert('分享所有人失敗');
    });
}

// 分享給特定的人 -------------------------------------------------------------
async function shareToOther(data) {
  let config = {
    method: 'POST',
    url: `${server}/api/${API_VERSION}/note/shareToOther`,
    data: data,
  };

  await axios(config)
    .then((response) => {
      console.log(response);
      alert(response.data);
      // location.reload();
    })
    .catch((error) => {
      console.log(error);
      alert('分享特定人失敗');
    });
}

// 拿取特定人士權限 -------------------------------------------------------------
async function getShareToOther(note_id) {
  let config = {
    method: 'GET',
    url: `${server}/api/${API_VERSION}/note/ShareToOther/${note_id}`,
    data: '',
  };

  await axios(config)
    .then((response) => {
      $('#shareOtherList').html('');
      $('#shareOtherList').append($.parseHTML(response.data));
    })
    .catch((error) => {
      console.log(error);
      alert('拿取特定人士權限失敗');
    });
}

// 拿取所有人士權限 -------------------------------------------------------------
async function getShareAll(note_id) {
  let config = {
    method: 'GET',
    url: `${server}/api/${API_VERSION}/note/shareToAll/${note_id}`,
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
      // $('#shareOtherList').html('');
      // $('#shareOtherList').append($.parseHTML(response.data));
    })
    .catch((error) => {
      console.log(error);
      alert('拿取特定人士權限失敗');
    });
}

// 愛心、留言、時間、留言數 圖形特效 --------------------------------------
// save_note -------
$('.btn-heart').click(function (e) {
  let heart_color = e.target.style.color;
  if (heart_color == 'grey') {
    e.target.style.color = 'red';
  } else {
    e.target.style.color = 'grey';
  }
});

// heart_sorting -------
$('#heart_sorting-btn').click(function (e) {
  let heart_color = e.target.style.color;
  let params = new URL(document.location).searchParams;
  let paging = params.get('paging');
  if (heart_color == 'grey') {
    e.target.style.color = 'blue';
    $('#time_sorting-btn i').css('color', 'grey');
    $('#comments_sorting-btn i').css('color', 'grey');
    window.location = `${server}/socialPage?paging=${paging}&sorting=saved_count`;
  } else {
    e.target.style.color = 'grey';
  }
});

// time_sorting -------
$('#time_sorting-btn').click(function (e) {
  let time_color = e.target.style.color;
  let params = new URL(document.location).searchParams;
  let paging = params.get('paging');
  if (time_color == 'grey') {
    $('#heart_sorting-btn i').css('color', 'grey');
    e.target.style.color = 'blue';
    $('#comments_sorting-btn i').css('color', 'grey');
    window.location = `${server}/socialPage?paging=${paging}&sorting=created_time`;
  } else {
    e.target.style.color = 'grey';
  }
});

// comments_sorting -------
$('#comments_sorting-btn').click(function (e) {
  let comments_color = e.target.style.color;
  let params = new URL(document.location).searchParams;
  let paging = params.get('paging');
  if (comments_color == 'grey') {
    $('#heart_sorting-btn i').css('color', 'grey');
    $('#time_sorting-btn i').css('color', 'grey');
    e.target.style.color = 'blue';
    window.location = `${server}/socialPage?paging=${paging}&sorting=comment_count`;
  } else {
    e.target.style.color = 'grey';
  }
});

// 留言 修改/刪除
async function updateComment(comment_id, note_id) {
  const new_content = window.prompt('您要修改的內容?');
  if (!new_content) {
    alert('內容不能為空');
    return;
  }

  let data = {
    'new_content': new_content,
    'comment_id': comment_id,
    'note_id': note_id,
  };

  let config = {
    method: 'PATCH',
    url: `${server}/api/1.0/comment`,
    data: data,
  };

  await axios(config)
    .then((response) => {
      console.log(response);
      alert('修改留言成功');
      location.reload();
    })
    .catch((error) => {
      console.log(error);
      alert(error.response.data.msg);
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
    url: `${server}/api/1.0/comment`,
    data: data,
  };

  await axios(config)
    .then((response) => {
      console.log(response.data);
      alert(response.data);
      location.reload();
    })
    .catch((error) => {
      console.log(error);
      alert(error.response.data.msg);
    });
}

// 預讀排序圖形顏色
async function getSocialSortingColor() {
  let params = new URL(document.location).searchParams;
  let sorting = params.get('sorting');

  $('#heart_sorting-btn i').css('color', 'grey');
  $('#time_sorting-btn i').css('color', 'grey');
  $('#comments_sorting-btn i').css('color', 'grey');

  switch (sorting) {
    case 'created_time':
      $('#time_sorting-btn i').css('color', 'blue');
      break;
    case 'saved_count':
      $('#heart_sorting-btn i').css('color', 'blue');
      break;
    case 'comment_count':
      $('#comments_sorting-btn i').css('color', 'blue');
      break;
  }
}

// [社群頁面]
// 搜尋Bar的選項按鈕
$('#socialPageSearchMenu li').on('click', function () {
  console.log($(this).text());
  console.log($('#socialPageSearch-btn').text());
  $('#socialPageSearch-btn').text($(this).text());

  // 收藏文章不需要輸入搜尋文字
  if ($('#socialPageSearch-btn').text() === '收藏文章') {
    $('#socialPageSearch-input').prop('disabled', true);
  } else {
    $('#socialPageSearch-input').prop('disabled', false);
  }
});

// [社群頁面]

$('#socialSearchBar').on('click', async function () {
  const search_text = $('#socialPageSearch-input').val();
  const search_method = $('#socialPageSearch-btn').text();
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const paging = urlParams.get('paging');
  const sorting = urlParams.get('sorting');

  const search_url = `${server}/socialPage?paging=${paging}&sorting=${sorting}&search_text=${search_text}&search_method=${search_method}`;

  let data = {
    'search_input': search_text,
    'search_method': search_method,
  };

  let config = {
    method: 'GET',
    url: search_url,
    data: data,
  };

  await axios(config)
    .then((response) => {
      console.log(response);
      alert('搜尋成功');
      window.location = search_url;
    })
    .catch((error) => {
      console.log(error);
      alert(error.response.data.msg);
    });
});
