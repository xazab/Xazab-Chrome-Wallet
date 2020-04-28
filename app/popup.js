function showLoading(el, show) {
  var element = document.getElementById(el);
  if (show) {
    element.style.display = "inline-block";
  } else {
    element.style.display = "none";
  }
}

function getLocalStorage(arrKeys) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(arrKeys, function (result) {
        resolve(result);
      });
    }
    catch (e) {
      chrome.extension.getBackgroundPage().console.log('Erroring  getting values for', key, 'from local storage');
      reject(e);
    }
  });
}

// on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {

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

  let exampleQuerySelector = document.getElementById('exampleQuerySelector');
  let documentNameText = document.getElementById('documentNameText');
  let queryObjectText = document.getElementById('queryObjectText');
  let getDocumentsBtn = document.getElementById('getDocumentsBtn');

  let contractIdText = document.getElementById('contractIdText');
  let getContractBtn = document.getElementById('getContractBtn');
  let signingSwitch = document.getElementById('switch1');


  // disable button rules (executed each time popup opened)
  chrome.storage.local.get('mnemonic', function (data) {
    mnemonicText.value = data.mnemonic;
    if (data.mnemonic != '')
      createBtn.disabled = true;
  });
  chrome.storage.local.get('address', function (data) {
    addressText.value = data.address;
  });
  chrome.storage.local.get('balance', function (data) {
    balanceText.value = data.balance;
    if (balanceText.value == '' || balanceText.value == '0') {
      sendFundsBtn.disabled = true;
    }
  });
  chrome.storage.local.get('identityId', function (data) {
    identityIdText.value = data.identityId;
    if (identityIdText.value != '')
      identityIdBtn.disabled = true;
    else if (addressText.value == '') {
      identityIdBtn.disabled = true;
    }
  });
  chrome.storage.local.get('name', function (data) {
    if (data.name == '' && identityIdText.value == '') {
      nameText.readOnly = true;
      nameBtn.disabled = true;
    }
    else if (data.name != '') {
      nameText.readOnly = true;
      nameBtn.disabled = true;
    }
    nameText.value = data.name;
  });
  chrome.storage.local.get('switch', function (data) {
    signingSwitch.checked = data.switch;
  });

  //switch
  signingSwitch.addEventListener('change', function () {
    // chrome.extension.getBackgroundPage().console.log("switch changed")
    // signingSwitch.checked = true;
    chrome.runtime.sendMessage({ greeting: "switch", switch: signingSwitch.checked }, function (response) { });
  }, false);


  //connect
  connectBtn.addEventListener('click', function () {
    connectBtn.disabled = true;
    showLoading('spinnerTestConnection', true);
    chrome.runtime.sendMessage({ greeting: "connect" }, function (response) {
      //check return response then send alert
      chrome.extension.getBackgroundPage().console.log("Response bg -> popup: " + response.complete);
      connectBtn.disabled = false;
      showLoading('spinnerTestConnection', false);
      // TODO firefox: will autohide popup.html -> set autohide to false like chrome default
      window.alert("connected");
      // window.close();
    });
  }, false);


  //create wallet
  createBtn.addEventListener('click', function () {
    createBtn.disabled = true;
    showLoading('spinnerCreateWallet', true);
    chrome.runtime.sendMessage({ greeting: "createWallet" }, async function (response) {
      if (response.complete) {
        await getLocalStorage(['address', 'balance', 'mnemonic']).then((cookies) => {
          chrome.extension.getBackgroundPage().console.log("COOKIES:", JSON.stringify(cookies));
          chrome.extension.getBackgroundPage().console.log("Response bg -> popup: " + response.complete);
          addressText.value = cookies.address;
          balanceText.value = cookies.balance;
          mnemonicText.value = cookies.mnemonic;
        });
        identityIdBtn.disabled = false;
        showLoading('spinnerCreateWallet', false);
      }
      else {
        alert('There was a problem creating the wallet - please try again');
        createBtn.disabled = false;
        identityIdBtn.disabled = false;
        showLoading('spinnerCreateWallet', false);
      }
    });
  }, false);


  // get balance
  getBalanceBtn.addEventListener('click', function () {
    getBalanceBtn.disabled = true;
    showLoading('spinnerGetBalance', true);
    chrome.runtime.sendMessage({ greeting: "getBalance" }, async function (response) {
      chrome.extension.getBackgroundPage().console.log("Response bg -> popup: " + response.complete);
      await getLocalStorage(['balance']).then((cookies) => {
        balanceText.value = cookies.balance;
      });
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
      chrome.extension.getBackgroundPage().console.log("Response bg -> popup: " + response.complete);
      await getLocalStorage(['balance']).then((cookies) => {
        balanceText.value = cookies.balance;
      });
      sendFundsBtn.disabled = false;
      showLoading('spinnerSendFunds', false);

      // TODO: execute getBalance button here till dashjs sendTX + getBalance bug fixed
      //       then delete here and execute in sendFunds background.js
      getBalanceBtn.disabled = true;
      showLoading('spinnerGetBalance', true);
      chrome.runtime.sendMessage({ greeting: "getBalance" }, async function (response) {
        chrome.extension.getBackgroundPage().console.log("Response bg -> popup: " + response.complete);
        await getLocalStorage(['balance']).then((cookies) => {
          balanceText.value = cookies.balance;
        });
        getBalanceBtn.disabled = false;
        showLoading('spinnerGetBalance', false);
      });
      ////////////
    });
  }, false);


  //get documents
  getDocumentsBtn.addEventListener('click', function () {
    getDocumentsBtn.disabled = true;
    showLoading('spinnerGetDocuments', true);
    chrome.runtime.sendMessage({ greeting: "getDocuments", documentName: documentNameText.value, queryObject: queryObjectText.value, contractId: contractIdText.value }, function (response) {
      chrome.extension.getBackgroundPage().console.log("Response bg -> popup: " + response.complete);
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
      chrome.extension.getBackgroundPage().console.log("Response bg -> popup: " + response.complete);
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
      contractIdText.value = '77w8Xqn25HwJhjodrHW133aXhjuTsTv9ozQaYpSHACE3';
      // toAddressText.value = "yNPbcFfabtNmmxKdGwhHomdYfVs6gikbPf";  // Faucet
      toAddressText.value = "";
    }
    if (exampleQuerySelector.value == "Example Message") {
      documentNameText.value = 'message';
      queryObjectText.value = '{ "startAt": 1 }';
      contractIdText.value = 'GjUfAtc3FnbFe9HH78GaCSJV7DraAG1ctJeNeujhoqyH';
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
      chrome.extension.getBackgroundPage().console.log("Response bg -> popup: " + response.complete);
      await getLocalStorage(['identityId']).then((cookies) => {
        identityIdText.value = cookies.identityId;
      });
      if (identityIdText.value != '') {
        nameBtn.disabled = false
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
      chrome.extension.getBackgroundPage().console.log("Response bg -> popup: " + response.complete);
      await getLocalStorage(['name']).then((cookies) => {
        nameText.value = cookies.name;
      });
      nameText.readOnly = true;
      showLoading('spinnerRegisterName', false);
    });

  }, false);


  // import Mnemonic
  mnemonicBtn.addEventListener('click', function () {
    mnemonicBtn.disabled = true;
    showLoading('spinnerImportMnemonic', true);
    chrome.runtime.sendMessage({ greeting: "importMnemonic", mnemonic: mnemonicText.value }, async function (response) {
      chrome.extension.getBackgroundPage().console.log("Response bg -> popup: " + response.complete);
      await getLocalStorage(['address', 'balance', 'identityId']).then((cookies) => {
        addressText.value = cookies.address;
        balanceText.value = cookies.balance;
        identityIdText.value = cookies.identityId;
      });
      showLoading('spinnerImportMnemonic', false);
      mnemonicBtn.disabled = false;
      if (addressText.value != '') createBtn.disabled = true;
      if (identityIdText.value != '') identityIdBtn.disabled = true;
      if (identityIdText.value == '') identityIdBtn.disabled = false;
    });

  }, false);

}, false); // on DOMContentLoaded
