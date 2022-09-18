let AutoSave = (function () {
  let timer = null;

  function getEditor() {
    let elems = $('#update-note-content').html();
    if (elems.length <= 0) return null;

    return elems;
  }

  function save() {
    let editor = getEditor();
    if (editor) {
      localStorage.setItem('AUTOSAVE_' + document.location, editor);
      let now_time = new Date().toISOString();
      // $('#auto-save-time').text(`已於${now_time}建立最新儲存`);
    }
  }

  function restore() {
    let saved = localStorage.getItem('AUTOSAVE_' + document.location);
    console.log(saved);
    return saved;
    // var editor = getEditor();
    // if (saved && editor) {
    //   editor.value = saved;
    // }
  }

  return {
    start: function () {
      let editor = getEditor();

      //   if (editor.value.length <= 0) restore();

      if (timer != null) {
        clearInterval(timer);
        timer = null;
      }

      timer = setInterval(save, 5000);
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
