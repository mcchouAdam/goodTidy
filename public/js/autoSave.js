let AutoSave = (function () {
  let timer = null;

  function save() {
    let editor = $('#update-note-content').html();
    if (editor) {
      // 圖形擷取資訊
      let contourImg_count = $('.contour-pic').length;
      let element_html = '';
      for (let i = 0; i < contourImg_count; i++) {
        element_html += $('.contour-pic').get(i).outerHTML;
      }

      // 文字擷取
      const text_elements = $('.div_addtextarea');

      let text_elements_arr = [];
      text_elements.map((i, e) => {
        let obj = {};
        const OCR_top = e.style.top;
        const OCR_left = e.style.left;
        const OCR_width = e.style.width;
        const OCR_height = e.style.height;
        const OCR_text = e.firstChild.value;
        obj = {
          'OCR_top': OCR_top,
          'OCR_left': OCR_left,
          'OCR_width': OCR_width,
          'OCR_height': OCR_height,
          'OCR_text': OCR_text,
        };
        text_elements_arr.push(obj);
      });

      localStorage.setItem('AUTOSAVEIMAGE_' + current_note_id, element_html);
      localStorage.setItem('CURRENTNOTEID', current_note_id);
      localStorage.setItem(
        'AUTOSAVETEXT_' + current_note_id,
        JSON.stringify(text_elements_arr)
      );

      // 更新時間
      let now_time = timeConverter(new Date());
      $('#auto-save-time').text(`已於${now_time}建立最新儲存`);
    }
  }

  function restore() {
    // 清空原先的東西
    $('#update-note-content').html('');
    let saved_img_elements = localStorage.getItem(
      'AUTOSAVEIMAGE_' + current_note_id
    );
    let saved_text_elements = localStorage.getItem(
      'AUTOSAVETEXT_' + current_note_id
    );

    // 圖形render draggable
    $('#update-note-content').append(saved_img_elements);
    $('.contour-pic')
      .draggable({
        containment: '#update-note-content',
      })
      .css('position', 'absolute')
      .on('drag', stepDrag);

    // 文字draggable
    let text_elements = JSON.parse(saved_text_elements);

    let element_count = text_elements.length;
    for (let i = 0; i < element_count; i++) {
      let textLeft = +text_elements[i].OCR_left.replaceAll('px', '');
      let textTop = +text_elements[i].OCR_top.replaceAll('px', '');
      let text = text_elements[i].OCR_text;

      let new_offset = { top: textTop, left: textLeft };
      let new_width = +text_elements[i].OCR_width.replaceAll('px', '');
      let new_height = +text_elements[i].OCR_height.replaceAll('px', '');
      let timestamp = Date.now();
      let textarea_id = timestamp + '_textarea';
      console.log(new_offset, new_width, new_height, timestamp, textarea_id);
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
          containment: '#update-note-content',
        })
        .resizable()
        .css({
          'position': 'absolute',
        })
        .offset(new_offset)
        .on('drag', stepDrag)
        .on('input', stepInput);

      $('#update-note-content').append(newElement);
    }
  }

  return {
    start: function () {
      if (timer != null) {
        clearInterval(timer);
        timer = null;
      }

      timer = setInterval(save, 2000);
    },

    stop: function () {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    },
    restore,
  };
})();

const timeConverter = (date) => {
  dataValues = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ];
  let timeFormat = `${date.getFullYear()}/${
    date.getMonth() + 1
  }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  return timeFormat;
};

// 進入note頁面後，抓取使用者最近編輯的筆記
async function getlatestNode() {
  let note_id = localStorage.getItem('CURRENTNOTEID');
  await noteShow(note_id, $('#update-note-content'));
}
