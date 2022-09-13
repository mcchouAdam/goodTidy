// axios profile API
async function profile() {
  let config = {
    method: 'get',
    url: `${server}/api/1.0/user/profile`,
    data: '',
  };

  await axios(config)
    .then((response) => {
      console.log('profile:', response);
      user_id = response.data.data.id;
      user_picture = response.data.data.picture;
      user_name = response.data.data.name;
      user_email = response.data.data.email;
      // console.log('aaaaa: ', user_id, user_picture, user_name, user_email);
    })
    .catch((error) => {
      console.log(error);
      console.log('登入失敗');
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
    url: `${server}/api/1.0/user/signup`,
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
    url: `${server}/api/1.0/user/signIn`,
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
      alert(`${user_name}您好！登入成功`);
    })
    .catch((error) => {
      console.log(error);
      alert('登入失敗，請重新登入');
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

// dialog視窗
$('#signup-dialog').dialog({ title: 'signup', autoOpen: false });
$('#signin-dialog').dialog({ title: 'signin', autoOpen: false });
$('#profile-dialog').dialog({ title: 'profile', autoOpen: false });
$('#share-dialog').dialog({ title: 'share', autoOpen: false });

// signIn頁面 ---------------------------------
$('#signin-btn').click(function () {
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
    alert('請先登入');
  } else {
    await showProfile();
  }
});

// share頁面 ---------------------------------
$('#share-btn').click(async function () {
  if (!current_note_id) {
    alert('請先選擇筆記');
    return;
  }


  // PreLoad the 特定人士清單
  await getShareToOther(current_note_id);
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
      $('#allowWatch-toggle').prop('checked', true);
      break;
    case 3:
      $('#allowWatch-toggle').prop('checked', true);
      $('#allowComment-toggle').prop('checked', true);
      break;
  }

  // share_description
  $('#share_description').html(sharing_descrition);

  // sharing_url 輸入Bar
  $('#share_url').val(`${server}${sharing_url}`);

  // TODO: 上傳照片預覽
  // sharing_image

  // dialog開關
  $('#signin-dialog').dialog('close');
  $('#signup-dialog').dialog('close');
  $('#profile-dialog').dialog('close');
  $('#share-dialog').dialog('open');
});

// 註冊鍵 -------------------------------------
$('#signup-form-btn').click(async function () {
  if (!user_email) {
    const email = $('#signup_useremail').val();
    const password = $('#signup_password').val();
    const username = $('#signup_username').val();
    const picture = $('#user_picture')[0].files[0];
    const filename = picture.name;

    await signUp(picture, username, email, password, filename);
  }
  await showProfile();
});

// 登入鍵 -------------------------------------
$('#signin-form-btn').click(async function () {
  if (!user_email) {
    const email = $('#signin_useremail').val();
    const password = $('#signin_password').val();

    await signIn(email, password);
    location.reload(true);
  }
});

// 登出鍵
$('#logout').click(async function () {
  // TODO: 刪除cookie
  let data = '';

  let config = {
    method: 'GET',
    url: `${server}/api/1.0/user/logout`,
    data: data,
  };

  await axios(config)
    .then(function (response) {
      console.log(response);
      console.log('登出成功');
      window.location.assign('/');
    })
    .catch(function (error) {
      console.log(error);
      console.log('登出失敗');
    });
});
