function showLoading(el, show) {
  var element = document.getElementById(el);
  if (show) {
    element.style.display = "inline-block";
  } else {
    element.style.display = "none";
  }
}

// function getLocalStorage(arrKeys) {
//   return new Promise((resolve, reject) => {
//     try {
//       chrome.storage.local.get(arrKeys, function (result) {
//         resolve(result);
//       });
//     }
//     catch (e) {
//       chrome.extension.getBackgroundPage().console.log('Erroring getting values for', key, 'from local storage');
//       reject(e);
//     }
//   });
// }

var wls = window.localStorage;

// on DOMContentLoaded
document.addEventListener('DOMContentLoaded', async function () {

  let connectBtn = document.getElementById('connectBtn');
  let createBtn = document.getElementById('createBtn');
  let addressText = document.getElementById('addressText');
  let balanceText = document.getElementById('balanceText');
  let getBalanceBtn = document.getElementById('balanceBtn');
  let sendFundsBtn = document.getElementById('sendBtn');
  let amountText = document.getElementById('amountText');
  let toAddressText = document.getElementById('toAddressText');
  let identityIdBtn = document.getElementById('identityBtn');
  let identityIdText = document.getElementById('identityText');
  let nameBtn = document.getElementById('nameBtn');
  let nameText = document.getElementById('nameText');
  let mnemonicText = document.getElementById('mnemonicText');
  let mnemonicBtn = document.getElementById('mnemonicBtn');
  let resetBtn = document.getElementById('resetBtn');

  let exampleQuerySelector = document.getElementById('exampleQuerySelector');
  let documentNameText = document.getElementById('documentNameText');
  let queryObjectText = document.getElementById('queryObjectText');
  let getDocumentsBtn = document.getElementById('getDocumentsBtn');

  let contractIdText = document.getElementById('contractIdText');
  let getContractBtn = document.getElementById('getContractBtn');
  let signingSwitch = document.getElementById('switch1');
  let pinText = document.getElementById('pinText');
  let simpleSwitch = document.getElementById('switch2');



  // disable button rules (executed each time popup opened)
  // TODO check if just use chrome.extension.getBackgroundPage().curMnemonic, since eg devmode local.storage not written
  mnemonicText.value = wls.getItem('mnemonic')
  if (mnemonicText.value != '')
    createBtn.disabled = true;

  addressText.value = wls.getItem('address')

  balanceText.value = wls.getItem('balance')
  if (balanceText.value == '' || balanceText.value == '0')
    sendFundsBtn.disabled = true;

  identityIdText.value = wls.getItem('identityId')
  if (identityIdText.value != '')
    identityIdBtn.disabled = true;
  else if (addressText.value == '') {
    identityIdBtn.disabled = true;
  }

  nameText.value = wls.getItem('name')
  if (nameText.value == '' && identityIdText.value == '') {
    nameText.readOnly = true;
    nameBtn.disabled = true;
  }
  else if (nameText.value != '') {
    nameText.readOnly = true;
    nameBtn.disabled = true;
  }



  pinText.value = wls.getItem('pin')

  // Firefox and Chrome reading boolean from wls as String
  if (typeof wls.getItem('switch2') === "string") {
    simpleSwitch.checked = (wls.getItem('switch2') == 'true')
    signingSwitch.checked = (wls.getItem('switch') == 'true')
  }
  else if (typeof wls.getItem('switch2') === "boolean") {
    simpleSwitch.checked = wls.getItem('switch2')
    signingSwitch.checked = wls.getItem('switch')
    console.log("wls switch as Boolean")
  } else {
    console.log("Error reading typeof Switch")
  }

  // chrome.storage.local.get('mnemonic', function (data) {
  //   mnemonicText.value = data.mnemonic;
  //   if (data.mnemonic != '')
  //     createBtn.disabled = true;
  // });
  // chrome.storage.local.get('address', function (data) {
  //   addressText.value = data.address;
  // });
  // chrome.storage.local.get('balance', function (data) {
  //   balanceText.value = data.balance;
  //   if (balanceText.value == '' || balanceText.value == '0') {
  //     sendFundsBtn.disabled = true;
  //   }
  // });
  // chrome.storage.local.get('identityId', function (data) {
  //   identityIdText.value = data.identityId;
  //   if (identityIdText.value != '')
  //     identityIdBtn.disabled = true;
  //   else if (addressText.value == '') {
  //     identityIdBtn.disabled = true;
  //   }
  // });
  // chrome.storage.local.get('name', function (data) {
  //   if (data.name == '' && identityIdText.value == '') {
  //     nameText.readOnly = true;
  //     nameBtn.disabled = true;
  //   }
  //   else if (data.name != '') {
  //     nameText.readOnly = true;
  //     nameBtn.disabled = true;
  //   }
  //   nameText.value = data.name;
  // });
  // chrome.storage.local.get('switch', function (data) {
  //   signingSwitch.checked = data.switch;
  // });
  // chrome.storage.local.get('pin', function (data) {
  //   pinText.value = data.pin;
  // });
  // chrome.storage.local.get('switch2', function (data) {
  //   simpleSwitch.checked = data.switch2;
  // });

  // wait for background, mostly not responding after browser/system restart TODO: remove direct background access
  async function waitForBG() {
    if ((await chrome.extension.getBackgroundPage().dsNotif) == true) {
      await chrome.extension.getBackgroundPage().dappSigningDialog();
    }
  }
  waitForBG();

  //switch
  signingSwitch.addEventListener('change', function () {
    if (chrome.extension.getBackgroundPage().curName == '') {
      window.alert("Please create a Username first! Aborting.")
      return false;
    }
    chrome.runtime.sendMessage({ greeting: "switch", switch: signingSwitch.checked }, function (response) { });
  }, false);

  //switch2
  simpleSwitch.addEventListener('change', function () {
    if (chrome.extension.getBackgroundPage().curName == '') {
      window.alert("Please create a Username first! Aborting.")
      return false;
    }
    chrome.runtime.sendMessage({ greeting: "switch2", switch: simpleSwitch.checked }, function (response) { });
  }, false);


  //connect
  connectBtn.addEventListener('click', function () {
    connectBtn.disabled = true;
    showLoading('spinnerTestConnection', true);
    chrome.runtime.sendMessage({ greeting: "connect" }, function (response) {
      //check return response then send alert
      chrome.extension.getBackgroundPage().console.log("Response background: " + response.complete);
      connectBtn.disabled = false;
      showLoading('spinnerTestConnection', false);
      // TODO firefox: will autohide popup.html -> set autohide to false like chrome default
      window.alert("connected");
      // window.close();
    });
  }, false);


  //reset
  resetBtn.addEventListener('click', function () {
    resetBtn.disabled = true;
    showLoading('spinnerResetConnection', true);
    chrome.runtime.sendMessage({ greeting: "resetWallet" }, function (response) {
      chrome.extension.getBackgroundPage().console.log("Response background: " + response.complete);
      resetBtn.disabled = false;
      showLoading('spinnerResetConnection', false);
      window.close();
    });
  }, false);


  //create wallet
  createBtn.addEventListener('click', function () {
    createBtn.disabled = true;
    showLoading('spinnerCreateWallet', true);
    chrome.runtime.sendMessage({ greeting: "createWallet" }, async function (response) {
      if (response.complete) {
        // await getLocalStorage(['address', 'balance', 'mnemonic']).then((cookies) => {
        //   chrome.extension.getBackgroundPage().console.log("COOKIES:", JSON.stringify(cookies));
        //   chrome.extension.getBackgroundPage().console.log("Response background: " + response.complete);
        //   addressText.value = cookies.address;
        //   balanceText.value = cookies.balance;
        //   mnemonicText.value = cookies.mnemonic;
        // });

        addressText.value = wls.getItem('address');
        balanceText.value = wls.getItem('balance');
        mnemonicText.value = wls.getItem('mnemonic');

        identityIdBtn.disabled = false;
        showLoading('spinnerCreateWallet', false);

        // TODO: execute getBalance button here till dashjs sendTX + getBalance bug fixed
        //       then delete here and execute in sendFunds background.js
        // getBalanceBtn.disabled = true;
        // showLoading('spinnerGetBalance', true);
        // chrome.runtime.sendMessage({ greeting: "getBalance", sleep: "true" }, async function (response) {
        //   chrome.extension.getBackgroundPage().console.log("Response background: " + response.complete);
        //   await getLocalStorage(['balance']).then((cookies) => {
        //     balanceText.value = cookies.balance;
        //   });
        //   getBalanceBtn.disabled = false;
        //   showLoading('spinnerGetBalance', false);
        // });
        ////////////
      }
      else {
        // alert('There was a problem creating the wallet - please try again');
        createBtn.disabled = false;
        // identityIdBtn.disabled = true;
        showLoading('spinnerCreateWallet', false);
      }
    });
  }, false);


  // get balance
  getBalanceBtn.addEventListener('click', function () {
    getBalanceBtn.disabled = true;
    showLoading('spinnerGetBalance', true);
    chrome.runtime.sendMessage({ greeting: "getBalance" }, async function (response) {
      chrome.extension.getBackgroundPage().console.log("Response background: " + response.complete);
      // await getLocalStorage(['balance']).then((cookies) => {
      //   balanceText.value = cookies.balance;
      // });

      balanceText.value = wls.getItem('balance')

      getBalanceBtn.disabled = false;
      showLoading('spinnerGetBalance', false);
      if (balanceText.value != '0') { sendFundsBtn.disabled = false }
    });
  }, false);


  //send funds
  sendFundsBtn.addEventListener('click', function () {
    sendFundsBtn.disabled = true;
    showLoading('spinnerSendFunds', true);
    chrome.runtime.sendMessage({ greeting: "sendFunds", toAddress: toAddressText.value, amount: amountText.value }, async function (response) {
      chrome.extension.getBackgroundPage().console.log("Response background: " + response.complete);
      // await getLocalStorage(['balance']).then((cookies) => {
      //   balanceText.value = cookies.balance;
      // });
      balanceText.value = wls.getItem('balance')
      sendFundsBtn.disabled = false;
      showLoading('spinnerSendFunds', false);

      // TODO: execute getBalance button here till dashjs sendTX + getBalance bug fixed
      //       then delete here and execute in sendFunds background.js
      // getBalanceBtn.disabled = true;
      // showLoading('spinnerGetBalance', true);
      // chrome.runtime.sendMessage({ greeting: "getBalance" }, async function (response) {
      //   chrome.extension.getBackgroundPage().console.log("Response background: " + response.complete);
      //   await getLocalStorage(['balance']).then((cookies) => {
      //     balanceText.value = cookies.balance;
      //   });
      //   getBalanceBtn.disabled = false;
      //   showLoading('spinnerGetBalance', false);
      // });
      ////////////
    });
  }, false);


  //get documents
  getDocumentsBtn.addEventListener('click', function () {
    getDocumentsBtn.disabled = true;
    showLoading('spinnerGetDocuments', true);
    chrome.runtime.sendMessage({ greeting: "getDocuments", documentName: documentNameText.value, queryObject: queryObjectText.value, contractId: contractIdText.value }, function (response) {
      chrome.extension.getBackgroundPage().console.log("Response background: " + response.complete);
      // queryObjectText.value = response.document;
      getDocumentsBtn.disabled = false;
      showLoading('spinnerGetDocuments', false);
    });
  }, false);


  //get contract
  getContractBtn.addEventListener('click', function () {
    getContractBtn.disabled = true;
    showLoading('spinnerGetContract', true);
    chrome.runtime.sendMessage({ greeting: "getContract", contractId: contractIdText.value }, function (response) {
      chrome.extension.getBackgroundPage().console.log("Response background: " + response.complete);
      getContractBtn.disabled = false;
      showLoading('spinnerGetContract', false);
    });
  }, false);

  exampleQuerySelector.addEventListener("change", function () {
    if (exampleQuerySelector.value == "Example DPNS") {
      documentNameText.value = 'domain';
      queryObjectText.value = '{ "where": [\n' +
        '["normalizedParentDomainName", "==", "dash"]\n' +
        '],\n' +
        '"startAt": 1 }\n';
      contractIdText.value = '3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8';
      // toAddressText.value = "yNPbcFfabtNmmxKdGwhHomdYfVs6gikbPf";  // Faucet
      toAddressText.value = "";
    }
    if (exampleQuerySelector.value == "Example Message") {
      documentNameText.value = 'message';
      queryObjectText.value = '{ "startAt": 1 }';
      contractIdText.value = 'CfHbvNx8ZJfhoizqCDawZK53iqyuJXdqwzQ8eVh58bjE';
      toAddressText.value = "";
    }
    if (exampleQuerySelector.value == "Example Note") {
      documentNameText.value = 'note';
      queryObjectText.value = '{ "startAt": 1 }';
      contractIdText.value = 'CscMg7A5qwWSFz8SmV45uP1WmeaDaS88fdo2SqxiKrxT';
      toAddressText.value = "";
    }
    if (exampleQuerySelector.value == "Example NFA") {
      documentNameText.value = 'mynfa';
      queryObjectText.value = '{ "startAt": 1 }';
      contractIdText.value = 'Faggf8rA3GuoEoSo8ACaqtY72iok6DY5D77dr2B7vFw1';
      toAddressText.value = "";
    }
    if (exampleQuerySelector.value == "Example myToken") {
      documentNameText.value = 'token';
      queryObjectText.value = '{ "startAt": 1 }';
      contractIdText.value = '946mB3VPhRCBNhJbXGvuR9YqpHaXPbUr3GvpqsKTnSN7';
      toAddressText.value = "";
    }
  });


  //register identityId
  identityIdBtn.addEventListener('click', function () {
    if (balanceText.value < '0.0001' || balanceText.value == '') {
      alert('Not enough funds detected!\nYou need to pay 0.0001 Dash as fee to create identity.')
      return;
    }

    identityIdBtn.disabled = true;
    showLoading('spinnerCreateIdentity', true);
    chrome.runtime.sendMessage({ greeting: "registerIdentity", identityId: identityIdText.value }, async function (response) {
      chrome.extension.getBackgroundPage().console.log("Response background: " + response.complete);
      // await getLocalStorage(['identityId']).then((cookies) => {
      //   identityIdText.value = cookies.identityId;
      // });

      identityIdText.value = wls.getItem('identityId')

      if (identityIdText.value != '') {
        nameBtn.disabled = false;
        nameText.readOnly = false;
      }
      showLoading('spinnerCreateIdentity', false);
    });

  }, false);


  //register name
  nameBtn.addEventListener('click', function () {
    nameBtn.disabled = true;
    showLoading('spinnerRegisterName', true);
    chrome.runtime.sendMessage({ greeting: "registerName", name: nameText.value }, async function (response) {
      chrome.extension.getBackgroundPage().console.log("Response background: " + response.complete);
      // await getLocalStorage(['name']).then((cookies) => {
      //   nameText.value = cookies.name;
      // });

      nameText.value = wls.getItem('name')

      nameText.readOnly = true;
      showLoading('spinnerRegisterName', false);
    });

  }, false);


  // import Mnemonic
  mnemonicBtn.addEventListener('click', function () {
    mnemonicBtn.disabled = true;
    showLoading('spinnerImportMnemonic', true);
    chrome.runtime.sendMessage({ greeting: "importMnemonic", mnemonic: mnemonicText.value }, async function (response) {
      chrome.extension.getBackgroundPage().console.log("Response background: " + response.complete);
      // await getLocalStorage(['address', 'balance', 'identityId']).then((cookies) => {
      //   addressText.value = cookies.address;
      //   balanceText.value = cookies.balance;
      //   identityIdText.value = cookies.identityId;
      // });

      addressText.value = wls.getItem('address');
      balanceText.value = wls.getItem('balance');
      identityIdText.value = wls.getItem('identityId');

      showLoading('spinnerImportMnemonic', false);
      mnemonicBtn.disabled = false;
      if (addressText.value != '') createBtn.disabled = true;
      if (identityIdText.value != '') identityIdBtn.disabled = true;
      if (identityIdText.value == '') identityIdBtn.disabled = false;
      if (balanceText.value != '0') sendFundsBtn.disabled = false;
      if (identityIdText.value != '') {
        nameBtn.disabled = false;
        nameText.readOnly = false;
      }
    });

  }, false);

}, false); // on DOMContentLoaded


chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.msg === "refresh balance") {
      balanceText.value = wls.getItem('balance')
      //  To do something
      chrome.extension.getBackgroundPage().console.log("popup listener");
      // console.log(request.data.subject)
      // console.log(request.data.content)
    }
  }
);