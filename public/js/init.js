function drag_elements_init(div_append, note_elements) {
  // note_elements.length-1: 最後一個為最新版
  let elements = $.parseHTML(note_elements[note_elements.length - 1].elements);

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

    div_append.append(s);
  });
}
