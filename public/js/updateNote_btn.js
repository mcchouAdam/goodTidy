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

  let ek = $('.addtextarea')
    .map((_, el) => el.value)
    .get();
  let keywords = ek.join('').replaceAll('\n', '');

  // TODO: 目前version_img先寫死，可以用puppeteer截圖
  let data = {
    'note_id': current_note_id,
    'created_time': Date.now(),
    'version_img': '123_coolthing_ver3.png',
    'version_name': version_name,
    'elements': $('#update-note-content').html(),
    'keywords': keywords,
    'text_elements': OCR_elements,
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
