async function notePreClick() {
  // 點選預設筆記
  let currentNotes;
  let upload_note_id = localStorage.getItem('UPLOADNOTEID');

  // 從upload頁面跳轉進來，先點選上傳的筆記
  if (upload_note_id) {
    current_note_id = upload_note_id;
    $('#noteList_' + current_note_id)[0].click();
    current_note_class = showNote_note_obj[current_note_id].note_classification;
    $('#noteList_' + current_note_id).addClass('active');
    $('#noteClass_' + current_note_class)[0].click();

    localStorage.removeItem('UPLOADNOTEID');
  } else {
    if (showNote_note_obj) {
      currentNotes = Object.keys(showNote_note_obj);
    } else {
      currentNotes = [];
    }

    // 有存了一些筆記
    if (currentNotes.length > 0) {
      // 沒有current_note_id但有其他筆記，預設先點選第一篇筆記
      if (
        (current_note_id == 'undefined' || !current_note_id) &&
        currentNotes[0]
      ) {
        current_note_id = currentNotes[0];
        console.log('current_note_id', current_note_id);
        $('#noteList_' + current_note_id)[0].click();
      }
      //   console.log('current_note_id', current_note_id);
      //   console.log('showNote_note_obj', showNote_note_obj);
      current_note_class =
        showNote_note_obj[current_note_id].note_classification;
      $('#noteList_' + current_note_id).addClass('active');
      $('#noteClass_' + current_note_class)[0].click();
    }
  }

  // console.log('current_note_id', current_note_id);
  // console.log('showNote_note_obj', showNote_note_obj);

  // 完全沒有筆記
  if (
    (current_note_id == 'undefined' || !current_note_id) &&
    !currentNotes[0]
  ) {
    $('#noteUpload-btn').prop('disabled', false);
    $('#sharedNote-btn').prop('disabled', false);

    $('#storeNote').prop('disabled', true);
    $('#prev').prop('disabled', true);
    $('#addfont').prop('disabled', true);
    $('#deleteElement').prop('disabled', true);
    $('#shareToAllModal').prop('disabled', true);
    $('#annotation-show-btn').prop('disabled', true);
    $('#share-btn').prop('disabled', true);
    $('#search_note_list-btn').prop('disabled', true);

    Swal.fire({
      title: '您目前沒有筆記，請您先上傳筆記',
      icon: 'warning',
      showCancelButton: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: '確定',
    });
  } else {
    // 讀取完頁面後，將所有的按鍵打開
    $('#noteUpload-btn').prop('disabled', false);
    $('#storeNote').prop('disabled', false);
    $('#prev').prop('disabled', false);
    $('#addfont').prop('disabled', false);
    $('#deleteElement').prop('disabled', false);
    $('#shareToAllModal').prop('disabled', false);
    $('#annotation-show-btn').prop('disabled', false);
    $('#sharedNote-btn').prop('disabled', false);
    $('#share-btn').prop('disabled', false);
    $('#search_note_list-btn').prop('disabled', false);
  }
}
