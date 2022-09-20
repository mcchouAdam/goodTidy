const form = document.querySelector('#form-preview');

form.addEventListener('change', async (e) => {
  // e.preventDefault();

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
