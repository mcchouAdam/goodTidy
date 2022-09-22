// TODO: 加入延遲，不然會被塞爆
// TODO: 第一步會記不到

let step = 0; // 步驟變數
let initialObject = [];
let stepObject = []; // 需復原的物件

// 復原的object要input的參數
let stepDrag = function () {
  stepAppend($(this), 'drag', $(this).css('top'), $(this).css('left'));
};

let stepInput = function () {
  stepAppend(
    $(this),
    'input',
    $(this).css('top'),
    $(this).css('left'),
    $(this).text()
  );
};

let stepDelete = function () {
  stepAppend(
    $(this),
    'delete',
    $(this).css('top'),
    $(this).css('left'),
    $(this).html()
  );
};

function stepAppend(item, event, top, left, val) {
  step++;
  let obj;
  if (event === 'drag') {
    obj = {
      'item': item,
      'event': 'drag',
      'top': top,
      'left': left,
    };
  } else if (event === 'input') {
    obj = {
      'item': item,
      'event': 'input',
      'val': val,
    };
  } else if (event === 'delete') {
    obj = {
      'item': item,
      'event': 'delete',
      'top': top,
      'left': left,
      'element_html': element_html,
    };
  }
  stepObject.push(obj);
}

// 上一步 -------------------------------------
prev.onclick = function () {
  if (step < 1) {
    alert('沒有上一步');
  } else {
    step--;
    let obj = stepObject[step - 1];
    let item = obj.item;
    if (obj.event === 'drag') {
      item.css({ left: obj.left });
      item.css({ top: obj.top });
    } else if (obj.event === 'input') {
      item.text(obj.val);
    } else if (obj.event === 'delete') {
      alert('刪除上一步');
    }
  }
};

// 下一步 -------------------------------------
next.onclick = function () {
  if (step >= stepObject.length) {
    alert('沒有下一步');
  } else {
    step++;
    let obj = stepObject[step - 1];
    let item = obj.item;
    if (obj.event === 'drag') {
      item.css({ left: obj.left });
      item.css({ top: obj.top });
    } else if (obj.event === 'input') {
      item.text(obj.val);
    } else if (obj.event === 'delete') {
      alert('刪除下一步');
    }
  }
};
