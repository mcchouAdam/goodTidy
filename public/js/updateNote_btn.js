let alldragObject = [];
let file_name;

// 上一版筆記的內容
let prev_version_note;

// 筆記名稱鍵 ---------------------------------------------------------
$('#search-notename-btn').click(async function () {
  try {
    // let note_name = $('#notename-search').val();

    // 查詢note-name ----------------------
    const query_note_result = await axios({
      method: 'GET',
      url: `api/1.0/note/${note_name}`,
      responseType: 'json',
    });

    const note_elements = query_note_result.data;
    prev_version_note = note_elements;
    let $note_content = $('#update-note-content');

    // elements初始化
    drag_elements_init($note_content, note_elements);

    // 上一步/下一步
    $('.contour-pick').on('drag', stepDrag);
    $('.add_fonts').on('drag', stepDrag).on('input', stepInput);
    $('.OCR_fonts').on('drag', stepDrag).on('input', stepInput);
  } catch (err) {
    console.log(err);
    return;
  }
});

// 新增文字方塊鍵 ---------------------------------
$('#addfont').click(async function () {
  const item = $('<div class="add_fonts"><p>新增文字方塊</p></div>')
    .attr('contenteditable', 'true')
    .draggable({ containment: '#update-note-content' });
  $('.update-note-content').append(item);
});

// 儲存鍵 --------------------------------------
$('#storeNote').click(async function () {
  // TODO: 比較這次與前一次element的差別
  // diff(prev_version_note, $('#update-note-content').html())

  // 確認儲存 & 輸入版本名稱
  let ver_name = prompt(
    '請輸入此版本名稱:',
    `${note_name}_第${ver_info.length + 1}版`
  );

  if (ver_name === null || ver_name === '') {
    alert('版本名不能為空');
    return;
  }
  // 新增資料庫資料
  // TODO: 目前ver_img先寫死，可以用puppeteer截圖
  let note = {
    'user_id': user_id,
    'timestamp': Date.now(),
    'note_name': note_name,
    'file_name': file_name,
    'elements': $('#update-note-content').html(),
    'url': '',
    'ver_img': '123_coolthing_ver3.png',
    'ver_name': ver_name,
  };

  await axios({
    method: 'POST',
    url: '/api/1.0/note',
    data: note,
  });

  alert(`${note_name} 儲存成功!`);

  // 更新版本選擇的內容
  ver_info = await load_version();
  show_version(ver_info);
});

// 查找筆記內容 -------------------------------
$('#searchText').click(function () {
  // $('body').find('.highlight').removeClass('highlight');
  replaceText();
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

// TODO: 未完成
// 螢幕截圖 -----------------------------------
$('#screenShot').click(function () {
  var data =
    'data:image/svg+xml,' +
    "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='500'>" +
    "<foreignObject width='100%' height='100%'>" +
    "<div xmlns='http://www.w3.org/1999/xhtml' style='font-size:12px'>" +
    `<div class="contour-pick" style="background-image: url('https://goodtidy.s3.amazonaws.com/123_1662255937942.png'); width: 600px; height: 300px; clip-path: polygon(19% 20%, 12% 42%, 25% 43%); position: relative; left: 20px; top: 54px;"></div>` +
    // `<div style="background-image: url('https://goodtidy.s3.amazonaws.com/123_1662255937942.png');"></div>` +
    // `<div>aaa</div>` +
    `<div class="add_fonts ui-draggable ui-draggable-handle" contenteditable="true" style="position: relative; left: 93px; top: -1026px;">第三版</div>` +
    '</div>' +
    '</foreignObject>' +
    '</svg>';

  var img = new Image();

  img.src = data;

  img.onload = function () {
    console.log('aaa');
    ctx.drawImage(img, 0, 0);
  };

  // const one = new Image();
  // one.src = '../assets/no-bg_small.png';
  // const two = new Image();
  // two.src = '../assets/no-bg_test1.png';

  // function imgs(ctx) {
  //   one.onload = function () {
  //     ctx.drawImage(one, 50, 50);
  //   };
  //   two.onload = function () {
  //     ctx.drawImage(two, 100, 100);
  //   };
  // }

  // imgs(ctx);
});
