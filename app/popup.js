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
  let regIdentityBtn = document.getElementById('identityBtn');
  let identityText = document.getElementById('identityText');
  let regNameBtn = document.getElementById('nameBtn');
  let nameText = document.getElementById('nameText');
  let mnemonicText = document.getElementById('mnemonicText');
  let mnemonicBtn = document.getElementById('mnemonicBtn');

  let exampleQuerySelector = document.getElementById('exampleQuerySelector');
  let documentNameText = document.getElementById('documentNameText');
  let queryObjectText = document.getElementById('queryObjectText');
  let getDocumentsBtn = document.getElementById('getDocumentsBtn');

  let contractIdText = document.getElementById('contractIdText');
  let getContractBtn = document.getElementById('getContractBtn');


  // disable create button when address already created and stored
  chrome.storage.local.get('mnemonic', function (data) {
    if (data.mnemonic != '')
      createBtn.disabled = true;
    mnemonicText.value = data.mnemonic;
  });
  chrome.storage.local.get('address', function (data) {
    addressText.value = data.address;
  });
  chrome.storage.local.get('balance', function (data) {
    balanceText.value = data.balance;
  });
  chrome.storage.local.get('identity', function (data) {
    if (data.identity != '')
      regIdentityBtn.disabled = true;
    identityText.value = data.identity;
  });
  chrome.storage.local.get('name', function (data) {
    if (data.name != '') {
      nameText.readOnly = true;
      regNameBtn.disabled = true;
    }
    nameText.value = data.name;
  });


  // import not working for identities yet
  // mnemonicBtn.disabled = true;

  //connect
  connectBtn.addEventListener('click', function () {
    connectBtn.disabled = true;
    showLoading('spinnerTestConnection', true);
    chrome.runtime.sendMessage({ greeting: "connect" }, function (response) {
      //check return response then send alert
      chrome.extension.getBackgroundPage().console.log("Response bg -> popup: " + response.complete);
      connectBtn.disabled = false;
      showLoading('spinnerTestConnection', false);
    });
  }, false);


  //create wallet
  createBtn.addEventListener('click', function () {
    createBtn.disabled = true;
    showLoading('spinnerCreateWallet', true);
    chrome.runtime.sendMessage({ greeting: "createWallet" }, function (response) {
      if (response.complete) {
        getLocalStorage(['address', 'balance', 'mnemonic']).then((cookies) => {
          chrome.extension.getBackgroundPage().console.log("COOKIES:", JSON.stringify(cookies));
          chrome.extension.getBackgroundPage().console.log("Response bg -> popup: " + response.complete);
          addressText.value = cookies.address;
          balanceText.value = cookies.balance;
          mnemonicText.value = cookies.mnemonic;
          showLoading('spinnerCreateWallet', false);
        });
      }
      else {
        alert('There was a problem creating the wallet - please try again');
        createBtn.disabled = false;
        showLoading('spinnerCreateWallet', false);
      }
    });
  }, false);


  // get balance
  getBalanceBtn.addEventListener('click', function () {
    getBalanceBtn.disabled = true;
    showLoading('spinnerGetBalance', true);
    chrome.runtime.sendMessage({ greeting: "getBalance" }, function (response) {
      chrome.extension.getBackgroundPage().console.log("Response bg -> popup: " + response.complete);
      getLocalStorage(['balance']).then((cookies) => {
        balanceText.value = cookies.balance;
        getBalanceBtn.disabled = false;
        showLoading('spinnerGetBalance', false);
      });
    });
  }, false);


  //send funds
  sendFundsBtn.addEventListener('click', function () {
    sendFundsBtn.disabled = true;
    showLoading('spinnerSendFunds', true);
    chrome.runtime.sendMessage({ greeting: "sendFunds", toAddress: toAddressText.value, amount: amountText.value }, function (response) {
      chrome.extension.getBackgroundPage().console.log("Response bg -> popup: " + response.complete);
      getLocalStorage(['balance']).then((cookies) => {
        balanceText.value = cookies.balance;
      });
      sendFundsBtn.disabled = false;
      showLoading('spinnerSendFunds', false);

      // TODO: execute getBalance button here till dashjs sendTX + getBalance bug fixed
      getBalanceBtn.disabled = true;
      showLoading('spinnerGetBalance', true);
      chrome.runtime.sendMessage({ greeting: "getBalance" }, function (response) {
        chrome.extension.getBackgroundPage().console.log("Response bg -> popup: " + response.complete);
        getLocalStorage(['balance']).then((cookies) => {
          balanceText.value = cookies.balance;
          getBalanceBtn.disabled = false;
          showLoading('spinnerGetBalance', false);
        });
      });
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
      queryObjectText.value = "{ where: [\n" +
        "['normalizedParentDomainName', '==', 'dash']\n" +
        "],\n" +
        "startAt: 0 }\n";
      contractIdText.value = '77w8Xqn25HwJhjodrHW133aXhjuTsTv9ozQaYpSHACE3';
      // toAddressText.value = "yNPbcFfabtNmmxKdGwhHomdYfVs6gikbPf";  // Faucet
      toAddressText.value = "";
    }
    if (exampleQuerySelector.value == "Example Login") {
      documentNameText.value = 'login';
      queryObjectText.value = "{ startAt: 0 }\n";
      contractIdText.value = '7kXTykyrTW192bCTKiMuEX2s15KExZaHKos8GrWCF21D';
      toAddressText.value = "";
    }
  });


  //register identity
  regIdentityBtn.addEventListener('click', function () {
    regIdentityBtn.disabled = true;
    showLoading('spinnerCreateIdentity', true);
    chrome.runtime.sendMessage({ greeting: "registerIdentity" }, function (response) {
      chrome.extension.getBackgroundPage().console.log("Response bg -> popup: " + response.complete);
      if (balanceText.value == '0') {
        alert('No funds detected!\nNeed to pay some fee to create identity.')
      }
      getLocalStorage(['identity']).then((cookies) => {
        identityText.value = cookies.identity;
      });
      showLoading('spinnerCreateIdentity', false);
    });

  }, false);


  //register name
  regNameBtn.addEventListener('click', function () {
    regNameBtn.disabled = true;
    showLoading('spinnerRegisterName', true);
    chrome.runtime.sendMessage({ greeting: "registerName", name: nameText.value }, function (response) {
      chrome.extension.getBackgroundPage().console.log("Response bg -> popup: " + response.complete);
      getLocalStorage(['name']).then((cookies) => {
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
    chrome.runtime.sendMessage({ greeting: "importMnemonic", mnemonic: mnemonicText.value }, function (response) {
      chrome.extension.getBackgroundPage().console.log("Response bg -> popup: " + response.complete);
      getLocalStorage(['address', 'balance']).then((cookies) => {
        addressText.value = cookies.address;
        balanceText.value = cookies.balance;
      });
      showLoading('spinnerImportMnemonic', false);
      mnemonicBtn.disabled = false;
      // TODO: option 1 fire getBalance click event here
    });

  }, false);

}, false); // on DOMContentLoaded
