// axios profile API
async function profile() {
  const bearer_token = localStorage.getItem('Authorization');
  if (bearer_token) {
    var config = {
      method: 'get',
      url: `${server}/api/1.0/user/profile`,
      headers: {
        'Authorization': bearer_token,
      },
      data: '',
    };

    await axios(config)
      .then((response) => {
        // console.log(response);
        user_id = response.data.data.id;
        user_picture = response.data.data.picture;
        user_name = response.data.data.name;
        user_email = response.data.data.email;
        console.log(user_id, user_picture, user_name, user_email);
      })
      .catch((error) => {
        console.log(error);
        console.log('登入失敗');
      });
  }
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
    method: 'post',
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
      localStorage.setItem(
        'Authorization',
        'Bearer ' + response.data.data.access_token
      );
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
    method: 'post',
    url: `${server}/api/1.0/user/signIn`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: data,
  };

  // 登入
  await axios(config)
    .then((response) => {
      console.log(response);
      localStorage.setItem(
        'Authorization',
        'Bearer ' + response.data.data.access_token
      );
      user_id = response.data.data.user.id;
      user_picture = response.data.data.user.picture;
      user_name = response.data.data.user.name;
      user_email = response.data.data.user.email;
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
  $('#user_picture > img').attr('src', user_picture);
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
$('#share-btn').click(function () {
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
  }

  await showProfile();
});

// 登出鍵
$('#logout').click(function () {
  localStorage.setItem('Authorization', '');
  location.reload(true);
});
