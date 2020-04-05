var curMnemonic = null;
var curAddress = '';
var curBalance = '';
var curIdentity = '';
var curApps = '';
var curName = '';
var sdkOpts = {};
var sdk = null;
var platform = null;
var identity = null;
var newWin = null;
const connectMaxRetries = 3;
var connectTries = 0;

sdkOpts.network = 'testnet';

function connect() {
  return new Promise((resolve, reject) => {
    try {
      connectTries++;
      sdkOpts.mnemonic = curMnemonic;
      sdkOpts.apps = curApps;

      console.log(sdkOpts.apps)
      console.log()
      console.log(sdkOpts)
      console.log()
      console.dir(sdkOpts)
      sdk = new Dash.Client(sdkOpts);
      sdk.isReady().then(() => {
        console.log('connected after', connectTries, 'tries');
        connectTries = 0;
        resolve();
      })
        .catch((e) => {
          console.log('error connecting to sdk', e);
          reject(e);
        });
    }
    catch (e) {
      console.log('error connecting: ', e);

      if (connectTries < connectMaxRetries) {
        console.log("retrying connect")
        connect();
      }
      else {
        console.log('error connecting after', connectTries, 'tries');
        reject(e);
      }
    }
  });
}

function disconnect() {
  return new Promise((resolve, reject) => {
    try {
      if (sdk != undefined) {
        console.log('disconnecting sdk:')
        sdk.disconnect().then(() => {
          console.log('SUCCESS')
          sdk = null;
          resolve();
        })
          .catch((e) => {
            console.log('FAIL')
            reject(e)
          });
      }
    }
    catch (e) {
      reject(e);
    }
  });
}

function getLocalStorage(arrKeys) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(arrKeys, function (result) {
        resolve(result);
      });
    }
    catch (e) {
      console.log('Erroring  getting values for', key, 'from local storage');
      reject(e);
    }
  });
}

chrome.runtime.onInstalled.addListener(function () {
  console.log("Dash Chrome-Wallet installed.");

  chrome.storage.local.set({ mnemonic: '' });
  chrome.storage.local.set({ address: '' });
  chrome.storage.local.set({ balance: '' });
  chrome.storage.local.set({ identity: '' });
  chrome.storage.local.set({ name: '' });

});

