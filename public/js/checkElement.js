let checkTextNull = function () {
  const text = $(this).find('p').html();
  if (text == '<br>') {
    $(this).remove();
  }
};
