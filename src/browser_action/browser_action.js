$(function() {
  chrome.runtime.sendMessage({type: constants.msg.popup});
  if (!(window.name)) {
    window.close();
  }
});
