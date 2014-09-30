$(function() {
  setTimeout(function() {
    chrome.runtime.sendMessage({type: constants.msg.config
      ,key: [
        'r18'
      ]
    }, function(response) {
      if (response.r18) {
        $('title').text(message.fm.appnamer18);
      } else {
        $('title').text(message.fm.appname);
      }
    });
  },500);

//  /**
//   * 最初の画面サイズ調整
//   */
//  chrome.runtime.sendMessage({
//    type: constants.msg.popupResize,
//    init: true
//  });

//  $(window).on('beforeunload', function(e) {
//    setTimeout(function() {
//      $('.stream-item-header').append('<b>aaa</b>');
//    },1000);
//  });

  setTimeout(function() {
    $('.stream-item-header').append('<a class="twitmatome-btn">まとめる</a>');
  },1000);
  //https://syndication.twitter.com/tweets.json?ids=516688779411611648&lang=ja&callback=twttr.tfw.callbacks.cb0&suppress_response_codes=true

  $(document).on('click', '.twitmatome-btn', function(e) {
    alert('aaa');
  });
});
