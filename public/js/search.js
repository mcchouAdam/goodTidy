// function replaceText() {
//   $('body').find('.highlight').removeClass('highlight');
//   var searchword = $('#notename-search').val();

//   var custfilter = new RegExp(searchword, 'ig');
//   var repstr = "<span class='highlight'>" + searchword + '</span>';

//   if (searchword != '') {
//     $('#update-note-content').each(function () {
//       $(this).html($(this).html().replace(custfilter, repstr));
//       $(this).children().draggable({
//         containment: '#update-note-content',
//       });
//     });
//   }
// }

// 查找筆記List內容 -------------------------
$('#search_note_list').keydown(function () {
  // 清空搜尋標記
  $('#modal-main').find('.highlight').removeClass('highlight');

  Object.keys(search_note_list_obj).map((key) => {
    const text = search_note_list_obj[key];
    const search_text = $('#search_note_list').val();
    if (search_text) {
      const pattern = new RegExp(search_text, 'i');
      let result = text.match(pattern);
      // console.log(result);
      if (result) {
        console.log(result);
        markSearchText(key);
        console.log(key);
      }
    }
  });
});

$('#search_note_list-btn').click(function () {
  showSearchList(note_list_obj, $('#modal-main'));
  $('input[name="daterange"]').daterangepicker();
});

// mark search_note_list
function markSearchText(match) {
  var searchword = match;

  var custfilter = new RegExp(searchword, 'ig');
  var repstr = "<span class='highlight'>" + searchword + '</span>';

  if (searchword != '') {
    $('#modal-main').each(function () {
      $(this).html($(this).html().replace(custfilter, repstr));
    });
  } else {
    $('#modal-main').find('.highlight').removeClass('highlight');
  }
}
