const form = document.querySelector('#form-preview');

form.addEventListener('change', async (e) => {
  // e.preventDefault();

  // 檢查檔名
  const filetype = $('#file-preview')[0].files[0].name.split('.').pop();
  if (filetype != 'jpeg' && filetype != 'jpg' && filetype != 'png') {
    Swal.fire({
      icon: 'error',
      title: '請您上傳jpeg, jpg, png檔',
      showConfirmButton: false,
      timer: 1000,
    });
    return;
  }
  const file_size = $('#file-preview')[0].files[0].size / 1024 / 1024; //MB
  if (file_size > 2) {
    Swal.fire({
      icon: 'error',
      title: '檔案超過2MB',
      showConfirmButton: false,
      timer: 1000,
    });
    return;
  }

  // 每次新Load一張圖片，清掉preview視窗
  $('#note-preview-content').html('');

  // Get data URI of the selected image
  const formData = new FormData(e.currentTarget);
  const photoField = formData.get('photo');
  const dataUri = await dataUriFromFormField(photoField);

  const imgEl = document.createElement('img');
  imgEl.addEventListener('load', () => {
    let wantedWidth;
    if (imgEl.width >= 600) {
      wantedWidth = 600;
    } else {
      wantedWidth = imgEl.width;
    }
    const resizedDataUri = resizeImage(imgEl, wantedWidth);
    document.querySelector('#img-preview').src = resizedDataUri;
  });
  imgEl.src = dataUri;
});

function dataUriFromFormField(field) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      resolve(reader.result);
    });

    reader.readAsDataURL(field);
  });
}

function resizeImage(imgEl, wantedWidth) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const aspect = imgEl.width / imgEl.height;

  canvas.width = wantedWidth;
  canvas.height = wantedWidth / aspect;

  ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL();
}
