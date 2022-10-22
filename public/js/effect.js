// SweetAlert效果 ----------------------------------------------
async function alertSuccess(title) {
  Swal.fire({
    icon: 'success',
    title: title,
    showConfirmButton: false,
    timer: 1000,
  });
}

async function alertError(title) {
  Swal.fire({
    icon: 'error',
    title: title,
    showConfirmButton: false,
    timer: 1000,
  });
}

// loading效果 ----------------------------------------------
async function btnLoadingOn(id) {
  $(id).prop('disabled', true);
  $('body').css('cursor', 'progress');
}

async function btnLoadingOff(id) {
  $(id).prop('disabled', false);
  $('body').css('cursor', 'default');
}

// 轉換時間格式
const timeConverter = (date) => {
  dataValues = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ];

  const year = date.getFullYear().toString();
  let month = (date.getMonth() + 1).toString();
  let day = date.getDate().toString();
  let hours = date.getHours().toString();
  let minute = date.getMinutes().toString();
  let second = date.getSeconds().toString();

  if (day.length == 1) {
    day = `0${day}`;
  }
  if (month.length == 1) {
    month = `0${month}`;
  }
  if (hours.length == 1) {
    hours = `0${hours}`;
  }
  if (minute.length == 1) {
    minute = `0${minute}`;
  }
  if (second.length == 1) {
    second = `0${second}`;
  }

  const timeFormat = `${year}/${month}/${day} - ${hours}:${minute}:${second}`;

  return timeFormat;
};

async function redirectPage(page) {
  let redirectTime = 3;
  setInterval(() => {
    $('#redirectMsg').text(redirectTime + '秒後跳轉頁面');
    redirectTime--;
    if (redirectTime === 0) {
      window.location.assign('/' + page);
    }
  }, 1000);
}
