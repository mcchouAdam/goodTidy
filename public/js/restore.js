// TODO: 拖曳的上一步
let step = 1; // 步驟變數
let last_step = step;
const initialObject = [];
const stepObject = []; // 需復原的物件

function stepAppend(restoreObj) {
  // console.log('stepAppendObject:', restoreObj);
  stepObject[step] = restoreObj;
  // console.log('此物件step: ', step);
  step++;
  last_step = step;
  // console.log('目前step: ', step);
  // console.log('最後一步step: ', last_step);
}

// 上一步 -------------------------------------
prev.onclick = function () {
  step--;
  // console.log('上一步step:', step);
  let obj = stepObject[step];
  // console.log('上一步obj: ', obj);

  if (step < 0) {
    AutoSave.restore('INITIALSAVE');
    step = 0;
    return;
  }

  if (!obj) {
    return;
  }

  switch (obj.event) {
    // case 'drag':
    //   if (step - 1 === 0) {
    //     AutoSave.restore('INITIALSAVE');
    //   }
    //   item = stepObject[step - 1].item;
    //   obj = stepObject[step - 1];

    //   item.style.top = obj.top;
    //   item.style.left = obj.left;
    //   break;

    // case 'input':
    //   // obj = stepObject[step];
    //   if (!obj) break;
    //   obj.item.val(obj.val);
    //   break;

    case 'delete':
      const restore_id = obj.item.id;
      console.log('restore_id', restore_id);
      if (restore_id.split('_')[1] === 'contour-pic') {
        $('#update-note-content').append(obj.item);
        $(`#${restore_id}`).draggable({
          containment: '#update-note-content',
        });
      } else {
        addDragTextarea(
          $('#update-note-content'),
          obj.val,
          obj.width,
          obj.height,
          obj.top,
          obj.left,
          'draggable'
        );
      }
      break;
  }
};
