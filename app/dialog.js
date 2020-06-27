// document.forms[0].onsubmit = function(e) {
// e.preventDefault(); // Prevent submission

var confirmBtn = document.getElementById('confirm');
var denyBtn = document.getElementById('deny');
var requestText = document.getElementById('requestText')

chrome.runtime.getBackgroundPage(function (bgWindow) {

    if (bgWindow.curSwitch == true) // WDS
        requestText.value = bgWindow.pRequestDocument[bgWindow.curDocNr] + "\nPin Verified: " + bgWindow.uidpin_verified;
    else if (bgWindow.curSwitch2 == true) { // SDS
        if (bgWindow.dsHeader == 'RequestDocumentST')
            requestText.value = bgWindow.curDappRequests[0].STcontent;
        else if (bgWindow.dsHeader == 'RequestTX') 
            requestText.value = "Send " + bgWindow.curDappRequests[0].TXamount + " Dash to Address " + bgWindow.curDappRequests[0].TXaddr;
    }
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