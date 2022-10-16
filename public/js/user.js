// axios profile API
async function profile() {
  const config = {
    method: 'get',
    url: '/api/1.0/user/profile',
    data: '',
  };

  await axios(config)
    .then((response) => {
      // console.log('profile:', response);
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
  const data = new FormData();
  data.append('user_pic_upload', picture);
  data.append('name', username);
  data.append('email', email);
  data.append('password', password);
  data.append('filename', filename);

  const config = {
    method: 'POST',
    url: '/api/1.0/user/signup',
    data,
  };

  let isSuccess = false;
  let msg;
  await axios(config)
    .then((response) => {
      // console.log('註冊成功');
      // console.log('user_signup_success:', response);
      user_id = response.data.id;
      user_picture = response.data.picture;
      user_name = response.data.name;
      user_email = response.data.email;
      isSuccess = true;
      msg = '註冊成功';
    })
    .catch((error) => {
      console.log('註冊失敗');
      isSuccess = false;
      msg = error.response.data.error;
    });

  const result = { isSuccess, msg };

  return result;
}

// axios signIn API
async function signIn(email, password) {
  const data = {
    provider: 'native',
    email,
    password,
  };

  const config = {
    method: 'POST',
    url: '/api/1.0/user/signIn',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
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
      }).then(() => {
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

// [分享頁面] 顯示分享頁面資料
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
    // 確定開放留言
    if (note_url_permission >= 2) {
      $('#allowComment-toggle').prop('checked', true);
    }
    if (sharing_image) {
      const href = `${S3_HOST}sharing_image/${sharing_image}`;
      $('#sharePic_preview').attr('src', href);
      $('#sharePic_preview').show();
    }
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
    // 關閉狀態
    $('#shareToAll-status').text('關閉中');
    $('#shareToAll-status').removeClass('bg-success');
    $('#shareToAll-status').addClass('bg-secondary');
    $('#share_url').hide();
    $('#copy_shareUrl').hide();
    $('#share_url').val('');
    $('#share_url').prop('disabled', true);
    $('#allowComment-toggle').prop('checked', false);
    $('#share_description').val('');
    $('#sharePic_preview').hide();
    $('span.tags').remove();
  }
}

// 拿取User所有通知 ----------------------------
async function getUserMsg() {
  const data = {
    user_email,
  };

  const config = {
    method: 'GET',
    url: `/api/${API_VERSION}/message`,
    data,
  };

  // 抓取通知資訊
  await axios(config)
    .then((response) => {
      current_user_msg = response.data.data;
      // console.log('delete_current_user_msg', current_user_msg);
    })
    .catch((error) => {
      console.log(error);
    });
}

// 顯示User所有通知 ----------------------------
async function showUserMsg() {
  // console.log('current_user_msg', current_user_msg);
  const msgCount = current_user_msg.length;
  // console.log('msgCount', current_user_msg.length);
  $('#msg_count').text(msgCount);
  if (msgCount === 0) {
    $('.userMsgNotifications').html(
      '<li class="dropdown-header">您無新訊息</li>'
    );
    return;
  }

  $('ul.notifications').html('');
  $('ul.notifications').append(
    `<button class="btn" onclick="javascript:deleteAllUserMsg('${user_email}')"><i class="bi bi-x-square" style="color:black;">一鍵清除</i></button><li></li>`
  );
  current_user_msg.map((m) => {
    let icon_html = '';
    const createdTime = timeConverter(new Date(m.created_time));
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
    const item = `
      <button id="userMsg-closebtn-${m._id}" onclick="clickDeleteUserMsg('${m._id}')" class="btn msg-close" style="display:inline;float:right;cursor:pointer">
        <i class="bi bi-x-circle-fill" value="${m._id}" style="float:right;cursor:pointer"></i>
      </button>
      <li id="userMsg_${m._id}" class="notification-item" style="cursor:pointer;">
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

// 一鍵清除使用者所有推播資訊
async function deleteAllUserMsg(user_email) {
  Swal.fire({
    title: '確定要刪除全部通知?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '刪除',
    cancelButtonText: '取消',
  }).then(async (result) => {
    if (result.isConfirmed) {
      const data = {
        user_email,
      };

      const config = {
        method: 'DELETE',
        url: `/api/${API_VERSION}/messages`,
        data,
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
          $('.userMsgNotifications').html(
            '<li class="dropdown-header">您無新訊息</li>'
          );
          $('#msg_count').text(0);
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
      const data = {
        msg_id,
      };

      const config = {
        method: 'DELETE',
        url: `/api/${API_VERSION}/message`,
        data,
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
          $(`#userMsg_${config.data.msg_id}`).remove();
          $(`#userMsg-closebtn-${config.data.msg_id}`).remove();

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
}

async function clickDeleteUserMsg(msgId) {
  await deleteMsg(msgId);
  await getUserMsg();
  await showUserMsg();
}
