// 查找筆記List內容 -------------------------
$('#search_note_list').change(() => {
  // 清空搜尋標記
  $('#modal-main').find('.searchHighlight').removeClass('searchHighlight');

  Object.keys(search_note_list_obj).map((key) => {
    const text = search_note_list_obj[key];
    const search_text = $('#search_note_list').val();
    if (search_text) {
      const pattern = new RegExp(search_text, 'i');
      const result = text.match(pattern);
      if (result) {
        markSearchText(key);
      }
    }
  });
});

$('#search_note_list-btn').click(() => {
  showSearchList(note_list_obj, $('#modal-main'));
  // $('input[name="daterange"]').daterangepicker();
});

// mark search_note_list
function markSearchText(match) {
  const searchword = match;

  const custfilter = new RegExp(searchword, 'ig');
  const repstr = `<span class='searchHighlight'>${searchword}</span>`;

  if (searchword != '') {
    $('#modal-main').each(function () {
      $(this).html($(this).html().replace(custfilter, repstr));
    });
  } else {
    $('#modal-main').find('.searchHighlight').removeClass('searchHighlight');
  }
}
