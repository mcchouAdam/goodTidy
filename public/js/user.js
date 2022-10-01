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
      console.log('註冊失敗');
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
        timer: 1000,
      }).then(function () {
        window.location.assign('/note');
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

// [分享頁面] 分享鍵 ---------------------------------
$('#share-btn').click(async function () {
  await showShareToAll();
});

async function showShareToAll() {
  // PreLoad the 特定人士清單
  await getShareToOther(current_note_id);

  // assign到全域變數
  await getShareAll(current_note_id);
  // const shareOtherList_content = $('#shareOtherList li').text();

  // 分享到社群的狀態
  if (note_isSharing == 1) {
    // share_description (javacript injection)
    sharing_descrition = sharing_descrition
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
    $('#share_description').html(sharing_descrition);

    // sharing_url 輸入Bar
    $('#share_url').show();
    $('#copy_shareUrl').show();
    $('#share_url').val(`${server}${sharing_url}`);

    // 分享狀態
    $('#shareToAll-status').text('分享中');
    $('#shareToAll-status').removeClass('bg-secondary');
    $('#shareToAll-status').addClass('bg-success');
    $('share_url').prop('disabled', false);

    // 清空所有原tags
    // 重新渲染tags
    $('.tags').remove();
    tags.map((t) => {
      $('.note_tags').append(`
        <span class="tags badge bg-info rounded-pill" style="color:white;">${t}
          <i class="fa fa-times-circle" style="margin-left:-3px;" aria-hidden="true"></i>
        </span>`);
    });
  } else {
    // 分享狀態
    $('#shareToAll-status').text('關閉中');
    $('#shareToAll-status').removeClass('bg-success');
    $('#shareToAll-status').addClass('bg-secondary');
    $('#share_url').hide();
    $('#copy_shareUrl').hide();
    $('#share_url').val('');
    $('share_url').prop('disabled', true);
  }
}

// 取消分享鍵 ---------------------------------
$('#shareToAll_cancel-btn').click(async function () {
  await deleteShareAll();
  await getShareAll(current_note_id);
  await showShareToAll();
  // await getSharedNote(shared_note_obj, $('#modal-sharedNote-main'));
  // $('#share-btn').click();
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
        timer: 1000,
      });
      return;
    }

    // 註冊成功
    Swal.fire({
      icon: 'success',
      title: signUp_result.msg,
      showConfirmButton: false,
      timer: 1000,
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
    let createdTime = timeConverter(new Date(m.created_time));
    switch (m.type) {
      case '收藏':
        icon_html = '<i class="bi bi-heart-fill" style="color:red;"></i>';
        content_html = `<p>${m.content}</p>`;
        break;
      case '筆記分享':
        icon_html = '<i class="bi bi-share" style="color:blue;"></i>';
        content_html = `<p><a href="${server}/sharedToOtherNote/${m.note_id}">${m.content}</a></p>`;
        break;
      case '分享取消':
        icon_html = '<i class="bi bi-x-circle" style="color:#ffbf00;"></i>';
        content_html = `<p>${m.content}</p>`;
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
          ${content_html}
          <p>${createdTime}</p>
          </div>
      </li>`;
    $('ul.notifications').append(item);
  });
}
