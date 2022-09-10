// 新增文字方塊鍵 ---------------------------------
$('#addfont').click(async function () {
  const item = $('<div class="add_fonts"><p>新增文字方塊</p></div>')
    .attr('contenteditable', 'true')
    .draggable({ containment: '#update-note-content' })
    .on('drag', stepDrag)
    .on('input', stepInput)
    .on('input', checkTextNull);
  $('#update-note-content').append(item);
});

// 儲存鍵 --------------------------------------
$('#storeNote').click(async function () {
  // TODO: 比較這次與前一次element的差別
  // diff(prev_version_note, $('#update-note-content').html())

  // 確認儲存 & 輸入版本名稱
  let version_name = prompt('請輸入此版本名稱:', '');

  if (version_name === null || version_name === '') {
    alert('版本名不能為空');
    return;
  }

  // console.log('file_name: ', file_name);
  console.log('version_name: ', version_name);

  // TODO: 目前version_img先寫死，可以用puppeteer截圖
  let data = {
    'note_id': current_note_id,
    'created_time': Date.now(),
    'version_img': '123_coolthing_ver3.png',
    'version_name': version_name,
    'elements': $('#update-note-content').html(),
    'keywords': $('.OCR_fonts p').text() + $('.add_fonts p').text(),
  };

  await axios({
    method: 'POST',
    url: '/api/1.0/noteVersion',
    data: data,
  });

  alert(`${version_name} 儲存成功!`);

  // 更新版本選擇的內容
  // ver_info = await load_version();
  // show_version(ver_info);
});

// 復原版本鍵 --------------------------------------
$('#recovery-btn').click(function () {
  // 清空原div上的物件
  $('#update-note-content').html('');
  // 初始化drag elements
  const version_chosen = +$('input[name=version]:checked').val();
  let $note_content = $('#update-note-content');
  drag_elements_init($note_content, [ver_info[version_chosen]]);
});

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

// version-btn -------------------------------------------
$('#version_list-btn').click(async function () {
  current_version_obj = await getVersionList(
    version_obj,
    $('#modal-version-main')
  );
});

$('#version-change').click(function () {
  const version_chosen = $('input[name="version_options"]:checked').val();
  noteShowFromVer(version_chosen, current_version_obj);
  // console.log(version_chosen);
});
