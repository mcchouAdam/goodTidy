// function elements_init(div_append, note_elements) {
//   let elements = $.parseHTML(note_elements);
//   let img_background = `${S3_HOST}notes/${note_bg}`;

//   elements.map((s) => {
//     // 置換image background
//     // TODO: elements_init: 連文字方塊也置換到了
//     $(s).find('img').attr('src', img_background);
//     // console.log($(s).find('img'));

//     div_append.append(s);
//   });
//   $('.contour-pic.ui-draggable.ui-draggable-handle')
//     .draggable({
//       containment: '#update-note-content',
//     })
//     .on('drag', stepDrag);
//   // $('.ui-draggable.ui-draggable-handle.ui-resizable')
//   //   .draggable({ containment: '#update-note-content' })
//   //   .on('drag', stepDrag)
//   //   .on('input', stepInput);
// }

// function noteShow_elements_init(div_append, note_elements) {
//   let elements = $.parseHTML(note_elements);
//   let img_background = `${S3_HOST}notes/${note_bg}`;

//   elements.map((s) => {
//     // 置換image background
//     // TODO: elements_init: 連文字方塊也置換到了
//     $(s).find('img').attr('src', img_background);
//     // console.log($(s).find('img'));
//     const textarea_id = $(s).find('.addtextarea').attr('id');
//     // console.log(textarea_id);
//     if (textarea_id) {
//       console.log(textarea_id);
//       console.log($('textarea.addtextarea'));
//       $('textarea.addtextarea')
//         .draggable({
//           cancel: 'text',
//           start: function () {
//             $(`#${textarea_id}`).focus();
//           },
//           stop: function () {
//             $(`#${textarea_id}`).focus();
//           },
//           containment: '#update-note-content',
//         })
//         .resizable()
//         .on('drag', stepDrag)
//         .on('input', stepInput);
//     }

//     // console.log($(s).find('.addtextarea').attr('id'));
//     div_append.append(s);
//   });
//   $('.contour-pic.ui-draggable.ui-draggable-handle')
//     .draggable({
//       containment: '#update-note-content',
//     })
//     .on('drag', stepDrag);

//   // .draggable({
//   //   cancel: 'text',
//   //   start: function () {
//   //     $(`#${textarea_id}`).focus();
//   //   },
//   //   stop: function () {
//   //     $(`#${textarea_id}`).focus();
//   //   },
//   //   containment: '#update-note-content',
//   // })
//   // .resizable()
//   // .on('drag', stepDrag)
//   // .on('input', stepInput);

//   $('.OCR_fonts')
//     .draggable({ containment: '#update-note-content' })
//     .on('drag', stepDrag)
//     .on('input', stepInput);
// }

function Img_draggable_arr(note_Imgcontent) {
  let Img_elements = [];
  let elements = $.parseHTML(note_Imgcontent);
  let img_background = `${S3_HOST}notes/${note_bg}`;

  elements.map((s) => {
    $(s).find('img').attr('src', img_background);
    Img_elements.push(s);
  });

  return Img_elements;
}

function text_elements_arr(append_div, note_textContent) {
  let text_elements = [];
  if (!note_textContent) {
    return [];
  }

  note_textContent.map((s) => {
    const element = Textarea_draggable_html(
      append_div,
      s.text,
      s.width,
      s.height,
      s.textTop,
      s.textLeft
    );
    text_elements.push(element);
  });
  return text_elements;
}

function elements_init($note_div, Img_elements, text_elements) {
  let elements = Img_elements.concat(text_elements);
  elements.map((e) => {
    $note_div.append(e);
  });
}
