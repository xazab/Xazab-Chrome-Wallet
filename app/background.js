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
// var newWin = null;
const connectMaxRetries = 3;
var connectTries = 0;
var curSwitch = false;
var curIdentHDPrivKey = null;
var curIdentPrivKey = '';
var curidentPubKey = '';
var curIdentAddr = '';
var pollSdk = null;

sdkOpts.network = 'testnet';

function connect() {
  return new Promise((resolve, reject) => {
    try {
      connectTries++;
      sdkOpts.mnemonic = curMnemonic;
      sdkOpts.apps = curApps;
      console.log("SDK Init")
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
  chrome.storage.local.set({ switch: '' });
  // chrome.storage.local.set({ tab: chrome.extension.getURL("popup.html") });

});

chrome.storage.local.get('mnemonic', function (data) {
  if (data.mnemonic != '' && data.mnemoic != undefined) {
    curMnemonic = data.mnemonic;
  } else if (curMnemonic == undefined)  // TODO: test if still needed
    curMnemonic = null;
});

async function getIdentityKeys() {
  curIdentHDPrivKey = await sdk.account.getIdentityHDKey(0, 'user')
  curIdentPrivKey = curIdentHDPrivKey.privateKey;
  var pk = curIdentPrivKey;
  curIdentityPublicKey = curIdentHDPrivKey.publicKey;
  var pubk = curIdentityPublicKey;
  console.log("IdentityPrivateKey " + curIdentPrivKey)
  // those are identical after converting toAddress()
  console.log("IdentityPublicKey.toAddress() : " + pubk.toAddress().toString())
  console.log("identityPrivateKey.toAddress: " + pk.toAddress().toString())

}

async function signMsg(msg) {
  try {
    const message = "readme Fri, 03 Apr 2020 16:50:59 GMT";
    const messageDash = new Dash.Core.Message(message);
    console.log("message: " + messageDash);
    console.log("curIdentPrivKey: " + curIdentPrivKey)

    // Cannot read property 'sign' of undefined
    // const signedMsg = await pollSdk.account.sign(messageDash, curIdentPrivKey);
    var signedMsg = await messageDash.sign(curIdentPrivKey);

    console.log("sign(msg, privKey): " + signedMsg)

    const verify = await messageDash.verify(curIdentPrivKey.toAddress().toString(), signedMsg.toString());
    console.log("verify(identAddr, signed msg):  " + verify)
  } catch (e) {
    console.log("caught signMsg " + e)
  } finally {
    return signedMsg;
  }
}

async function submitDocument(msg) {

  try {
    //TODO change to curIdentity
    var tidentity = await pollSdk.platform.identities.get('J5dEwvo6yTn8NUTTUF2UhMt79jUskEP3uXcQS1tF3dtb');

    var docProperties = {
      message: msg
    }
    // Create the note document TODO: change record locator
    var noteDocument = await pollSdk.platform.documents.create(
      'myContract.login',
      tidentity,
      docProperties,
    );
    // Sign and submit the document
    // TypeError: Cannot read property 'getIdentityHDKey' of undefined
    console.log(tidentity)
    console.log(noteDocument)
    await pollSdk.platform.documents.broadcast(noteDocument, tidentity);
  } catch (e) {
    console.error('Something went wrong:', e);
  } finally {
    console.log("submited login document with message: " + msg)
  }
  return true;
}


//////////////////////////////////// just testing/hacking for now

async function polling() {

  pContractID = "7kXTykyrTW192bCTKiMuEX2s15KExZaHKos8GrWCF21D";
  pDocument = "login";
  // pTarget = "myName"

  var psdkOpts = {};
  psdkOpts.network = 'testnet';
  psdkOpts.mnemonic = 'napkin oven gasp job romance park call isolate kite exotic bachelor control';
  curApps = '{ "myContract" : { "contractId" : "' + pContractID + '" } }';
  curApps = JSON.parse(curApps);
  psdkOpts.apps = curApps;

  var nStart = 1;
  var pollLocator = "myContract." + pDocument;

  pollSdk = new Dash.Client(psdkOpts);
  await pollSdk.isReady();

  // while (curSwitch) {

  try {

    console.log("polling");
    var pollQuery = '{ "startAt" : "' + nStart + '" }';
    pollQuery = JSON.parse(pollQuery);
    console.log(pollQuery)
    const pollDoc = await pollSdk.platform.documents.get(pollLocator, pollQuery);
    nStart = nStart + pollDoc.length;
    console.log(pollDoc.length);
    console.log(pollDoc[0].data.message);

    if (pollDoc[0].data.message.startsWith("readme")) {
      console.log("suc");

      curIdentity = 'J5dEwvo6yTn8NUTTUF2UhMt79jUskEP3uXcQS1tF3dtb'; // TODO remove
      var retSignMsg = await signMsg("blub");
      console.log("retSignMsg: " + retSignMsg)
      await submitDocument(retSignMsg);
    }
    // await pollSdk.disconnect();
    await new Promise(r => setTimeout(r, 5000));  // sleep x ms
  } catch (e) {
    console.log("caught polling " + e)
  }
  // }
  return true;
}
// while (true) {
// polling();
// }
////////////////////////////////////


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  try {
    // TODO: add button for extension in tab
    // chrome.tabs.create({url: chrome.extension.getURL("popup.html")})
    // console.log(chrome.extension.getURL("popup.html"));
    if (request.greeting == 'importMnemonic') { curMnemonic = request.mnemonic; console.log(curMnemonic); }
    if (request.greeting == 'getDocuments') {
      curApps = '{ "myContract" : { "contractId" : "' + request.contractId + '" } }';
      curApps = JSON.parse(curApps);
    }
    if (request.greeting == "switch") {
      (async function dappSigning() {
        curSwitch = request.switch;
        console.log(curSwitch)
        await chrome.storage.local.set({ switch: curSwitch });
        if (curSwitch) {
          polling();
        }
        // exit somehow
      })();
    }

    /////////////////// start switch - case ////////////////////

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
            // var savedMM = await getLocalStorage(['mnemonic']);
            await chrome.storage.local.set({ address: address.address });
            // var savedAddress = await getLocalStorage(['address']);
            await chrome.storage.local.set({ balance: '0' });
            // var savedBalance = await getLocalStorage(['balance']);
            sendResponse({ complete: true });
            disconnect();
          })()

          break;


        case "importMnemonic":

          (async function importMnemonic() {
            console.log('importMnemonic');
            curAddress = await sdk.account.getUnusedAddress().address;
            curBalance = ((await sdk.account.getUnconfirmedBalance()) / 100000000);

            getIdentityKeys();

            await chrome.storage.local.set({ mnemonic: curMnemonic });
            await chrome.storage.local.set({ address: curAddress });
            await chrome.storage.local.set({ balance: curBalance });
            // await chrome.storage.local.set({ identity: curIdentity });
            await chrome.storage.local.set({ identity: "" });

            sendResponse({ complete: true });
            disconnect();
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
            getIdentityKeys();

            sendResponse({ complete: true });
            disconnect();
          })()

          break;


        case "registerName":
          (async function registerName() {
            console.log('registerName');
            curName = request.name;
            // TODO: bug when having several identitys, importing 1st and then registering name
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

            var queryJson = JSON.parse(request.queryObject);
            const documents = await sdk.platform.documents.get(recordLocator, queryJson);
            console.log(documents);
            var documentJson = JSON.stringify(documents, null, 2)

            let a = URL.createObjectURL(new Blob([documentJson]))
            // console.log(a)
            chrome.windows.create({
              type: 'popup',
              url: a
            });
            // chrome.tabs.create({ url: a });

            // newWin = window.open(a, "Document Query", "width=800,height=500");

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
            newWin.document.open();
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