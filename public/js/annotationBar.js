$('.circle').click(function () {
  let spWidth = $('.sidepanel').width();
  let spMarginLeft = parseInt($('.sidepanel').css('margin-left'), 10);
  let w = spMarginLeft >= 0 ? spWidth * -1 : 0;
  let cw = w < 0 ? -w : spWidth - 22;
  $('.sidepanel').animate({
    marginLeft: w,
  });
  $('.sidepanel span').animate({
    marginLeft: w,
  });
  $('.circle').animate(
    {
      left: cw,
    },
    function () {
      $('.fa-chevron-left').toggleClass('hide');
      $('.fa-chevron-right').toggleClass('hide');
    }
  );
});
