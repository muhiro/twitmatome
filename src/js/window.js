$(function() {
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

  $('.ProfileTweet-authorDetails').append('<a class="twitmatome-btn">まとめる</a>');
  $(document).on('DOMNodeInserted', function(e) {
    var element = e.target;
    $(element).find('.ProfileTweet-authorDetails').each(function() {
      $(this).append('<a class="twitmatome-btn">まとめる</a>');
    });
  });

  $(document).on('click', '.twitmatome-btn', function(e) {
    var a = $(this).parent('.ProfileTweet-authorDetails').find('.ProfileTweet-timestamp');
    console.log(a.prop('href'));
    var b = a.prop('href').split('/');
    chrome.runtime.sendMessage({type: constants.msg.matome
      ,key: [
        b[b.length - 1]
      ]
    }, function(response) {
    });
    $(this).addClass('twitmatome-btn-dis');
  });
});
