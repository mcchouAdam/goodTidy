// 發出留言
async function createComments(note_id) {
  const bearer_token = localStorage.getItem('Authorization');
  if (!bearer_token) {
    alert('請先登入');
  }
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
    headers: {
      'Authorization': bearer_token,
    },
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

// 發出留言
async function createSave(note_id) {
  const bearer_token = localStorage.getItem('Authorization');
  if (!bearer_token) {
    alert('請先登入');
  }
  let data = {
    'user_id': user_id,
    'note_id': note_id,
  };

  var config = {
    method: 'POST',
    url: `${server}/api/1.0/note/save`,
    headers: {
      'Authorization': bearer_token,
    },
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
  const bearer_token = localStorage.getItem('Authorization');
  if (!bearer_token) {
    alert('請先登入');
  }

  // console.log(data);
  var config = {
    method: 'POST',
    url: `${server}/api/${API_VERSION}/note/shareToAll`,
    headers: {
      'Authorization': bearer_token,
    },
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
  const bearer_token = localStorage.getItem('Authorization');
  if (!bearer_token) {
    alert('請先登入');
  }

  var config = {
    method: 'POST',
    url: `${server}/api/${API_VERSION}/note/shareToOther`,
    headers: {
      'Authorization': bearer_token,
    },
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
  const bearer_token = localStorage.getItem('Authorization');
  if (!bearer_token) {
    alert('請先登入');
  }

  var config = {
    method: 'GET',
    url: `${server}/api/${API_VERSION}/note/ShareToOther/${note_id}`,
    headers: {
      'Authorization': bearer_token,
    },
    data: '',
  };

  await axios(config)
    .then((response) => {
      // console.log(response);
      $('#shareOtherList').html('');
      $('#shareOtherList').append($.parseHTML(response.data));
    })
    .catch((error) => {
      console.log(error);
      alert('拿取特定人士權限失敗');
    });
}

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
