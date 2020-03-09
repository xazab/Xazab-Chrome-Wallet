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
  if (data.mnemonic != '' && data.mnemoic != undefined)
    curMnemonic = data.mnemonic;
  else if (curMnemonic == undefined)
    curMnemonic = '';
});

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {

    if (request.greeting == "connect") {
      const sdkOpts = {
        network: 'testnet'
      };
      const sdk = new DashJS.SDK(sdkOpts);

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
      const sdk = new DashJS.SDK(sdkOpts);

      async function importMnemonic() {
        try {
          await sdk.isReady();
          curAddress = sdk.account.getUnusedAddress().address;
          curBalance = sdk.account.getConfirmedBalance();
        } catch (e) {
          console.error('Something went wrong:', e);
        } finally {
          sdk.disconnect();
        }
      }
      importMnemonic();
      chrome.storage.local.set({ mnemonic: curMnemonic });
      chrome.storage.local.set({ address: curAddress });
      chrome.storage.local.set({ balance: curBalance });

      sendResponse({ farewell: "goodbye importMnemonic" });
    }

    if (request.greeting == "getBalance") {
      const sdkOpts = {
        network: 'testnet',
        mnemonic: curMnemonic
      };
      const sdk = new DashJS.SDK(sdkOpts);

      async function getBalance() {
        try {
          await sdk.isReady();
          console.log(sdk.account.getUnusedAddress().address);
          console.log(sdk.account.getUnconfirmedBalance());
          console.log(sdk.account.getConfirmedBalance());
          console.log(sdk.account.getTotalBalance());
          chrome.storage.local.set({ balance: sdk.account.getConfirmedBalance() });
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
      const sdk = new DashJS.SDK(sdkOpts);

      async function createWallet() {
        try {
          await sdk.isReady();
          const mnemonic = sdk.wallet.exportWallet();
          const address = sdk.account.getUnusedAddress();
          curMnemonic = mnemonic;
          console.log('Mnemonic:', mnemonic);
          chrome.storage.local.set({ mnemonic: mnemonic }, function () {
            console.log("mnemonic saved");
          });
          chrome.storage.local.get(['mnemonic'], function (result) {
            console.log('Value currently is ' + result.mnemonic);
          });
          console.log('Unused address:', address.address);
          chrome.storage.local.set({ address: address.address }, function () {
            console.log("address saved");
          });
          chrome.storage.local.get(['address'], function (result) {
            console.log('Value currently is ' + result.address);
          });
          chrome.storage.local.set({ balance: '0' });
        } catch (e) {
          console.error('Something went wrong:', e);
        } finally {
          sdk.disconnect();
        }
      }
      createWallet();
      sendResponse({ farewell: "goodbye createWallet" });
    }

    if (request.greeting == "sendFunds") {
      const sdkOpts = {
        network: 'testnet',
        mnemonic: curMnemonic,
      };
      const sdk = new DashJS.SDK(sdkOpts);

      async function sendFunds() {
        try {
          await sdk.isReady();
          if (request.toAddress == '' && request.amount == '') {
            const transaction = sdk.account.createTransaction({
              recipient: 'yNPbcFfabtNmmxKdGwhHomdYfVs6gikbPf', // Evonet faucet
              satoshis: 100000000, // 1 Dash
              // amount: 1
            });
          } else if (request.toAddress != '' && request.amount != '') {
            const transaction = sdk.account.createTransaction({
              recipient: request.toAddress,
              satoshis: request.amount,
              // amount: 1
            });
          }
          // TODO check if working
          const result = await sdk.account.broadcastTransaction(transaction);
          console.log('Transaction broadcast!\nTransaction ID:', result);
          chrome.storage.local.set({ balance: sdk.account.getTotalBalance() });
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
      const sdk = new DashJS.SDK(sdkOpts);

      const createIdentity = async function () {
        try {
          await sdk.isReady();
          const platform = sdk.platform;
          const identity = await platform.identities.register('user');  // literally 'user', do not change
          console.log({ identity });
          curIdentity = identity;
          chrome.storage.local.set({ identity: identity });
        } catch (e) {
          console.error('Something went wrong:', e);
        } finally {
          sdk.disconnect();
        }
      }
      createIdentity();
      sendResponse({ farewell: "goodbye registerIdentity" });
    }

    if (request.greeting == "registerName") {
      const sdkOpts = {
        network: 'testnet',
        mnemonic: curMnemonic
      };
      const sdk = new DashJS.SDK(sdkOpts);

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
      const sdk = new DashJS.SDK(sdkOpts);

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
      const sdk = new DashJS.SDK(sdkOpts);

      const getContract = async function () {
        try {
          let platform = sdk.platform;
          await sdk.isReady();

          platform
            .contracts
            // .get('2KfMcMxktKimJxAZUeZwYkFUsEcAZhDKEpQs8GMnpUse')
            .get(request.contractid)
            .then((contract) => {
              // console.dir({ contract }, { depth: 5 });
              sendResponse({ farewell: "goodbye getContract", contract: contract });
            });
        } catch (e) {
          console.error('Something went wrong:', e);
        } finally {
          sdk.disconnect();
        }

      };
      getContract();
    }
    
  });



