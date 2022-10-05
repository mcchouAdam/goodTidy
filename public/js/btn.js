// 圖形圈選 ---------------------------
// 魔術
$('#magicContour').click(async () => {
  initCanvasListener(canvas);
});

// 方形圈選
$('#rectContour').click(async (e) => {
  // const isfile_upload = $('#file-preview').get(0).files.length;
  // if (isfile_upload == 0) {
  //   // Swal.fire('請先選擇檔案');
  //   Swal.fire('請先選擇檔案');
  //   return;
  // }

  $('#fontOCRCanvas').css('cursor', 'crosshair');
  initRectContourListener(canvas);
});

// 方形+擷取
async function shapeSnapShot() {
  // removeCanvasListener(canvas);
  // removeRectContourRemoveListener(canvas);
  // clearContext(canvas, context);
  canvasBackground();

  // console.log(rectContour_params);
  let item_x1 = rectContour_params[0];
  let item_y1 = rectContour_params[1];
  const item_width = Math.abs(rectContour_params[2]);
  const item_height = Math.abs(rectContour_params[3]);

  // 防止使用從左下、右下、右上開始拉
  const item_x2 = rectContour_params[4];
  const item_y2 = rectContour_params[5];

  item_x1 = Math.min(item_x1, item_x2);
  item_y1 = Math.min(item_y1, item_y2);

  const item_img = $(`<img src="${previewBlah.src}" />`)
    .css('width', previewBlah.width)
    .css('height', previewBlah.height)
    .css('margin', `${-item_y1}px 0 0 ${-item_x1}px`); // 取圈選的位置

  const item_id = `${Date.now()}_contour-pic`;
  const item = $(`<div class="contour-pic" id="${item_id}"></div>`)
    .css('width', `${item_width}px`)
    .css('height', `${item_height}px`)
    .css('overflow', 'hidden')
    .css('position', 'absolute')
    .draggable({
      containment: '#note-preview-content',
    });

  item.append(item_img);
  $('#note-preview-content').append(item);

  upload_preview_element.push(item);
  // for next element clear
  Screen_percent_arr = [];
}

// 擷取鍵 ------------------------------
// $('#shapeView').click(function () {
//   removeCanvasListener(canvas);
//   removeRectContourRemoveListener(canvas);
//   clearContext(canvas, context);
//   canvasBackground();

//   console.log(rectContour_params);
//   let item_x1 = rectContour_params[0];
//   let item_y1 = rectContour_params[1];
//   let item_width = rectContour_params[2];
//   let item_height = rectContour_params[3];

//   const item_img = $(`<img src="${previewBlah.src}" />`)
//     .css('width', previewBlah.width)
//     .css('height', previewBlah.height)
//     .css('margin', `${-item_y1}px 0 0 ${-item_x1}px`); // 取圈選的位置

//   const item_id = `${Date.now()}_contour-pic`;
//   const item = $(`<div class="contour-pic" id="${item_id}"></div>`)
//     .css('width', `${item_width}px`)
//     .css('height', `${item_height}px`)
//     .css('overflow', 'hidden')
//     .css('position', 'absolute')
//     .draggable({ containment: '#note-preview-content' });

//   item.append(item_img);
//   $('#note-preview-content').append(item);

//   // for next element clear
//   Screen_percent_arr = [];
// });

// 回復鍵 ------------------------------------
$('#reDraw').click(() => {
  clearContext(canvas, context);
  canvasBackground();
  removeRectRemoveListener(canvas);
  Screen_percent_arr = [];
});

// 新增文字方塊鍵 ---------------------------------
$('#addfont').click(async () => {
  addDragTextarea('#update-note-content', '', 25, 25);
});

// 儲存鍵 --------------------------------------
$('#storeNote').click(async () => {
  Swal.fire({
    title: '您確定要新增版本嗎?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '確定',
    cancelButtonText: '取消',
  }).then(async (result) => {
    if (result.isConfirmed) {
      const version_name = new Date();

      // 圖形擷取資訊
      const contourImg_count = $('.contour-pic').length;
      let element_html = '';
      for (let i = 0; i < contourImg_count; i++) {
        element_html += $('.contour-pic').get(i).outerHTML;
      }
      const file_name = `${S3_HOST}notes/${note_bg}`;
      const removeSrc_element = element_html.replaceAll(file_name, '');

      // OCR的draggable文字方塊資訊
      // OCR_elements = [];
      // if (OCR_ids.length != 0) {
      //   OCR_ids.map((id) => {
      //     const OCR_top = $(`#${id}`).parent().get(0).style.top;
      //     const OCR_left = $(`#${id}`).parent().get(0).style.left;
      //     const OCR_width = $(`#${id}`).parent().get(0).style.width;
      //     const OCR_height = $(`#${id}`).parent().get(0).style.height;
      //     const OCR_text = $(`#${id}`).val();
      //     const OCR_obj = {
      //       'text': OCR_text,
      //       'textTop': OCR_top,
      //       'textLeft': OCR_left,
      //       'height': OCR_height,
      //       'width': OCR_width,
      //     };
      //     OCR_elements.push(OCR_obj);
      //   });
      // }

      // 文字擷取
      const text_elements = $('.div_addtextarea');
      const OCR_elements = [];
      if (text_elements.length != 0) {
        text_elements.map((i, e) => {
          let obj = {};
          const OCR_top = e.style.top;
          const OCR_left = e.style.left;
          const OCR_width = e.style.width;
          const OCR_height = e.style.height;
          const OCR_text = e.firstChild.value;
          obj = {
            text: OCR_text,
            textTop: OCR_top,
            textLeft: OCR_left,
            height: OCR_height,
            width: OCR_width,
          };
          OCR_elements.push(obj);
        });
      }

      // 搜尋使用的keywords，將全部的字串串起來
      const ek = $('.addtextarea')
        .map((_, el) => el.value)
        .get();
      const keywords = ek.join('').replaceAll('\n', '').replace(/\s/g, '');

      const data = {
        note_id: current_note_id,
        created_time: '',
        version_img: '123_coolthing_ver3.png',
        version_name,
        elements: removeSrc_element,
        keywords,
        text_elements: JSON.stringify(OCR_elements),
      };

      await axios({
        method: 'POST',
        url: '/api/1.0/noteVersion',
        data,
      });

      Swal.fire({
        icon: 'success',
        title: '存檔成功',
        showConfirmButton: false,
        timer: 1000,
      });

      // 重抓使用者資料
      await getUserNotes();
      current_version_obj = await getVersionList(
        version_obj,
        $('#modal-version-main')
      );
      // window.location.assign('/note');
    }
  });
});

// 自動儲存鍵 ---------------------------------------------
$('#autoSave-toggle').change(function () {
  if (this.checked) {
    AutoSave.start();
  } else {
    AutoSave.stop();
  }
});

// 版本列表鍵 -------------------------------------------
$('#version_list-btn').click(async () => {
  current_version_obj = await getVersionList(
    version_obj,
    $('#modal-version-main')
  );
});

// 版本回復鍵
$('#version-change').click(() => {
  const version_chosen = $('input[name="version_options"]:checked').val();
  noteShowFromVer(version_chosen, current_version_obj);
});

// --------------------------------------------------------
// 特定人分享清單鍵
$('#sharedNote-btn').click(async () => {
  await getSharedNote(shared_note_obj, $('#modal-sharedNote-main'));
});

// 特定人分享查看鍵
$('#sharedNote-change').click(() => {
  const note_chosen = $('input[name="shareNote_options"]:checked').val();
  window.open(`/sharedToOtherNote/${shared_note_obj[note_chosen].note_id}`);
});
