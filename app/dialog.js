// document.forms[0].onsubmit = function(e) {
// e.preventDefault(); // Prevent submission

var confirmBtn = document.getElementById('confirm');
var denyBtn = document.getElementById('deny');
var requestText = document.getElementById('requestText')

chrome.runtime.getBackgroundPage(function (bgWindow) {

    if(bgWindow.curSwitch == true)
        requestText.value = bgWindow.pRequestDocument[bgWindow.curDocNr]  + "\nPin Verified: " + bgWindow.uidpin_verified;
    else if (bgWindow.curSwitch2 == true)
        requestText.value = bgWindow.curDappRequests[0].targetcontent;
    // bgWindow.setPassword(password);
    // window.close();     // Close dialog
});

confirmBtn.addEventListener('click', function () {
    chrome.runtime.getBackgroundPage(function (bgWindow) {
        bgWindow.setDappResponse("confirm")
    });
    window.close();
});

denyBtn.addEventListener('click', function () {
    chrome.runtime.getBackgroundPage(function (bgWindow) {
        bgWindow.setDappResponse("deny")
    });
    window.close();
});