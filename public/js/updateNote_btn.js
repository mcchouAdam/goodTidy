// 新增文字方塊鍵 ---------------------------------
$('#addfont').click(async function () {
  addDragTextarea('#update-note-content', '新增文字方塊');
});

// 儲存鍵 --------------------------------------
$('#storeNote').click(async function () {
  // TODO: 版控使用差異法

  // 確認儲存 & 輸入版本名稱
  let version_name = prompt('請輸入此版本名稱:', '');

  if (version_name === null || version_name === '') {
    alert('版本名不能為空');
    return;
  }

  // TODO: 目前version_img先寫死，可以用puppeteer截圖

  // 圖形擷取資訊
  let contourImg_count = $('.contour-pic').length;
  let element_html = '';
  for (let i = 0; i < contourImg_count; i++) {
    element_html += $('.contour-pic').get(i).outerHTML;
  }
  let removeSrc_element = element_html.replaceAll(previewBlah.src, '');

  // 儲存時需要按照順序append
  // OCR的draggable文字方塊資訊
  OCR_elements = [];
  OCR_ids.map((id) => {
    const OCR_top = $(`#${id}`).parent().get(0).style.top;
    const OCR_left = $(`#${id}`).parent().get(0).style.left;
    const OCR_width = $(`#${id}`).parent().get(0).style.width;
    const OCR_height = $(`#${id}`).parent().get(0).style.height;
    const OCR_text = $(`#${id}`).val();
    const OCR_obj = {
      'text': OCR_text,
      'textTop': OCR_top,
      'textLeft': OCR_left,
      'height': OCR_height,
      'width': OCR_width,
    };
    OCR_elements.push(OCR_obj);
  });

  // console.log(OCR_elements);

  // // 搜尋使用的keywords;
  let ek = $('.addtextarea')
    .map((_, el) => el.value)
    .get();
  let keywords = ek.join('').replaceAll('\n', '').replace(/\s/g, '');

  let data = {
    'note_id': current_note_id,
    'created_time': '',
    'version_img': '123_coolthing_ver3.png',
    'version_name': version_name,
    'elements': removeSrc_element,
    'keywords': keywords,
    'text_elements': JSON.stringify(OCR_elements),
  };

  await axios({
    method: 'POST',
    url: '/api/1.0/noteVersion',
    data: data,
  });

  alert(`${version_name} 儲存成功!`);
  window.location.assign('/updateNote');

  // 更新版本選擇的內容
  // ver_info = await load_version();
  // show_version(ver_info);
});

// // 復原版本鍵 --------------------------------------
// $('#recovery-btn').click(function () {
//   // 清空原div上的物件
//   $('#update-note-content').html('');
//   // 初始化drag elements
//   const version_chosen = +$('input[name=version]:checked').val();
//   let $note_content = $('#update-note-content');

//   drag_elements_init($note_content, [ver_info[version_chosen]]);
// });

// 自動儲存鍵 ---------------------------------------------
$('#autoSave_box').change(function () {
  if (this.checked) {
    AutoSave.start();
  } else {
    AutoSave.stop();
  }
});

// 回復自動儲存最新版鍵 ------------------------------
$('#newest-version-btn').click(function () {
  const newest_version = AutoSave.restore();
  $('#update-note-content').html('');

  //TODO: 待重構
  let elements = $.parseHTML(newest_version);
  elements.map((s) => {
    $('.contour-pic.ui-draggable.ui-draggable-handle').draggable({
      containment: '#update-note-content',
    });
    $('.add_fonts').draggable({ containment: '#update-note-content' });
    $('.OCR_fonts').draggable({ containment: '#update-note-content' });
    $('#update-note-content').append(s);
  });
});

// 版本列表鍵 -------------------------------------------
$('#version_list-btn').click(async function () {
  current_version_obj = await getVersionList(
    version_obj,
    $('#modal-version-main')
  );
});

// 版本回復鍵
$('#version-change').click(function () {
  const version_chosen = $('input[name="version_options"]:checked').val();
  noteShowFromVer(version_chosen, current_version_obj);
});

// 留言button
$('#comment-btn').click(function (e) {
  const item = $(
    '<i class="fa fa-solid fa-comments" ondblclick="openNav()"></i>'
  )
    // .attr('contenteditable', 'true')
    .draggable({ containment: '#update-note-content' })
    .on('drag', stepDrag);
  $('#update-note-content').append(item);
});

$('#commentSwitch').change(function () {
  let isChecked = $('#commentSwitch')[0].checked;
  if (isChecked) {
    $('.fa.fa-solid.fa-comments.ui-draggable.ui-draggable-handle').show();
  } else {
    $('.fa.fa-solid.fa-comments.ui-draggable.ui-draggable-handle').hide();
  }
});

// 刪除鍵 --------------------------------------------------
$('#deleteNote').click(function () {
  console.log($(':focus'));
});
