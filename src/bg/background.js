var aigisWidget = aigisWidget || {};
(function() {
  'use strict';
  var aigispopup = null;
  var badgestatus = 1;
  var twitlist = new Array();

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('RECEIVE:'+request.type);
    switch(request.type) {

      case constants.msg.config:
        //var response = {config: settings};
        var response = {};
        for (var i = 0; i < request.key.length; i ++) {
          response[request.key[i]] = settings.config().get(request.key[i]);
        }
        sendResponse(response);
        break;

      case constants.msg.notice:
        aigisWidget.notice.create(request.noticeid, request.args);
        break;

      case constants.msg.badge:
        var value = '';
        var nextmodified = null;
        var sysdate = new Date();
        if (badgestatus == 0) {
          value = String(aigisWidget.status().get('nowVitality'));
          nextmodified = new Date(aigisWidget.status().get('lastmodifiedVitality'));
          nextmodified.setMinutes(nextmodified.getMinutes() + 3);
        } else {
          value = String(aigisWidget.status().get('nowStamina'));
          nextmodified = new Date(aigisWidget.status().get('lastmodifiedStamina'));
          nextmodified.setMinutes(nextmodified.getMinutes() + 60);
        }
        if ( (value !== undefined) && (nextmodified > sysdate) ) {
          //更新がされているとしてbadgeを描画
          chrome.browserAction.setBadgeText({text: value});
        }
        //badgestatus = (badgestatus === 1) ? 0 : 1;
        break;

      case constants.msg.popup:
        //ツールバーは72
        aigispopup = window.open(
          '../browser_action/browser_popup.html',
          'dashbord',
            'width=570' +
            ',height=920' +
            ',left=' + settings.status().get('screenX') +
            ',top=' + settings.status().get('screenY') +
            ',location=no' +
            ',menubar=no' +
            ',toolbar=no' +
            ',status=no' +
            ',scrollbars=no' +
            ',resizable=no'
        );
        aigispopup.focus();
        break;
      case constants.msg.popupResize:
        //console.log("%s:%s", sender.tab.windowId, request.type);
        if ( (settings.config().get('widgetResize') ) || (request.init) ) {
          chrome.windows.get(sender.tab.windowId, function (mainwin) {
            var wdiff = (constants.popup.width - sender.tab.width);
            var hdiff = (constants.popup.height - sender.tab.height);

            if ((wdiff != 0 && wdiff > -100 && wdiff < 100) || (hdiff != 0 && hdiff > -100 && hdiff < 100)) {
              var updateWindow = {
                width: mainwin.width + (constants.popup.width - sender.tab.width),
                height: mainwin.height + (constants.popup.height - sender.tab.height)
              };
              //console.log("%s,%s", updateWindow.width, updateWindow.height);
              chrome.windows.update(mainwin.id, updateWindow, function (nWin) {
              });
            }
          });
        }
        break;

      case constants.msg.capture:
        //console.log('%d:%d', sender.tab.windowId, request.type);
        //console.log('capture format:%s', settings.config().get("format"));
        aigisWidget.notice.create(constants.notice.captureStart);
//        chrome.windows.get(sender.tab.windowId, function (capWin) {
//          chrome.tabs.captureVisibleTab(capWin.id, {"format": settings.config().get("format")}, function(dataUrl) {
            //console.log("dataUrl:%s", dataUrl);
            var filename = util.getFileName(util.Ext[settings.config().get("format")]);

            aigisWidget.storage.writeblob(constants.capturedir+'/'+filename, util.dataUrl2blob(request.url), function(result) {
            //aigisWidget.storage.writeblob(constants.capturedir+'/'+filename, request.url, function(result) {
              if (settings.config().get('googleDriveUse')) {
                chrome.runtime.sendMessage({type: constants.msg.uploadImageGoogleDrive
                  ,fileName: filename
                  ,fullPath: constants.capturedir+'/'+filename
                });
              } else {
                aigisWidget.notice.create(constants.notice.captureCompleted, {filename: filename});
              }
            });
            aigisWidget.storage.list(constants.capturedir, function(entries) {
              entries.forEach(function (entry, i) {
                if (i >= constants.localcapturegen) {
                  aigisWidget.storage.remove(entry.fullPath, function () {});
                }
              });
            });
//          });
//        });
        break;

      case constants.msg.saveResize:
        settings.status().set('screenX', request.screenX);
        settings.status().set('screenY', request.screenY);
        break;

      case constants.msg.close:
        settings.status().set('screenX', request.screenX);
        settings.status().set('screenY', request.screenY);
        var url;
        if (settings.config().get('r18')) {
          url = constants.aigisr18url;
        } else {
          url = constants.aigisurl;
        }
        ga('send', 'pageview', url+'&close=true');
        ga('send', 'event', 'view', 'load', 'end aigis');
        break;

      case constants.msg.logger:
        console.log(request.log);
        aigisWidget.storage.append(constants.file.debugLogFile, request.log, function() {
          aigisWidget.storage.metainfo(constants.file.debugLogFile, function(meta) {
            if (meta.size > constants.debuglogsize) {
              aigisWidget.storage.remove(constants.file.debugLogBakFile, function() {
                aigisWidget.storage.rename('/', constants.file.debugLogFile, constants.file.debugLogBakFile);
              });
            }
          });
        });
        break;

      case constants.msg.test:
        break;

      case constants.msg.matome:
        //https://syndication.twitter.com/tweets.json?ids=516688779411611648&lang=ja&callback=twttr.tfw.callbacks.cb0&suppress_response_codes=true
        //var v = 'https://syndication.twitter.com/tweets.json?ids='+request.key[0]+'&lang=ja&callback=?&suppress_response_codes=true';
        var v = 'https://api.twitter.com/1/statuses/oembed.json?callback=?&hide_media=false&hide_thread=false&id='+request.key[0]+'&lang=ja';
        var dateObj = new Date;
        console.log(v);
        $.getJSON(v, function (json) {
          //blockquote
          var tw = json.html.replace(/<script("[^"]*"|'[^']*'|[^'">])*>*<\/script>/, '');
          //tw.replace('<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>', '');
          twitlist.push(tw);
        });
        break;

      case constants.msg.check:
        if (twitlist.length != request.length) {
          //var response = {config: settings};
          var response = {};
          response['list'] = twitlist;
          sendResponse(response);
        };
        break;

      case constants.msg.clear:
        twitlist = new Array();
        break;
    }
  });
})();
