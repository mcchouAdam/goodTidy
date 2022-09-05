function replaceText() {
  $('body').find('.highlight').removeClass('highlight');
  var searchword = $('#notename-search').val();

  var custfilter = new RegExp(searchword, 'ig');
  var repstr = "<span class='highlight'>" + searchword + '</span>';

  if (searchword != '') {
    $('#update-note-content').each(function () {
      $(this).html($(this).html().replace(custfilter, repstr));
      $(this).children().draggable({
        containment: '#update-note-content',
      });
    });
  }
}
