// 打開查找筆記List
$('#search_note_list-btn').click(() => {
  showSearchList(note_list_obj, $('#modal-main'));
});

// 查找筆記List內容 -------------------------
$('#search_note_list').on('input', async () => {
  await clearSearchHighlight();
  await search_note($('#search_note_list').val(), search_note_list_obj);
});

$('#search_note-btn').click(async () => {
  await clearSearchHighlight();
  await search_note($('#search_note_list').val(), search_note_list_obj);
});

// [func] 查找note
async function search_note(search_text, search_obj) {
  if (search_text === '') return;
  Object.keys(search_obj).map(async (key) => {
    const text = search_obj[key];
    const pattern = new RegExp(search_text, 'i');
    const result = text.match(pattern);
    if (result) {
      await markSearchText(key);
    }
  });
}

// [func] 刪除查找標記
async function clearSearchHighlight() {
  $('#modal-main').find('.searchHighlight').removeClass('searchHighlight');
}

// 標記查找的note
async function markSearchText(searchPattern) {
  const custfilter = new RegExp(searchPattern, 'ig');
  const repstr = `<span class='searchHighlight'>${searchPattern}</span>`;

  if (searchPattern != '') {
    $('#modal-main').each(function () {
      $(this).html($(this).html().replace(custfilter, repstr));
    });
  } else {
    await clearSearchHighlight();
  }
}
