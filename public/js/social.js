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
    url: `${server}/api/1.0/comments`,
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
      alert('收藏成功');
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
  if (heart_color == 'grey') {
    e.target.style.color = 'red';
    $('#time_sorting-btn i').css('color', 'grey');
    $('#comments_sorting-btn i').css('color', 'grey');
  } else {
    e.target.style.color = 'grey';
  }
});

// time_sorting -------
$('#time_sorting-btn').click(function (e) {
  let time_color = e.target.style.color;
  if (time_color == 'grey') {
    $('#heart_sorting-btn i').css('color', 'grey');
    e.target.style.color = 'blue';
    $('#comments_sorting-btn i').css('color', 'grey');
  } else {
    e.target.style.color = 'grey';
  }
});

// comments_sorting -------
$('#comments_sorting-btn').click(function (e) {
  let comments_color = e.target.style.color;
  if (comments_color == 'grey') {
    $('#heart_sorting-btn i').css('color', 'grey');
    $('#time_sorting-btn i').css('color', 'grey');
    e.target.style.color = 'red';
  } else {
    e.target.style.color = 'grey';
  }
});
