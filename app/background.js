var curMnemonic = null; // must be null for dashjs init
var curAddress = '';
var curBalance = '';
var curIdentityId = '';
var curName = '';
var curSwitch = false;

var sdk = null;
var sdkOpts = {};
var platform = null;
var curApps = '';
var tmpIdentity = {};  //check remove

var curIdentityHDPrivKey = {};
var curIdentityPrivKey = '';
var curIdentityPubKey = '';
var curIdentityAddress = '';
var curDocDomainID = '';
var curPin = Math.floor(Math.random() * 900000) + 100000;
// var curPin = '123456';
var curDocNr = 0;

var connectTries = 0;
const connectMaxRetries = 3;

var pollSdk = null;
var curDappRequests = [];
var loginResponseDocOpts = ['', '', ''];
var uidpin_verified = false;

// set to true when notification comes in and show dappSigningDialog when popup opens next time
var boolNotif = false;


////////////////////////////////////
//// development environment settings:
//// prividentkey: tprv8nSVgPnsKBP8SgQY8jJKszuTgqTK2rYB5WtQe8sC7xGZQWcANaqrHD1znfBxhqhZV3dMAowmDPoXmHZSqR4JDnRvVd4GUe92S7qNSRR3JXK
// curMnemonic = 'grid bind gasp long fox catch inch radar purchase winter woman cactus';
// curAddress = 'yRaSjQLmnVUapXCSuxtCYZNf4ZhkjB5nDh';
// curBalance = '1';
// curIdentityId = 'FJ85ReAdCiBBRy39JcrYJo8YkoJLa5oSMpziXYoSJ2a7';
// curName = 'readme'
// chrome.storage.local.set({ mnemonic: curMnemonic });
// chrome.storage.local.set({ address: curAddress });
// chrome.storage.local.set({ balance: curBalance });
// chrome.storage.local.set({ identityId: curIdentityId });
// chrome.storage.local.set({ name: curName });

//// Dapp-Signing-Polling-Settings (deprecated)
//// test dapp-signing Message contract:
// sdkOpts.network = 'testnet';
// const pContractID = "mA1kafwtR8HGoZamz72fmUWGGXKjDFLqmirtZbJYYoT";
// const pContractName = 'myContract';
// const pRequestDocument = "message";
// const pRequestProp = "body"
// const pRequestTarget = curIdentityId;

////////////////////////////////////
//// Dapp-Signing WDS contract constants and variables:
sdkOpts.network = 'testnet';
const pContractID = "9GHRxvyYDmWz7pBKRjPnxjsJbbgKLngtejWWp3kEY1vB";
const pContractName = 'myContract';
var pRequestDocument = ["LoginRequest", "SignupRequest", "TweetRequest"];
const pRequestProp = "reference";
var pRequestTarget = '';

// vendor credentials
const aliceDocDomainId = "Aobc5KKaA4ZqzP7unc6WawQXQEK2S3y6EwrmvJLLn1ui" // vendor, alice
const alicePublicKey = "A0/qSE6tis4l6BtQlTXB2PHW+WV+Iy0rpF5hAvX8hDRz"; // vendor, alice

const pResponseDocument = ["LoginResponse", "SignupResponse", "TweetResponse"];
const pResponseProp = "status";

//// DPNS-Contract for docID
const domainContractID = "295xRRRMGYyAruG39XdAibaU9jMAzxhknkkAxFE7uVkW";
const domainRequestDocument = "domain";


////////////////////////////////////


