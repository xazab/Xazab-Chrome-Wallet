var curMnemonic = '';
var curAddress = '';
var curBalance = '';
var curIdentity = '';
var curName = '';

chrome.runtime.onInstalled.addListener(function () {
  console.log("Dash Chrome-Wallet installed.");

  // chrome.storage.local.set({ mnemonic: 'slight offer leaf pumpkin immune grit minimum novel train village orphan purity' });
  chrome.storage.local.set({ mnemonic: '' });
  // chrome.storage.local.set({ address: 'yaArRuZMXMXGKUdv5mUAySLCyYmZpTEH6Q' });
  chrome.storage.local.set({ address: '' });
  chrome.storage.local.set({ balance: '' });
  chrome.storage.local.set({ identity: '' });
  chrome.storage.local.set({ name: '' });

});

chrome.storage.local.get('mnemonic', function (data) {
  if (data.mnemonic != '' && data.mnemoic != undefined) {
    curMnemonic = data.mnemonic;
  } else if (curMnemonic == undefined)
    curMnemonic = '';
});

chrome.runtime.onMessage.addListener(
  async function (request, sender, sendResponse) {

    if (request.greeting == "connect") {
      const sdkOpts = {
        network: 'testnet'
      };
      const sdk = new DashJS.Client(sdkOpts);

      async function connect() {
        try {
          await sdk.isReady();
          alert("connected");
          console.log('connected');
        } catch (e) {
          console.error('Something went wrong:', e);
        } finally {
          sdk.disconnect();
        }
      }
      connect();
      sendResponse({ farewell: "goodbye connect" });
    }


    if (request.greeting == "importMnemonic") {

      curMnemonic = request.mnemonic;

      const sdkOpts = {
        network: 'testnet',
        mnemonic: curMnemonic
      };
      const sdk = new DashJS.Client(sdkOpts);

      async function importMnemonic() {
        try {
          await sdk.isReady();
          curAddress = await sdk.account.getUnusedAddress().address;
          curBalance = ((await sdk.account.getTotalBalance()) / 100000000);
          console.log(curAddress);
        } catch (e) {
          console.error('Something went wrong:', e);
        } finally {
          sdk.disconnect();
        }
      }
      await importMnemonic();
      chrome.storage.local.set({ mnemonic: curMnemonic });
      chrome.storage.local.set({ address: curAddress });
      chrome.storage.local.set({ balance: curBalance });

      sendResponse({ farewell: "goodbye importMnemonic", address: curAddress, balance: curBalance });
    }

    if (request.greeting == "getBalance") {
      const sdkOpts = {
        network: 'testnet',
        mnemonic: curMnemonic
      };
      const sdk = new DashJS.Client(sdkOpts);

      async function getBalance() {
        try {
          await sdk.isReady();
          console.log(sdk.account.getUnusedAddress().address);
          // console.log(sdk.account.getConfirmedBalance());
          // console.log(sdk.account.getUnconfirmedBalance());
          console.log(sdk.account.getTotalBalance());
          chrome.storage.local.set({ balance: ((await sdk.account.getTotalBalance()) / 100000000) });
        } catch (e) {
          console.error('Something went wrong:', e);
        } finally {
          sdk.disconnect();
        }
      }
      getBalance();
      sendResponse({ farewell: "goodbye getBalance" });
    }

    if (request.greeting == "createWallet") {
      const sdkOpts = {
        network: 'testnet',
        mnemonic: null,
      };
      const sdk = new DashJS.Client(sdkOpts);

      async function createWallet() {
        try {
          await sdk.isReady();
          const mnemonic = await sdk.wallet.exportWallet();
          const address = await sdk.account.getUnusedAddress();
          curMnemonic = mnemonic;
          console.log('Mnemonic:', mnemonic);
          await chrome.storage.local.set({ mnemonic: mnemonic }, function () {
            console.log("mnemonic saved");
          });
          await chrome.storage.local.get(['mnemonic'], function (result) {
            console.log('Value currently is ' + result.mnemonic);
          });
          console.log('Unused address:', address.address);
          await chrome.storage.local.set({ address: address.address }, function () {
            console.log("address saved");
          });
          await chrome.storage.local.get(['address'], function (result) {
            console.log('Value currently is ' + result.address);
          });
          await chrome.storage.local.set({ balance: '0' });
        } catch (e) {
          console.error('Something went wrong:', e);
        } finally {
          sdk.disconnect();
        }
      }
      // await createWallet().then(sendResponse({ farewell: "goodbye createWallet" }));
      await createWallet()
      console.log("blub1");
      sendResponse({ farewell: "goodbye createWallet" });
    }

    if (request.greeting == "sendFunds") {
      const sdkOpts = {
        network: 'testnet',
        mnemonic: curMnemonic,
      };
      const sdk = new DashJS.Client(sdkOpts);

      async function sendFunds() {
        try {
          await sdk.isReady();
          if (request.toAddress == '' && request.amount == '') {
            const transaction = await sdk.account.createTransaction({
              recipient: 'yNPbcFfabtNmmxKdGwhHomdYfVs6gikbPf', // Evonet faucet
              satoshis: 100000000, // 1 Dash
              // amount: 1
            });
          } else if (request.toAddress != '' && request.amount != '') {
            const transaction = await sdk.account.createTransaction({
              recipient: request.toAddress,
              satoshis: request.amount * 100000000,
              // amount: 1
            });
          }
          // TODO check if working
          const result = await sdk.account.broadcastTransaction(transaction);
          console.log('Transaction broadcast!\nTransaction ID:', result);
          chrome.storage.local.set({ balance: ((await sdk.account.getTotalBalance()) / 100000000) });
        } catch (e) {
          console.error('Something went wrong:', e);
        } finally {
          sdk.disconnect();
        }
      }
      sendFunds();
      sendResponse({ farewell: "goodbye sendFunds" });
    }

    if (request.greeting == "registerIdentity") {
      const sdkOpts = {
        network: 'testnet',
        mnemonic: curMnemonic
      };
      const sdk = new DashJS.Client(sdkOpts);

      const createIdentity = async function () {
        try {
          await sdk.isReady();
          const platform = sdk.platform;
          const identity = await platform.identities.register('user'); // literally 'user', do not change
          console.log({ identity });
          curIdentity = identity;
          chrome.storage.local.set({ identity: identity });
        } catch (e) {
          console.error('Something went wrong:', e);
        } finally {
          sdk.disconnect();
        }
      }
      await createIdentity();
      sendResponse({ farewell: "goodbye registerIdentity" });
    }

    if (request.greeting == "registerName") {
      const sdkOpts = {
        network: 'testnet',
        mnemonic: curMnemonic
      };
      const sdk = new DashJS.Client(sdkOpts);

      const registerName = async function () {
        try {
          await sdk.isReady();
          curName = request.name;
          const platform = sdk.platform;
          const identity = await platform.identities.get(curIdentity);
          const nameRegistration = await platform.names.register(curName, identity);
          console.log({ nameRegistration });
          chrome.storage.local.set({ name: curName });
        } catch (e) {
          console.error('Something went wrong:', e);
        } finally {
          sdk.disconnect();
        }
      }

      registerName();
      sendResponse({ farewell: "goodbye registerName" });
    }

    if (request.greeting == "getDocuments") {
      const sdkOpts = {
        network: 'testnet',
        mnemonic: curMnemonic
      };
      const sdk = new DashJS.Client(sdkOpts);

      const getDocuments = async function () {
        try {
          await sdk.isReady();
          const documents = await sdk.platform.documents.get(request.recordLocator, request.queryObject);
          // const documents = await sdk.platform.documents.get('dpns.domain', {
          //   where: [
          //     ['normalizedParentDomainName', '==', 'dash']
          //   ],
          //   startAt: 0
          // });
          console.log(documents);
          var documentJson = JSON.stringify(documents, null, 2)
          let newWin = window.open("about:blank", "Receive Document", "width=800,height=500");
          newWin.document.write('<html><body><pre>' + documentJson + '</pre></body></html>');
          newWin.document.close();

          sendResponse({ farewell: "goodbye getDocuments", document: documents });
        } catch (e) {
          console.error('Something went wrong:', e);
        } finally {
          sdk.disconnect();
        }
      };
      getDocuments();
    }


    if (request.greeting == "getContract") {
      const sdkOpts = {
        network: 'testnet',
        mnemonic: curMnemonic
      };
      const sdk = new DashJS.Client(sdkOpts);

      const getContract = async function () {
        try {
          let platform = sdk.platform;
          await sdk.isReady();
          const contract = await platform.contracts.get(request.contractid);
          // .get('77w8Xqn25HwJhjodrHW133aXhjuTsTv9ozQaYpSHACE3');

          console.dir({ contract }, { depth: 5 });
          var contractJson = JSON.stringify(contract, null, 2)
          let newWin = window.open("about:blank", "Receive Contract", "width=800,height=500");
          newWin.document.write('<html><body><pre>' + contractJson + '</pre></body></html>');
          newWin.document.close();

          sendResponse({ farewell: "goodbye getContract", contract: contract });

        } catch (e) {
          console.error('Something went wrong:', e);
        } finally {
          sdk.disconnect();
        }

      };
      getContract();
    }

    // return true from the event listener to indicate you wish to send a response asynchronously
    // (this will keep the message channel open to the other end until sendResponse is called).
    return true;
  });