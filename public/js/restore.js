// TODO: 第一步會記不到
let step = 1; // 步驟變數
let last_step = step;
const initialObject = [];
const stepObject = []; // 需復原的物件

function stepAppend(item, event, top, left, val) {
  let obj;
  if (event === 'drag') {
    obj = {
      item,
      event,
      top,
      left,
    };
  } else if (event === 'input') {
    obj = {
      item,
      event,
      val,
    };
  } else if (event === 'delete') {
    obj = {
      item,
      event,
      top,
      left,
      val,
    };
  }

  console.log('stepAppendObject:', obj);
  stepObject[step] = obj;
  console.log('此物件step: ', step);
  step++;
  last_step = step;
  console.log('目前step: ', step);
  console.log('最後一步step: ', last_step);
}

// 上一步 -------------------------------------
prev.onclick = function () {
  if (step == 0) {
    AutoSave.restore('INITIALSAVE');
  } else {
    step--;
    console.log('上一步step:', step);
    let obj = stepObject[step];
    console.log('上一步obj: ', obj);

    let { item } = obj;
    if (obj.event === 'drag') {
      // input上一個記到的是最新的狀態，所以要在上一步
      if (step - 1 == 0) {
        AutoSave.restore('INITIALSAVE');
      }
      item = stepObject[step - 1].item;
      obj = stepObject[step - 1];

      item.style.top = obj.top;
      item.style.left = obj.left;
    } else if (obj.event === 'input') {
      // input上一個記到的是最新的狀態，所以要在上一步
      if (step - 1 == 0) {
        AutoSave.restore('INITIALSAVE');
      }
      obj = stepObject[step - 1];

      item.val(obj.val);
    } else if (obj.event === 'delete') {
      const restore_id = item.id;
      if (restore_id.split('_')[1] === 'contour-pic') {
        $('#update-note-content').append(item);
        $(`#${restore_id}`).draggable({ containment: '#update-note-content' });
      } else {
        // 文字需另外處理才能draggable
        const top = +obj.top.replaceAll('px', '');
        const left = +obj.left.replaceAll('px', '');
        addDragTextarea($('#update-note-content'), obj.val, top, left);
      }
    }
  }
};

// 下一步 -------------------------------------
// next.onclick = function () {
//   //TODO: 做前一步相反的事
//   if (step > last_step) {
//     Swal.fire('沒有下一步');
//   } else if (step == last_step) {
//     // 最後一步為最新狀態
//     AutoSave.restore();
//   } else {
//     step++;
//     let obj = stepObject[step];
//     let item = obj.item;
//     if (obj.event === 'drag') {
//       item.style.top = obj.top;
//       item.style.left = obj.left;
//     } else if (obj.event === 'input') {
//       item.text(obj.val);
//     } else if (obj.event === 'delete') {
//       Swal.fire('刪除下一步');
//     }
//   }
// };
