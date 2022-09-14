function addDragTextarea(div_id, text) {
  //   let new_offset = { top: 30, left: 40 };
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
      // 'background-color': 'yellow',
      // 'border-color': 'black',
      // 'border-width': '1px',
      // 'border-style': 'solid',
    })
    .on('drag', stepDrag)
    .on('input', stepInput)
    .on('input', checkTextNull);
  // .offset(new_offset);

  $(div_id).append(newElement);
}
