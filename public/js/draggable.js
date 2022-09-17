function addDragTextarea(div_id, text, textTop, textLeft) {
  let new_offset = { top: textTop, left: textLeft };
  let new_width = 200;
  let new_height = 150;
  let timestamp = Date.now();
  let textarea_id = `${timestamp}_textarea`;
  let newElement = $(
    `<div class="div_addtextarea"><textarea id="${textarea_id}" class="addtextarea">${text}</textarea></div>`
  )
    .width(new_width)
    .height(new_height)
    .draggable({
      cancel: 'text',
      start: function () {
        $(`#${textarea_id}`).focus();
      },
      stop: function () {
        $(`#${textarea_id}`).focus();
      },
      containment: div_id,
    })
    .resizable()
    .css({
      'position': 'relative',
    })
    .offset(new_offset)
    .on('drag', stepDrag)
    .on('input', stepInput);
  // .on('input', checkTextNull);

  // 儲存所有textarea_id，以便取得更改值 .html()取不到
  OCR_ids.push(textarea_id);
  $(div_id).append(newElement);
}

function Textarea_draggable_html(
  div_id,
  text,
  width,
  height,
  textTop,
  textLeft
) {
  textLeft = +textLeft.replaceAll('px', '');
  textTop = +textTop.replaceAll('px', '');

  let new_offset = { top: textTop, left: textLeft };
  let new_width = width;
  let new_height = height;
  let timestamp = Date.now();
  let textarea_id = `${timestamp}_textarea`;
  let newElement = $(
    `<div class="div_addtextarea"><textarea id="${textarea_id}" class="addtextarea">${text}</textarea></div>`
  )
    .width(new_width)
    .height(new_height)
    .draggable({
      cancel: 'text',
      start: function () {
        $(`#${textarea_id}`).focus();
      },
      stop: function () {
        $(`#${textarea_id}`).focus();
      },
      containment: div_id,
    })
    .resizable()
    .css({
      'position': 'relative',
    })
    .offset(new_offset)
    .on('drag', stepDrag)
    .on('input', stepInput);
  // .on('input', checkTextNull);

  OCR_ids.push(textarea_id);

  return newElement;
}
