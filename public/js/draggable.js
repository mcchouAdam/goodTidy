// 新增draggable textarea -----------------------------
function addDragTextarea(
  div_id,
  text,
  textWidth,
  textHeight,
  textTop,
  textLeft,
  dragType
) {
  textLeft = +textLeft.replaceAll('px', '');
  textTop = +textTop.replaceAll('px', '');

  const new_offset = {
    top: textTop,
    left: textLeft,
  };

  const new_width = textWidth;
  const new_height = textHeight;
  const timestamp = Date.now();
  const textarea_id = `${timestamp}_textarea`;
  text = text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');

  const newElement = $(
    `<div class="div_addtextarea">
      <textarea id="${textarea_id}" class="addtextarea" placeholder="新增文字方塊">${text}</textarea>
      <label style="display:none;" class="textareaClose" onclick="javascript:deleteNoteElement('textarea','${textarea_id}');">X</label>
    </div>`
  )
    .width(new_width)
    .height(new_height)
    .css({
      position: 'absolute',
    })
    .offset(new_offset);

  if (dragType === 'draggable') {
    newElement
      .draggable({
        cancel: 'text',
        start() {
          $(`#${textarea_id}`).focus();
        },
        stop() {
          $(`#${textarea_id}`).focus();
        },
        containment: div_id,
      })
      .resizable();

    $(div_id).append(newElement);
  } else {
    $(div_id).append(newElement);
    $(`#${textarea_id}`).prop('disabled', true);
  }

  $(div_id).append(newElement);
}

// 新增draggable image -----------------------------
function addDragImage(append_div, note_Imgcontent, drag_type) {
  const elements = $.parseHTML(note_Imgcontent);
  const img_background = `${S3_HOST}notes/${note_bg}`;

  elements.map((s) => {
    $(s).find('img').attr('src', img_background);
    append_div.append(s);
  });

  if (drag_type === 'draggable') {
    $('.contour-pic')
      .draggable({ containment: append_div })
      .css('position', 'absolute');
  }
}
