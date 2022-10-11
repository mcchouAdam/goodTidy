// import { getImgElement, getTextElement } from './note.js';

const AutoSave = (function () {
  let timer = null;

  async function save() {
    const editor = $('#update-note-content').html();

    if (editor) {
      // 圖形擷取資訊
      let removeSrc_element = await getImgElement('note');
      let OCR_elements = await getTextElement();

      localStorage.setItem(
        `AUTOSAVEIMAGE_${current_note_id}`,
        removeSrc_element
      );
      localStorage.setItem('CURRENTNOTEID', current_note_id);
      localStorage.setItem(
        `AUTOSAVETEXT_${current_note_id}`,
        JSON.stringify(OCR_elements)
      );

      // 更新時間
      const current = new Date();
      const now_time = current.toLocaleTimeString();
      // $('#auto-save-time').text(`最新儲存: ${now_time}`);
    }
  }

  function restore(type) {
    // 清空原先的東西
    $('#update-note-content').html('');
    let saved_img_elements;
    let saved_text_elements;

    // 給自動儲存回復使用
    if (type == 'AUTOSAVE') {
      saved_img_elements = localStorage.getItem(
        `AUTOSAVEIMAGE_${current_note_id}`
      );
      saved_text_elements = localStorage.getItem(
        `AUTOSAVETEXT_${current_note_id}`
      );
      localStorage.setItem(
        `INITIALSAVEIMAGE_${current_note_id}`,
        saved_img_elements
      );
      localStorage.setItem(
        `INITIALSAVETEXT_${current_note_id}`,
        saved_text_elements
      );
      // 給上一步的最初始狀態使用
    } else if (type == 'INITIALSAVE') {
      saved_img_elements = localStorage.getItem(
        `INITIALSAVEIMAGE_${current_note_id}`
      );
      saved_text_elements = localStorage.getItem(
        `INITIALSAVETEXT_${current_note_id}`
      );
    }

    addDragImage($('#update-note-content'), saved_img_elements, 'draggable');
    const text_elements = JSON.parse(saved_text_elements);
    text_elements.map((e) => {
      addDragTextarea(
        '#update-note-content',
        e.text,
        e.width,
        e.height,
        e.textTop,
        e.textLeft,
        'draggable'
      );
    });
  }

  return {
    start() {
      if (timer != null) {
        clearInterval(timer);
        timer = null;
      }

      timer = setInterval(save, 1000);
    },

    stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    },
    restore,
  };
})();

// 進入note頁面後，抓取使用者最近編輯的筆記
async function getlatestNode() {
  current_note_id = localStorage.getItem('CURRENTNOTEID');

  if (!showNote_note_obj[current_note_id]) {
    return;
  }

  // 筆記編輯頁面上方連結
  const { note_name } = showNote_note_obj[current_note_id];
  note_bg = showNote_note_obj[current_note_id].note_file_name;
  const { note_classification } = showNote_note_obj[current_note_id];
  $('#click_note_classification').html(note_classification);
  $('#click_note_name').html(note_name);

  // 自動Reload
  AutoSave.restore('AUTOSAVE');

  // 打開自動儲存
  $('#autoSave-toggle').prop('checked', true);
  AutoSave.start();
}
