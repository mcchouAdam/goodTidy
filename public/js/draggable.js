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

  const new_offset = {
    top: textTop,
    left: textLeft,
  };
  const new_width = width;
  const new_height = height;
  const timestamp = Date.now();
  const textarea_id = `${timestamp}_textarea`;
  const text_jsInjection = text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');

  const newElement = $(
    `<div class="div_addtextarea"><textarea id="${textarea_id}" class="addtextarea">${text_jsInjection}</textarea></div>`
  )
    .width(new_width)
    .height(new_height)
    .css({
      position: 'absolute',
    })
    .offset(new_offset);

  return newElement;
}

function Img_elements_arr(note_Imgcontent) {
  const Img_elements = [];
  const elements = $.parseHTML(note_Imgcontent);
  const img_background = `${S3_HOST}notes/${note_bg}`;

  elements.map((s) => {
    $(s).find('img').attr('src', img_background);
    Img_elements.push(s);
  });

  return Img_elements;
}

// draggable 文字方塊
function text_elements_arr(append_div, note_textContent) {
  const text_elements = [];
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
  const text_elements = [];
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
  const elements = Img_elements.concat(text_elements);
  elements.map((e) => {
    append_div.append(e);
  });
}
