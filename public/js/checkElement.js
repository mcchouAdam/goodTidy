// TODO: Check文字框是空的 直接刪除

let checkTextNull = function () {
  const text = $(this).find('p').html();
  if (text == '<br>') {
    // $(this).remove();
  }
};
