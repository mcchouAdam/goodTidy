// axios profile API
async function profile() {
  let config = {
    method: 'get',
    url: `/api/1.0/user/profile`,
    data: '',
  };

  await axios(config)
    .then((response) => {
      console.log('profile:', response);
      user_id = response.data.data.id;
      user_picture = response.data.data.picture;
      user_name = response.data.data.name;
      user_email = response.data.data.email;
    })
    .catch((error) => {
      console.log(error);
    });
}

// axios signUp API
async function signUp(picture, username, email, password, filename) {
  let data = new FormData();
  data.append('user_pic_upload', picture);
  data.append('name', username);
  data.append('email', email);
  data.append('password', password);
  data.append('filename', filename);

  let config = {
    method: 'POST',
    url: `/api/1.0/user/signup`,
    data: data,
  };

  let isSuccess = false;
  let msg;
  await axios(config)
    .then(function (response) {
      // console.log('註冊成功');
      // console.log('user_signup_success:', response);
      user_id = response.data.id;
      user_picture = response.data.picture;
      user_name = response.data.name;
      user_email = response.data.email;
      isSuccess = true;
      msg = '註冊成功';
    })
    .catch(function (error) {
      // console.log('註冊失敗');
      // console.log('user_signup_error:', error.response.data.error);
      isSuccess = false;
      msg = error.response.data.error;
    });

  let result = { 'isSuccess': isSuccess, 'msg': msg };

  return result;
}

// axios signIn API
async function signIn(email, password) {
  let data = {
    'provider': 'native',
    'email': email,
    'password': password,
  };

  let config = {
    method: 'POST',
    url: `/api/1.0/user/signIn`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: data,
  };

  // 登入
  await axios(config)
    .then((response) => {
      console.log('signIn response:', response);
      user_id = response.data.data.user.id;
      user_picture = response.data.data.user.picture;
      user_name = response.data.data.user.name;
      user_email = response.data.data.user.email;
      Swal.fire({
        icon: 'success',
        title: `${user_name}您好！`,
        showConfirmButton: false,
        timer: 1500,
      }).then(function () {
        window.location.assign('/profile');
      });
    })
    .catch((error) => {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: error.response.data.error,
        showConfirmButton: false,
        timer: 1500,
      });
    });
}

// [分享頁面] 分享toggle元件 ---------------------------------
$('#share-btn').click(async function () {
  if (!current_note_id) {
    $('#shareToAllModal').modal({
      backdrop: 'static',
      keyboard: false,
    });
    Swal.fire('請先選擇筆記');

    // $('#shareToAllModal').modal('hide');
    return 0;
  }

  // PreLoad the 特定人士清單
  await getShareToOther(current_note_id);

  // 全域變數
  await getShareAll(current_note_id);
  const shareOtherList_content = $('#shareOtherList li').text();

  // 向特定人士分享
  if (shareOtherList_content) {
    $('#shareToOther-toggle').prop('checked', true);
    $('#shareToOhterDetail').css('visibility', 'visible');
  }

  // 分享社群頁面
  if (note_isSharing === 1) {
    $('#shareToAll-toggle').prop('checked', true);
    $('#shareToAllDetail').css('visibility', 'visible');
  }

  switch (note_url_permission) {
    case 1:
      $('#shareToAll-toggle').prop('checked', true);
      break;
    case 2:
      $('#shareToAll-toggle').prop('checked', true);
      $('#allowComment-toggle').prop('checked', true);
      break;
  }

  // share_description
  $('#share_description').html(sharing_descrition);

  // sharing_url 輸入Bar
  $('#share_url').val(`${server}${sharing_url}`);

  // 清空所有原tags
  $('.tags').remove();

  // 重新渲染tags
  tags.map((t) => {
    $('.note_tags').append(`
    <span class="tags badge bg-info rounded-pill" style="color:white;">${t}&nbsp
      <i class="fa fa-times-circle" style="margin-left:-3px;" aria-hidden="true"></i>
    </span>`);
  });
});

// 註冊鍵 -------------------------------------
$('#signup-form-btn').click(async function (e) {
  e.preventDefault();

  // Loading圖示
  $('#signup-form-btn').prop('disabled', true);
  $('body').css('cursor', 'progress');

  if (!user_email) {
    const email = $('#signup_useremail').val();
    const password = $('#signup_password').val();
    const username = $('#signup_username').val();
    const picture = $('#user_picture')[0].files[0];

    if (!picture) {
      // 沒上傳圖片
      filename = '';
    } else {
      filename = picture.name;
    }

    const signUp_result = await signUp(
      picture,
      username,
      email,
      password,
      filename
    );

    // 釋放Loading圖示
    $('#signup-form-btn').prop('disabled', false);
    $('body').css('cursor', 'default');

    // 註冊失敗
    if (!signUp_result.isSuccess) {
      Swal.fire({
        icon: 'error',
        title: signUp_result.msg,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    // 註冊成功
    Swal.fire({
      icon: 'success',
      title: signUp_result.msg,
      showConfirmButton: false,
      timer: 1500,
    }).then(function () {
      window.location.assign('/profile');
    });
  }
});

// 登入鍵 -------------------------------------
$('#signin-form-btn').click(async function (e) {
  e.preventDefault();

  if (!user_email) {
    const email = $('#signin_useremail').val();
    const password = $('#signin_password').val();

    await signIn(email, password);
  }
});

// 拿取User所有通知 ----------------------------
async function getUserMsg() {
  let data = {
    'user_email': user_email,
  };

  let config = {
    method: 'GET',
    url: `/api/${API_VERSION}/message`,
    data: data,
  };

  // 抓取通知資訊
  await axios(config)
    .then((response) => {
      current_user_msg = response.data.data;
      console.log('user_notification:', current_user_msg);
    })
    .catch((error) => {
      console.log(error);
    });
}

// 顯示User所有通知 ----------------------------
async function showUserMsg() {
  const msg_count = current_user_msg.length;
  $('#msg_count').text(msg_count);
  if (msg_count === 0) {
    return;
  }

  $('ul.notifications').html('');
  current_user_msg.map((m) => {
    let icon_html = '';
    switch (m.type) {
      case '收藏':
        icon_html = '<i class="bi bi-heart-fill" style="color:red;"></i>';
        break;
      case '筆記分享':
        icon_html = '<i class="bi bi-share" style="color:blue;"></i>';
        break;
      case '分享取消':
        icon_html = '<i class="bi bi-x-circle" style="color:#ffbf00;"></i> ';
        break;
    }
    let item = `
      <button class="btn msg-close" style="display:inline;float:right;cursor:pointer">
        <i id="${m._id}" class="bi bi-x-circle-fill" style="float:right;cursor:pointer"></i>
      </button>
      <li class="notification-item" style="cursor:pointer;">
        ${icon_html}
        <div>
          <h4>${m.type}</h4>
          <p>${m.content}</p>
          <p>${m.created_time}</p>
          </div>
      </li>`;
    $('ul.notifications').append(item);
  });
}