chrome.storage.local.get('mnemonic', function (data) {
  if (data.mnemonic != '' && data.mnemoic != undefined) {
    curMnemonic = data.mnemonic;
  } else if (curMnemonic == undefined)  // TODO: test if still needed
    curMnemonic = null;
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  try {
    // TODO: add button for extension in tab
    // chrome.tabs.create({url: chrome.extension.getURL("popup.html")})
    //console.log(chrome.extension.getURL("popup.html"));
    if(request.greeting=='importMnemonic'){curMnemonic = request.mnemonic}
    if(request.greeting=='getDocuments') {
      curApps = ' { "myContract" : { "contractId" : "' + request.contractId + '" } }'
      curApps = JSON.parse(curApps)
    }

    connect().then(() => {

      switch (String(request.greeting)) {

        case "connect":
          (async function connect() {
            console.log('connect');
            alert("connected");
            sendResponse({ complete: true })
          })()

          break;

        case "createWallet":

          (async function createWallet() {
            console.log('createWallet');

            const mnemonic = await sdk.wallet.exportWallet();
            curMnemonic = mnemonic;
            const address = await sdk.account.getUnusedAddress();
            await chrome.storage.local.set({ mnemonic: mnemonic });
            var savedMM = await getLocalStorage(['mnemonic']);
            await chrome.storage.local.set({ address: address.address });
            var savedAddress = await getLocalStorage(['address']);
            await chrome.storage.local.set({ balance: '0' });
            var savedBalance = await getLocalStorage(['balance']);
            sendResponse({ complete: true });
            disconnect();
          })()

          break;


        case "importMnemonic":

          (async function importMnemonic() {
            console.log('importMnemonic');
            curAddress = await sdk.account.getUnusedAddress().address;
            curBalance = ((await sdk.account.getUnconfirmedBalance()) / 100000000);
            console.log(curAddress);
            console.log("TODO: Balance missing, should not be 0: " + curBalance);
            await chrome.storage.local.set({ mnemonic: curMnemonic });
            await chrome.storage.local.set({ address: curAddress });
            await chrome.storage.local.set({ balance: curBalance });
            sendResponse({ complete: true });
            disconnect();
            // TODO: option 2 fire getBalance update here
          })()

          break;


        case "getBalance":
          (async function getBalance() {
            console.log('getBalance');
            console.log(await sdk.account.getUnconfirmedBalance())
            console.log(await sdk.account.getTotalBalance())
            console.log(await sdk.account.getConfirmedBalance())

            await chrome.storage.local.set({ balance: ((await sdk.account.getUnconfirmedBalance()) / 100000000) });
            sendResponse({ complete: true });
            disconnect();
          })()

          break;


        case "sendFunds":
          (async function sendFunds() {
            console.log('sendFunds');
            var transaction = null;
            if (request.toAddress == '' && request.amount == '') {
              transaction = await sdk.account.createTransaction({
                recipient: 'yNPbcFfabtNmmxKdGwhHomdYfVs6gikbPf', // Evonet faucet
                satoshis: 10000000, // 0.1 Dash
              });
            }
            else if (request.toAddress != '' && request.amount != '') {
              var satAmount = request.amount * 100000000;
              transaction = await sdk.account.createTransaction({
                recipient: request.toAddress,
                satoshis: satAmount,
              });
            }
            console.dir(transaction)
            const result = await sdk.account.broadcastTransaction(transaction);
            console.log('Transaction broadcast!\nTransaction ID:', result);
            // TODO: this should be working, bug in DashJS i guess, using popup.js for now
            // await new Promise(r => setTimeout(r, 20000));  // sleep x ms
            // console.log(await sdk.account.getUnconfirmedBalance())
            // console.log(await sdk.account.getTotalBalance())
            // await chrome.storage.local.set({ balance: ((await sdk.account.getUnconfirmedBalance()) / 100000000) });
            sendResponse({ complete: true });
            disconnect();
          })()

          break;


        case "registerIdentity":
          (async function registerIdentity() {
            console.log('registerIdentity');
            identity = await sdk.platform.identities.register('user'); // literally 'user', do not change
            console.log({ identity });
            curIdentity = identity;
            await chrome.storage.local.set({ identity: identity });
            sendResponse({ complete: true });
            disconnect();
          })()

          break;


        case "registerName":
          (async function registerName() {
            console.log('registerName');
            curName = request.name;
            identity = await sdk.platform.identities.get(curIdentity);
            const nameRegistration = await sdk.platform.names.register(curName, identity);
            console.log({ nameRegistration });
            await chrome.storage.local.set({ name: curName });
            sendResponse({ complete: true });
            disconnect();
          })()

          break;


        case "getDocuments":
          (async function getDocuments() {
            console.log('getDocuments');
            const recordLocator = "myContract." + request.documentName; // just use myContract for all
            const documents = await sdk.platform.documents.get(recordLocator, request.queryObject);
            console.log(documents);
            var documentJson = JSON.stringify(documents, null, 2)
            const newWin = window.open("about:blank", "Receive Document", "width=800,height=500");
            newWin.document.write('<html><body><pre>' + documentJson + '</pre></body></html>');
            newWin.document.close();
            sendResponse({ complete: true });
            disconnect();
          })()

          break;


        case "getContract":
          (async function getContract() {
            console.log('getContract');
            const contract = await sdk.platform.contracts.get(request.contractId);
            // const contract = await sdk.platform.contracts.get('77w8Xqn25HwJhjodrHW133aXhjuTsTv9ozQaYpSHACE3');
            console.dir({ contract }, { depth: 5 });
            var contractJson = JSON.stringify(contract, null, 2)
            const newWin = window.open("about:blank", "Receive Contract", "width=800,height=500");
            newWin.document.write('<html><body><pre>' + contractJson + '</pre></body></html>');
            newWin.document.close();
            sendResponse({ complete: true });
            disconnect();
          })()

          break;

        default:
          // error
          console.log('ERROR: Unknown Message!');
      }
    })
      .catch((e) => {
        console.log('ERROR CONNECTING', e);
        sendResponse({ complete: false });
        disconnect();
      });

  }

  catch (e) {
    console.log('error processing request: ', e);
  }
  finally {
    // return true from the event listener to indicate you wish to send a response asynchronously
    // (this will keep the message channel open to the other end until sendResponse is called).
    return true;
  }

});