// TODO: Check文字框是空的 直接刪除

const checkTextNull = function () {
  const text = $(this).find('p').html();
  if (text == '<br>') {
    // $(this).remove();
  }
};
