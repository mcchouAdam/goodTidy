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
      'position': 'absolute',
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
      'position': 'absolute',
    })
    .offset(new_offset)
    .on('drag', stepDrag)
    .on('input', stepInput);
  // .on('input', checkTextNull);

  OCR_ids.push(textarea_id);

  return newElement;
}

function textarea_nondraggable_html(
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
    .css({
      'position': 'absolute',
    })
    .offset(new_offset);

  return newElement;
}

function Img_elements_arr(note_Imgcontent) {
  let Img_elements = [];
  let elements = $.parseHTML(note_Imgcontent);
  let img_background = `${S3_HOST}notes/${note_bg}`;

  elements.map((s) => {
    $(s).find('img').attr('src', img_background);
    Img_elements.push(s);
  });

  return Img_elements;
}

//draggable 文字方塊
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

// Textarea只畫出來，不可以拖動
function textarea_nondraggable_arr(append_div, note_textContent) {
  let text_elements = [];
  if (!note_textContent) {
    return [];
  }

  note_textContent.map((s) => {
    const element = textarea_nondraggable_html(
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

function elements_init(append_div, Img_elements, text_elements) {
  let elements = Img_elements.concat(text_elements);
  elements.map((e) => {
    append_div.append(e);
  });
}
