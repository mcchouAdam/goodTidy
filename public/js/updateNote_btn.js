// TODO: 目前user_id, note_id, s3_HOST寫死

let alldragObject = [];
let user_id = 123;
let note_id = 1;
let note_name = '酷東西';
let s3_HOST = 'https://goodtidy.s3.amazonaws.com/';
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

    // editPageElements 初始化 --------------------
    // note_elements.length-1: 最後一個元素為最新版
    let elements = $.parseHTML(
      note_elements[note_elements.length - 1].elements
    );

    file_name = note_elements[note_elements.length - 1].file_name;

    elements.map((s) => {
      // 有圖形的需置換掉background blob的url
      if (s.style['background-image']) {
        s.style['background-image'] = `url('${s3_HOST}${
          note_elements[note_elements.length - 1].file_name
        }')`;
      }

      $('.contour-pick').draggable();
      $('.add_fonts').draggable();
      $('.OCR_fonts').draggable();

      $note_content.append(s);
    });

    // // 上一步/下一步
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
    .draggable();
  $('.update-note-content').append(item);
});

// 儲存鍵 --------------------------------------
$('#storeNote').click(async function () {
  // TODO: 比較這次與前一次element的差別
  // diff(prev_version_note, $('#update-note-content').html())

  // 新增資料庫資料
  let note = {
    'user_id': user_id,
    'note_name': note_name,
    'file_name': file_name,
    'elements': $('#update-note-content').html(),
  };

  await axios({
    method: 'POST',
    url: '/api/1.0/note',
    data: note,
  });

  alert(`${note_name} 儲存成功!`);
});

// 查找筆記內容 ---------------------------------------------------------
$('#searchText').click(function () {
  // $('body').find('.highlight').removeClass('highlight');
  replaceText();
});
