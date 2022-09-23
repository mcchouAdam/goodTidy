// TODO: 第一步會記不到
let step = 0; // 步驟變數
let initialObject = [];
let stepObject = []; // 需復原的物件

// // 復原的object要input的參數
// let stepDrag = function () {
//   stepAppend($(this), 'drag', $(this).css('top'), $(this).css('left'));
// };

// let stepInput = function () {
//   stepAppend(
//     $(this),
//     'input',
//     $(this).css('top'),
//     $(this).css('left'),
//     $(this).text()
//   );
// };

// let stepDelete = function () {
//   stepAppend(
//     $(this),
//     'delete',
//     $(this).css('top'),
//     $(this).css('left'),
//   );
// };

function stepAppend(item, event, top, left, val) {
  let obj;
  if (event === 'drag') {
    obj = {
      'item': item,
      'event': event,
      'top': top,
      'left': left,
    };
  } else if (event === 'input') {
    obj = {
      'item': item,
      'event': event,
      'val': val,
    };
  } else if (event === 'delete') {
    obj = {
      'item': item,
      'event': event,
      'top': top,
      'left': left,
    };
  }

  console.log('stepAppendObject:', obj);
  stepObject[step] = obj;
  step++;
}

// 上一步 -------------------------------------
prev.onclick = function () {
  if (step < 1) {
    alert('沒有上一步');
  } else {
    step--;
    let obj = stepObject[step - 1];
    console.log('上一步obj: ', obj);

    let item = obj.item;
    if (obj.event === 'drag') {
      item.style.top = obj.top;
      item.style.left = obj.left;
    } else if (obj.event === 'input') {
      item.text(obj.val);
    } else if (obj.event === 'delete') {
      console.log(item);
      $('#update-note-content').append(item);
      const restore_id = item.id;
      $('#' + restore_id).draggable({ containment: '#update-note-content' });
    }
  }
};

// 下一步 -------------------------------------
next.onclick = function () {
  if (step >= stepObject.length) {
    alert('沒有下一步');
  } else {
    step++;
    let obj = stepObject[step];
    let item = obj.item;
    if (obj.event === 'drag') {
      item.style.top = obj.top;
      item.style.left = obj.left;
    } else if (obj.event === 'input') {
      item.text(obj.val);
    } else if (obj.event === 'delete') {
      alert('刪除下一步');
    }
  }
};