function connect() {
  return new Promise((resolve, reject) => {
    try {
      connectTries++;
      sdkOpts.mnemonic = curMnemonic;
      sdkOpts.apps = curApps;
      console.log("SDK Init " + curMnemonic)
      sdk = new Dash.Client(sdkOpts);
      sdk.isReady().then(() => {
        console.log('connected after', connectTries, 'tries');
        // getIdentityKeys()  // test, remove
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

// DEBUG
// chrome.storage.local.get("mnemonic", function (result) {
//   console.log("log");
//   console.log(result.mnemonic);
//   if(result.mnemonic == '') {console.log("empty string")}
//   if(result.mnemonic == undefined) {console.log("undefined")}
// });

chrome.runtime.onInstalled.addListener(async function () {
  console.log("Dash Chrome-Wallet installed.");

  // check for fresh install with no set cookies
  var testCookie;
  chrome.storage.local.get("mnemonic", function (result) {
    testCookie = result.mnemonic;
  });
  if (testCookie == undefined) {
    console.log("No Cookies detected, initializing.")
    chrome.storage.local.set({ mnemonic: '' }); // must be '' for popup.js
    chrome.storage.local.set({ address: '' });
    chrome.storage.local.set({ balance: '' });
    chrome.storage.local.set({ identityId: '' });
    chrome.storage.local.set({ name: '' });
    chrome.storage.local.set({ switch: '' });
    chrome.storage.local.set({ pin: curPin });
  } else {
    console.log("Cookies detected.")
  }
  console.log("Dash Chrome-Wallet initialization complete.");
  // chrome.storage.local.set({ tab: chrome.extension.getURL("popup.html") });
});

// set curMnemonic for connect() function
chrome.storage.local.get('mnemonic', function (data) {
  if (data.mnemonic != '' && data.mnemonic != undefined) { // first run: onInstalled not finished when reached here -> so undefined
    curMnemonic = data.mnemonic;
    console.log("Mnemonic successfully loaded: " + data.mnemonic)
  }
  else if (curMnemonic == undefined) { // TODO: test if still needed - shouldnt happen
    console.log("No existing Mnemonic found.")
    curMnemonic = null;
  }
});
// set switch to false on "browser load" - TODO: remove switch from cookies
chrome.storage.local.set({ switch: false });
chrome.storage.local.set({ pin: curPin });


////////////// code for dapp signing ////////////

async function getIdentityKeys() {
  curIdentityHDPrivKey = await sdk.account.getIdentityHDKey(0, 'user')
  console.log("curIdentHDPrivKey: " + curIdentityHDPrivKey)
  curIdentityPrivKey = curIdentityHDPrivKey.privateKey;
  var pk = curIdentityPrivKey;
  curIdentityPublicKey = curIdentityHDPrivKey.publicKey;
  var pubk = curIdentityPublicKey;
  console.log("IdentityPrivateKey " + curIdentityPrivKey)
  // those are identical after converting toAddress()
  console.log("IdentityPublicKey.toAddress() : " + pubk.toAddress().toString())
  console.log("identityPrivateKey.toAddress: " + pk.toAddress().toString())

  //// encryption test
  // const hashedAndEncryptedUID_PIN = "eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzMsNzksMjM0LDcyLDc4LDE3MywxMzgsMjA2LDM3LDIzMiwyNyw4MCwxNDksNTMsMTkzLDIxNiwyNDEsMjE0LDI0OSwxMDEsMTI2LDM1LDQ1LDQzLDE2NCw5NCw5NywyLDI0NSwyNTIsMTMyLDUyLDExNSwxOTYsMTA2LDc2LDEzNSwyMjEsMjEzLDEsMjE3LDE4LDE3LDE1Nyw5MywxODUsMjA4LDIwMSwyMDcsMTgxLDE0MywxNzUsMTg2LDE3NywxMywyMzAsMTAxLDc2LDIyNiwxOTEsMTYwLDI1MCwyMjAsMzYsMjI1LDExOCwxOTYsODYsOTgsMTA5LDIxNywxMTEsMTgzLDc4LDExOSwzNywyNDgsMjMzLDU4LDQ0LDQ0LDIyMiwyNDUsMjMsMTIxLDgzLDIwOCwyNyw2MiwyNTAsMCwxMjMsMTQ0LDE2OSwxNTAsMTk3LDg4LDI4LDE2OSwyMjIsMzcsMjM1LDE2MiwyMCw1NSw5MSw5NCwyMDUsMjAyLDI4LDIzLDE4NCw3MCwyMTMsODAsMTQ2LDgwLDE5OCwxOTMsMjE0LDIyNiwyNTIsMTI3LDE0MiwxMjMsNzYsNjYsMTU2LDhdfQ=="
  // decrypted = DashmachineCrypto.decrypt('7e79092c94fddd676ad410b27793beda7e9394caa5d4de328b8838edf526edf4', hashedAndEncryptedUID_PIN, 'A0/qSE6tis4l6BtQlTXB2PHW+WV+Iy0rpF5hAvX8hDRz')
  // console.log("test DashMachine Output: " + decrypted.data);

  // var decrypted2 = DashmachineCrypto.decrypt('2f567b21e0f49de46653701dc3a7c65a0d5bb1070c6e71de966c60fbb603dd19', 'eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzMsNzksMjM0LDcyLDc4LDE3MywxMzgsMjA2LDM3LDIzMiwyNyw4MCwxNDksNTMsMTkzLDIxNiwyNDEsMjE0LDI0OSwxMDEsMTI2LDM1LDQ1LDQzLDE2NCw5NCw5NywyLDI0NSwyNTIsMTMyLDUyLDExNSwxNjQsNTAsMTUyLDE3MSwyNTQsMTg2LDIxMiwxNTUsMjA3LDI1MywyMjQsMjA4LDQsMTQ3LDI1LDE0OCwxMjMsMjYsMjQ5LDIzMywyMTcsMTM2LDE0NCwyMTMsOTcsNzAsODYsNjEsMTk2LDE1NywxNjksNiw5MCwyNTMsMTEwLDY3LDU5LDIzMSwxOTUsNTcsMjAzLDE5MiwxNzUsMjUxLDIzOSwyMSwxODYsMzAsMjAzLDExNywzOSwxNTcsNTAsMzUsNzAsMTc4LDQxLDQ5LDEzMCwzNSwxMzUsMTQsNSw0LDIwLDE0MiwxODksMTQ5LDE0NSw5OSwyMjEsNDMsNDcsMTQ3LDI1MywxMzIsNjMsMTg1LDI1NSwyMTYsMTg3LDEyLDE3LDczLDEwMywxNDYsMjQ5LDEyMSwxNTAsODgsNDgsMTI1LDcxLDE1NSwxNTgsMTE1XX0=', 'A0/qSE6tis4l6BtQlTXB2PHW+WV+Iy0rpF5hAvX8hDRz');
  // console.log("test DashMachine Output: " + decrypted2.data);
}

async function signMsg(msg) {
  try {
    // const message = "readme Fri, 03 Apr 2020 16:50:59 GMT"; // TODO
    const messageDash = new Dash.Core.Message(msg);
    console.log("message: " + messageDash);
    console.log("curIdentPrivKey: " + curIdentityPrivKey)

    // Cannot read property 'sign' of undefined
    // const signedMsg = await pollSdk.account.sign(messageDash, curIdentPrivKey);
    var signedMsg = await messageDash.sign(curIdentityPrivKey);

    console.log("sign(msg, privKey): " + signedMsg)

    const verify = await messageDash.verify(curIdentityPrivKey.toAddress().toString(), signedMsg.toString());
    console.log("verify(identAddr, signed msg):  " + verify)
  } catch (e) {
    console.log("caught signMsg " + e)
  } finally {
    return signedMsg;
  }
}

async function submitDocument(msg) {

  try {
    var tidentity = await pollSdk.platform.identities.get(curIdentityId);

    var docProperties = {
      status: msg
    }
    // Create the note document
    var noteDocument = await pollSdk.platform.documents.create(
      // pContractName + "." + pResponseDocument,
      tidentity,
      docProperties,
    );

    const documentBatch = {
      create: [noteDocument],
      replace: [],
      delete: [],
    }

    // Sign and submit the document
    // TypeError: Cannot read property 'getIdentityHDKey' of undefined
    console.log(tidentity)
    console.log(noteDocument)
    await pollSdk.platform.documents.broadcast(documentBatch, tidentity);
  } catch (e) {
    console.error('Something went wrong:', e);
  } finally {
    console.log("submitted login document with message: " + msg)
  }
  return true;
}

async function submitWdsResponseDocument(msg) {

  try {
    var tidentity = await pollSdk.platform.identities.get(curIdentityId);

    console.log(msg.reference)
    console.log(msg.status)
    console.log(msg.vid_pin)
    console.log(msg.temp_timestamp)

    var docProperties = {
      reference: msg.reference,
      status: msg.status,
      vid_pin: msg.vid_pin,
      temp_timestamp: msg.temp_timestamp
    }
    // Create the note document
    var noteDocument = await pollSdk.platform.documents.create(
      pContractName + "." + pResponseDocument[curDocNr],
      tidentity,
      docProperties,
    );

    const documentBatch = {
      create: [noteDocument],
      replace: [],
      delete: [],
    }

    // Sign and submit the document
    // TypeError: Cannot read property 'getIdentityHDKey' of undefined
    console.log(tidentity)
    console.log(noteDocument)
    await pollSdk.platform.documents.broadcast(documentBatch, tidentity);
  } catch (e) {
    console.error('Something went wrong:', e);
  } finally {
    console.log("submitted wds document with message: " + msg)
  }
  return true;
}

chrome.notifications.onClicked.addListener(async (id) => {
  console.log("Notification clicked")
  dappSigningDialog();
  chrome.notifications.clear(id);
});

async function polling() {

  // TODO: remove later
  getIdentityKeys();

  // get docID for current user
  await getDocID();
  pRequestTarget = curDocDomainID;

  // TODO remove when DashJS removed curApps
  var psdkOpts = {};
  psdkOpts.network = 'testnet';
  psdkOpts.mnemonic = curMnemonic;
  curApps = '{ "myContract" : { "contractId" : "' + pContractID + '" } }';
  curApps = JSON.parse(curApps);
  psdkOpts.apps = curApps;

  var nStart = [1, 1, 1];
  var pollLocator = ["myContract." + pRequestDocument[0], "myContract." + pRequestDocument[1], "myContract." + pRequestDocument[2]];

  pollSdk = new Dash.Client(psdkOpts);
  await pollSdk.isReady();

  var reachedHead = [false, false, false];
  // for testing (remove later):
  // var reachedHead = true;
  // nStart = 38;

  while (curSwitch) {

    var i;
    for (i = 0; i < 3; i++) {
      curDocNr = i;
      try {

        console.log("polling " + pRequestDocument[i] + ": " + nStart[i]);

        var pollQuery = '{ "startAt" : "' + nStart[i] + '" }';
        // console.log(pollQuery)
        pollQuery = JSON.parse(pollQuery);
        const pollDoc = await pollSdk.platform.documents.get(pollLocator[i], pollQuery);

        if (pollDoc.length == 0 || reachedHead[i] == false) {
          if (pollDoc.length == 0) {
            reachedHead[i] = true;
            // console.log("reached head")
            await new Promise(r => setTimeout(r, 5000));  // sleep x ms
          }
          nStart[i] = nStart[i] + pollDoc.length;
          continue;
        }
        console.log("polldoc length: " + pollDoc.length)

        for (let index = 0; index < pollDoc.length; ++index) {
          var requestMsg = pollDoc[index].data;  // get document data , TODO: change to pRequestProp
          if (requestMsg.reference == null) return;

          if (requestMsg.reference.startsWith(pRequestTarget)) {  // check for Target docID
            console.log("Found message starting with " + pRequestTarget);
            curDappRequests = [];
            curDappRequests.push(requestMsg);
            // debug, remove
            console.log("requestMsg.reference:")
            console.log(requestMsg.reference)

            var views = chrome.extension.getViews({ type: "popup" });
            //views => [] //popup is closed
            //views => [DOMWindow] //popup is open
            console.log(views)

            // encryption stuff
            var vendorUserId = aliceDocDomainId //alice, vendor
            var userUserId = curDocDomainID;
            var loginPin = curPin;
            var userPrivateKey = curIdentityPrivKey.toString();
            // var userPrivateKey = curIdentityPrivKey;

            var senderPublicKey = alicePublicKey;
            var LoginReq = curDappRequests[0];


            // console.log("uid_pin: " + curDappRequests[0].uid_pin)
            // var vendor_hash_uidpin = DashmachineCrypto.encrypt(userPrivateKey, LoginReq.nonce, senderPublicKey);
            // console.log("encrypted object:");
            // console.log(vendor_hash_uidpin);

            // CW concats these three values to get the plain uid_pin value
            const plainUID_PIN = vendorUserId.concat(userUserId, loginPin.toString())
            console.log("plainUID_PIN:", plainUID_PIN);

            //CW get the hashed + encrypted uids + PIN
            const hashedAndEncryptedUID_PIN = LoginReq.uid_pin;
            console.log("uid_pin:", hashedAndEncryptedUID_PIN);

            //CW decrypts this value to get the hash digest of plainUID_PIN
            console.log(userPrivateKey)
            console.log(hashedAndEncryptedUID_PIN)
            console.log(senderPublicKey)
            // const decryptedUID_PIN = DashmachineCrypto.decrypt(userPrivateKey, hashedAndEncryptedUID_PIN, senderPublicKey).data;
            const decryptedUID_PIN = DashmachineCrypto.decrypt(userPrivateKey, hashedAndEncryptedUID_PIN, senderPublicKey).data;
            console.log("decryptedUID_PIN (The hash digest of plainUID_PIN):", decryptedUID_PIN);

            //CW verifies that decryptedUID_PIN ==the digest of the hashed plainUID_PIN (checkign the plain message against a hash of itself)
            const verified = DashmachineCrypto.verify(plainUID_PIN, decryptedUID_PIN);
            console.log("verified?:", verified);
            if (verified.success) { uidpin_verified = true; } else { uidpin_verified = false; }

            //CW decrypts the nonce
            const encryptedNonce = LoginReq.nonce;
            console.log("encryptedNonce", encryptedNonce);
            const decryptedNonce = DashmachineCrypto.decrypt(userPrivateKey, encryptedNonce, senderPublicKey).data;
            console.log("decrypted nonce:", decryptedNonce);

            //Generate Response Doc:
            //reference: Vendor userID (Reference)

            //vid_pin: Encrypted Hash of [Vendor nonce + Vendor userID + CW Pin)
            const plainVID_PIN = decryptedNonce.concat(vendorUserId, loginPin.toString());
            console.log('plainVID_PIN', plainVID_PIN);

            //hash then encrypt for the vendors PK
            const hashedVID_PIN = DashmachineCrypto.hash(plainVID_PIN).data;
            console.log('hashedVID_PIN', hashedVID_PIN);

            /********
            * THE ENCRYTION FUNCTION DOES NOT APPEAR TO BE STABLE (IN THIS EXAMPLE AT LEAST)
            * IT's RETURNING SAME RESULT FOR VID_PIN AND STATUS
            * POSSIBLY DUE TO USE OF STATIC FUNCTIONS IN CLASS, MORE LIKELY HOW AWAIT WORKS IN REPL ???
            */

            //CW gets the wallet user's own private key
            //CW looks up the vendors public key from their userid
            //encrypt hashedVID_PIN
            var encryptedVID_PIN = DashmachineCrypto.encrypt(userPrivateKey, hashedVID_PIN, senderPublicKey).data;
            console.log('encryptedVID_PIN', encryptedVID_PIN);

            //status: Encrypted [status+entropy] (0 = valid)
            const statusCode = 0;
            const status = statusCode.toString().concat(DashmachineCrypto.generateEntropy());
            console.log('status', status);
            const encryptedStatus = DashmachineCrypto.encrypt(userPrivateKey, status, senderPublicKey).data;
            console.log('encryptedStatus', encryptedStatus);

            //LoginResponse DocData
            if (i == 0) {
              loginResponseDocOpts[i] = { reference: vendorUserId, vid_pin: encryptedVID_PIN, status: encryptedStatus, temp_timestamp: LoginReq.temp_timestamp };
              console.log('loginResponseDocOpts');
              console.dir(loginResponseDocOpts[i]);
            } else if (i == 1) {
              loginResponseDocOpts[i] = { reference: vendorUserId, vid_pin: encryptedVID_PIN, status: encryptedStatus, temp_timestamp: LoginReq.temp_timestamp };
              console.log('signupResponseDocOpts');
              console.dir(loginResponseDocOpts[i]);
            } else if (i == 2) {
              loginResponseDocOpts[i] = { reference: vendorUserId, vid_pin: encryptedVID_PIN, status: encryptedStatus, temp_timestamp: LoginReq.temp_timestamp };
              console.log('tweetResponseDocOpts');
              console.dir(loginResponseDocOpts[i]);
            }

            // OS Request-DappSigning Notification
            console.log("Creating Notification")
            chrome.notifications.create({
              type: "basic",
              iconUrl: chrome.extension.getURL("img/icon128.png"),
              title: "Request",
              message: "Received message with your IdentityDocId. Confirm Request?",
              // requireInteraction: true
            });

            // sleep until notification is checked
            boolNotif = true;
            while (boolNotif == true) {
              await new Promise(r => setTimeout(r, 5000));
            }
          }
        }
        nStart[i] = nStart[i] + pollDoc.length;
        // await pollSdk.disconnect();

      } catch (e) {
        // NOTE: firefox not supporting buttons in notification, also not supporting alert+confirm dialog in background
        console.log("caught error polling " + e)
        // curSwitch = false
        // return;
      }
    }
  }
  await pollSdk.disconnect();
  console.log("return")
  return;
}

async function setDappResponse(decision) {
  console.log(decision);
  if (decision == "confirm") {
    // var responseMsgSigned = await signMsg(curDappRequests[0].reference);
    // console.log("currDappRequest reference: " + curDappRequests[0].reference)
    // console.log("responseMsgSigned: " + responseMsgSigned)
    // await submitDocument(responseMsgSigned);
    await submitWdsResponseDocument(loginResponseDocOpts[curDocNr]);
  } else {

  }
  boolNotif = false;
};

function getDappRequests() {
  console.log("curdapprequest: " + curDappRequests[0])
  return curDappRequests;
}

function dappSigningDialog() {
  console.log("dappSigningDialog created")
  chrome.windows.create({
    url: chrome.extension.getURL('dialog.html'),
    type: 'popup',
    // focused: true, // not supported by firefox
    top: 300,
    left: 300,
    width: 510,
    height: 290
  });
}

async function getDocID() {
  var psdkOpts = {};
  psdkOpts.network = 'testnet';
  psdkOpts.mnemonic = curMnemonic;
  curApps = '{ "myContract" : { "contractId" : "' + domainContractID + '" } }';
  curApps = JSON.parse(curApps);
  psdkOpts.apps = curApps;

  var tRecordLocator = "myContract.domain";
  var tQueryObject = '{ "where": [' +
    '["normalizedParentDomainName", "==", "dash"],' +
    '["normalizedLabel", "==", "' + curName + '"]' +
    '],' +
    '"startAt": 1 }';

  docSdk = new Dash.Client(psdkOpts);
  await docSdk.isReady();

  var queryJson = JSON.parse(tQueryObject);
  if(curName=='') {
    curSwitch = false;
    await chrome.storage.local.set({ switch: false });
    throw "Name not set, please create a Username for your Identity";
  }
  const documents = await docSdk.platform.documents.get(tRecordLocator, queryJson);
  // await new Promise(r => setTimeout(r, 2000));  // sleep x ms
  // TODO: remove later, just a fix for current dashjs error 13
  console.log(documents)
  if (documents[0] == null || documents[0] == undefined) {
    console.log("Couldnt connect to network, aborting polling! Please try again in a few moments.");
    curSwitch = false;
    await chrome.storage.local.set({ switch: false });
    docSdk.disconnect();
  } else {
    console.log("Document ID for user " + curName + ": " + documents[0].id)
    curDocDomainID = documents[0].id
    console.log("saved document domain ID")
  }
}

async function changePinLoop() {
  while (curSwitch) {
    await new Promise(r => setTimeout(r, 600000));  // 10 min
    curPin = Math.floor(Math.random() * 900000) + 100000;
    chrome.storage.local.set({ pin: curPin });
  }
}

////////////// END experimental code for dapp signing ////////////


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  try {
    if (request.greeting == 'importMnemonic') { curMnemonic = request.mnemonic; console.log(curMnemonic); }
    if (request.greeting == 'getDocuments') {
      curApps = '{ "myContract" : { "contractId" : "' + request.contractId + '" } }';
      curApps = JSON.parse(curApps);
    }
    // if (request.greeting == "switch") {
    //   (async function dappSigning() {
    //     curSwitch = request.switch;
    //     console.log("curSwitch: " + curSwitch)
    //     await chrome.storage.local.set({ switch: curSwitch });
    //     if (curSwitch) {
    //       polling();
    //     }
    //     // exit somehow or add "switch" case
    //   })();
    // }

    /////////////////// start switch - case ////////////////////

    connect().then(() => {

      switch (String(request.greeting)) {

        case "connect":
          (async function connect() {
            console.log('connect');
            sendResponse({ complete: true })
            // var alertWindow = 'alert("message")';
            // chrome.tabs.executeScript({ code: alertWindow });
          })()

          break;

        // case "dappSigningDialog":
        //   (function dappSigningDialog() {
        //     chrome.windows.create({
        //       url: chrome.extension.getURL('dialog.html'),
        //       type: 'popup',
        //       // focused: true,
        //       top: 300,
        //       left: 300,
        //       width: 510,
        //       height: 290
        //     });

        //   })()

        case "switch":
          (async function dappSigning() {
            curSwitch = request.switch;
            console.log("curSwitch: " + curSwitch)
            await chrome.storage.local.set({ switch: curSwitch });
            if (curSwitch) {
              polling();
              // changePinLoop();
            }
            sendResponse({ complete: true });
            disconnect();
          })();
          break


        case "createWallet":
          (async function createWallet() {
            console.log('createWallet');

            const mnemonic = await sdk.wallet.exportWallet();
            curMnemonic = mnemonic;
            const address = await sdk.account.getUnusedAddress();
            curAddress = address.address;
            await chrome.storage.local.set({ mnemonic: curMnemonic });
            // var savedMM = await getLocalStorage(['mnemonic']);
            await chrome.storage.local.set({ address: curAddress });
            // var savedAddress = await getLocalStorage(['address']);
            await chrome.storage.local.set({ balance: '0' });
            // var savedBalance = await getLocalStorage(['balance']);

            // run automated faucet
            console.log("run automated faucet for address " + curAddress)
            var httpReq = new XMLHttpRequest();
            httpReq.open("GET", "https://qetrgbsx30.execute-api.us-west-1.amazonaws.com/stage/?dashAddress=" + curAddress, true); // true for async
            httpReq.addEventListener("load", function (e) {
              console.log(httpReq.responseText);
            }, false)
            httpReq.send(null);

            sendResponse({ complete: true });
            disconnect();
          })();
          break;


        case "importMnemonic":

          (async function importMnemonic() {
            console.log('importMnemonic');
            curAddress = await sdk.account.getUnusedAddress().address;
            curBalance = ((await sdk.account.getTotalBalance()) / 100000000);

            getIdentityKeys();

            await chrome.storage.local.set({ mnemonic: curMnemonic });
            await chrome.storage.local.set({ address: curAddress });
            await chrome.storage.local.set({ balance: curBalance });
            // await chrome.storage.local.set({ identityId: curIdentityId });
            await chrome.storage.local.set({ identityId: "" });

            sendResponse({ complete: true });
            disconnect();
          })()
          break;


        case "getBalance":
          // TODO: use events api to auto update balance
          (async function getBalance() {
            console.log('getBalance');
            console.log(await sdk.account.getUnconfirmedBalance())
            console.log(await sdk.account.getTotalBalance())
            console.log(await sdk.account.getConfirmedBalance())

            await chrome.storage.local.set({ balance: ((await sdk.account.getTotalBalance()) / 100000000) });
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
                satoshis: 100000000, // 1 Dash
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
            // import identityID if given '<string>' from popup.js
            if (request.identityId != '') {
              tmpIdentity.id = request.identityId;
            }
            // create identity if given '' from popup.js
            else if (request.identityId == '') {
              tmpIdentity = await sdk.platform.identities.register(); // TODO: testing
            }
            console.log({ tmpidentity: tmpIdentity.id });
            curIdentityId = tmpIdentity.id;
            await chrome.storage.local.set({ identityId: tmpIdentity.id });
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
            tmpIdentity = await sdk.platform.identities.get(curIdentityId);
            console.log(tmpIdentity)
            const nameRegistration = await sdk.platform.names.register(curName, tmpIdentity);
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

            // todo: fix encoding warning in firefox
            let a = URL.createObjectURL(new Blob([documentJson]), { encoding: "UTF-8", type: "text/plain;charset=UTF-8" })

            chrome.windows.create({
              type: 'popup',
              url: a
            });

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

            let a = URL.createObjectURL(new Blob([contractJson]), { encoding: "UTF-8", type: "text/plain;charset=UTF-8" })

            chrome.windows.create({
              type: 'popup',
              url: a
            });
            // const newWin = window.open("about:blank", "Receive Contract", "width=800,height=500");
            // newWin.document.open();
            // newWin.document.write('<html><body><pre>' + contractJson + '</pre></body></html>');
            // newWin.document.close();
            sendResponse({ complete: true });
            disconnect();
          })()
          break;


        case "resetWallet":
          (async function resetWallet() {
            curMnemonic = null; // must be null for dashjs init
            curAddress = '';
            curBalance = '';
            curIdentityId = '';
            curName = '';
            curSwitch = false;
            chrome.storage.local.set({ mnemonic: '' }); // must be '' for popup.js
            chrome.storage.local.set({ address: '' });
            chrome.storage.local.set({ balance: '' });
            chrome.storage.local.set({ identityId: '' });
            chrome.storage.local.set({ name: '' });
            chrome.storage.local.set({ switch: '' });
            sendResponse({ complete: true });
            disconnect();
          })()
          break;


        default:
          // error
          console.log('ERROR Unknown Message: ' + String(request.greeting));
          disconnect();
          break;
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