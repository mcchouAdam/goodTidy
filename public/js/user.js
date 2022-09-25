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

  await axios(config)
    .then(function (response) {
      console.log(response);
      user_id = response.data.data.user.id;
      user_picture = response.data.data.user.picture;
      user_name = response.data.data.user.name;
      user_email = response.data.data.user.email;
    })
    .catch(function (error) {
      console.log(error);
      console.log('註冊失敗');
    });
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
        title: `登入失敗，請重新登入`,
        showConfirmButton: false,
        timer: 1500,
      }).then(function () {
        window.location.assign('/signin');
      });
    });
}

async function showProfile() {
  $('#signin-dialog').dialog('close');
  $('#signup-dialog').dialog('close');
  $('#profile-dialog').dialog('open');
  $('#user_picture > img')
    .attr('src', `${S3_HOST}user_picture/${user_picture}`)
    .addClass('profile-pic');
  $('#user_email').text(user_email);
  $('#user_name').text(user_name);
}

// signIn頁面 ---------------------------------
$('#signin-btn').click(function (e) {
  if (user_email) {
    showProfile();
  } else {
    $('#signin-dialog').dialog('open');
    $('#signup-dialog').dialog('close');
    $('#profile-dialog').dialog('close');
  }
});

// signUp頁面 ---------------------------------
$('#signup-btn').click(function () {
  if (user_email) {
    showProfile();
  } else {
    $('#signin-dialog').dialog('close');
    $('#signup-dialog').dialog('open');
    $('#profile-dialog').dialog('close');
  }
});

// profile頁面 ---------------------------------
$('#profile-btn').click(async function () {
  if (!user_email) {
    Swal.fire('請先登入');
  } else {
    await showProfile();
  }
});

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

  console.log('sharing_descrition: ', sharing_descrition);

  // sharing_url 輸入Bar
  $('#share_url').val(`${server}${sharing_url}`);

  $('.badge.bg-success.rounded-pill').remove();
  tags.map((t) => {
    $('.note_tags').append(
      `<span class="badge bg-success rounded-pill">${t}</span>`
    );
  });
});

// 註冊鍵 -------------------------------------
$('#signup-form-btn').click(async function (e) {
  e.preventDefault();

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

    await signUp(picture, username, email, password, filename);

    Swal.fire({
      icon: 'error',
      title: '註冊成功',
      showConfirmButton: false,
      timer: 1500,
    });
  }
  await showProfile();
  // window.location.assign('/note');
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
