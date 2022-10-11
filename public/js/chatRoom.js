$(document).ready(function () {
  var preloadbg = document.createElement('img');
  preloadbg.src =
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/timeline1.png';

  $('#searchfield').focus(function () {
    if ($(this).val() == 'Search contacts...') {
      $(this).val('');
    }
  });
  $('#searchfield').focusout(function () {
    if ($(this).val() == '') {
      $(this).val('Search contacts...');
    }
  });

  $('#sendmessage input').focus(function () {
    if ($(this).val() == 'Send message...') {
      $(this).val('');
    }
  });
  $('#sendmessage input').focusout(function () {
    if ($(this).val() == '') {
      $(this).val('Send message...');
    }
  });

  $('.friend').each(function () {
    $(this).click(function () {
      var childOffset = $(this).offset();
      var parentOffset = $(this).parent().parent().offset();
      var childTop = childOffset.top - parentOffset.top;
      var clone = $(this).find('img').eq(0).clone();
      var top = childTop + 12 + 'px';

      $(clone).css({ 'top': top }).addClass('floatingImg').appendTo('#chatbox');

      setTimeout(function () {
        $('#profile p').addClass('animate');
        $('#profile').addClass('animate');
      }, 100);
      setTimeout(function () {
        $('#chat-messages').addClass('animate');
        $('.cx, .cy').addClass('s1');
        setTimeout(function () {
          $('.cx, .cy').addClass('s2');
        }, 100);
        setTimeout(function () {
          $('.cx, .cy').addClass('s3');
        }, 200);
      }, 150);

      $('.floatingImg').animate(
        {
          'width': '68px',
          'left': '108px',
          'top': '20px',
        },
        200
      );

      var name = $(this).find('p strong').html();
      var email = $(this).find('p span').html();
      $('#profile p').html(name);
      $('#profile span').html(email);

      $('.message').not('.right').find('img').attr('src', $(clone).attr('src'));
      $('#friendslist').fadeOut();
      $('#chatview').fadeIn();

      $('#close')
        .unbind('click')
        .click(function () {
          $('#chat-messages, #profile, #profile p').removeClass('animate');
          $('.cx, .cy').removeClass('s1 s2 s3');
          $('.floatingImg').animate(
            {
              'width': '40px',
              'top': top,
              'left': '12px',
            },
            200,
            function () {
              $('.floatingImg').remove();
            }
          );

          setTimeout(function () {
            $('#chatview').fadeOut();
            $('#friendslist').fadeIn();
          }, 50);
        });
    });
  });
});

async function displayChatRoom(user_email, user_name) {
  const chatRoomHtml = `
    <div id="chatbox">
      <div id="friendslist">
        <div id="topmenu">
          <span class="friends"></span>
          <span class="chats"></span>
        </div>
        <div id="friends">
          <div class="friend">
            <img
              src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg"
            />
            <p>
              <strong>Miro Badev</strong>
              <span>mirobadev@gmail.com</span>
            </p>
            <div class="status available"></div>
          </div>

          <div class="friend">
            <img
              src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/2_copy.jpg"
            />
            <p>
              <strong>Martin Joseph</strong>
              <span>marjoseph@gmail.com</span>
            </p>
            <div class="status away"></div>
          </div>

          <div class="friend">
            <img
              src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/3_copy.jpg"
            />
            <p>
              <strong>Tomas Kennedy</strong>
              <span>tomaskennedy@gmail.com</span>
            </p>
            <div class="status inactive"></div>
          </div>

          <div class="friend">
            <img
              src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/4_copy.jpg"
            />
            <p>
              <strong>Enrique Sutton</strong>
              <span>enriquesutton@gmail.com</span>
            </p>
            <div class="status inactive"></div>
          </div>

          <div class="friend">
            <img
              src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/5_copy.jpg"
            />
            <p>
              <strong> Darnell Strickland</strong>
              <span>darnellstrickland@gmail.com</span>
            </p>
            <div class="status inactive"></div>
          </div>

          <div id="search">
            <input type="text" id="searchfield" value="Search contacts..." />
          </div>
        </div>
      </div>

      <div id="chatview" class="p1">
        <div id="profile">
          <div id="close">
            <div class="cy"></div>
            <div class="cx"></div>
          </div>

          <p>Miro Badev</p>
          <span>miro@badev@gmail.com</span>
        </div>
        <div id="chat-messages">
          <label>Thursday 02</label>

          <div class="message">
            <img
              src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg"
            />
            <div class="bubble">
              Really cool stuff!
              <div class="corner"></div>
              <span>3 min</span>
            </div>
          </div>

          <div class="message right">
            <img
              src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/2_copy.jpg"
            />
            <div class="bubble">
              Can you share a link for the tutorial?
              <div class="corner"></div>
              <span>1 min</span>
            </div>
          </div>

          <div class="message">
            <img
              src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg"
            />
            <div class="bubble">
              Yeah, hold on
              <div class="corner"></div>
              <span>Now</span>
            </div>
          </div>

          <div class="message right">
            <img
              src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/2_copy.jpg"
            />
            <div class="bubble">
              Can you share a link for the tutorial?
              <div class="corner"></div>
              <span>1 min</span>
            </div>
          </div>

          <div class="message">
            <img
              src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg"
            />
            <div class="bubble">
              Yeah, hold on
              <div class="corner"></div>
              <span>Now</span>
            </div>
          </div>
        </div>

        <div id="sendmessage">
          <input type="text" value="Send message..." />
          <button id="send"></button>
        </div>
      </div>
    </div>
    `;

  // 聊天室展開按鈕 ----------------
  if ($('#chatroom-div').html() === '') {
    $('#chatroom-div').append(chatRoomHtml);
  } else {
    $('#chatroom-div').html('');
  }
}
