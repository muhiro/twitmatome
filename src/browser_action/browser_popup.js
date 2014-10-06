$(function() {
  var browserpopup = false;

  if (!(window.name)) {
    $('#browserpopup').hide();
  } else {
    $('#content').css('width', 'auto');
  }

  $('#r18').prop('checked', settings.config().get('r18'));
  $('#r18').bootstrapSwitch();
  $('#r18').on({
    'switchChange.bootstrapSwitch': function(event, state) {
      console.log(state);
      settings.config().set('r18', state);
    }
  });

  var twitlist = new Array();
  function checkTwitmatome() {
    chrome.runtime.sendMessage({type: constants.msg.check
      ,length: twitlist.length
    }, function(response) {
      if (response.list != undefined && response.list.length > 0) {
        var o = twitlist.length;
        var n = response.list.length;
        twitlist = response.list;
        var ss = '';
        for (var i = 0; i < n; i++) {
          ss += twitlist[i];
        }
        ss += '\r\n\r\n<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>';
        $('#twitlist').val(ss);
        $('#twit-block').html($('#twitlist').val());
        $('#twitlist').select();
      }
    });
    setTimeout(checkTwitmatome, 1000);
  };
  checkTwitmatome();



  chrome.runtime.sendMessage({type: constants.msg.saveResize
    ,screenX: window.screenX
    ,screenY: window.screenY
  });

  $(window).on('beforeunload', function(e) {
    chrome.runtime.sendMessage({type: constants.msg.close
      ,screenX: window.screenX
      ,screenY: window.screenY
    });
  });

  $('#twitlist').focus(function() {
    $(this).select();
  });
  $('#twitlist').click(function() {
    $(this).select();
    return false;
  });

  $('#clear').click(function() {
    twitlist = new Array();
    $('#twitlist').val('');
    chrome.runtime.sendMessage({type: constants.msg.clear});
  });

  $('#option').click(function() {
    window.open(
      '/options_custom/index.html',
      'options'
    );
    if (!(window.name)) {
      window.close();
    }
  });

});
