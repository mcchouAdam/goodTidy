function drag_elements_init(div_append, note_elements) {
  // note_elements.length-1: 最後一個為最新版
  let elements = $.parseHTML(note_elements[note_elements.length - 1].elements);
  file_name = note_elements[note_elements.length - 1].file_name;
  let img_background = `${s3_HOST}${
    note_elements[note_elements.length - 1].file_name
  }`;

  elements.map((s) => {
    // 置換掉blob網址
    $(s).contents().attr('src', `${img_background}`);
    div_append.append(s);
  });
  $('.contour-pic.ui-draggable.ui-draggable-handle').draggable({
    containment: '#update-note-content',
  });
  $('.add_fonts').draggable({ containment: '#update-note-content' });
  $('.OCR_fonts').draggable({ containment: '#update-note-content' });
}
