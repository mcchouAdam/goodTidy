$('.circle').click(() => {
  const spWidth = $('.sidepanel').width();
  const spMarginLeft = parseInt($('.sidepanel').css('margin-left'), 10);
  const w = spMarginLeft >= 0 ? spWidth * -1 : 0;
  const cw = w < 0 ? -w : spWidth - 22;
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
    () => {
      $('.fa-chevron-left').toggleClass('hide');
      $('.fa-chevron-right').toggleClass('hide');
    }
  );
});
