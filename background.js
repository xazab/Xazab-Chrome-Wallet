var curMnemonic = '';
var curAddress = '';
var curBalance = '';
var curIdentity = '';
var curName = '';

chrome.runtime.onInstalled.addListener(function() {
  console.log("Dash Chrome-Wallet installed.");

  // chrome.storage.local.set({ mnemonic: 'slight offer leaf pumpkin immune grit minimum novel train village orphan purity' });
  chrome.storage.local.set({ mnemonic: '' });
  // chrome.storage.local.set({ address: 'yaArRuZMXMXGKUdv5mUAySLCyYmZpTEH6Q' });
  chrome.storage.local.set({ address: '' });
  chrome.storage.local.set({ balance: '' });
  chrome.storage.local.set({ identity: '' });
  chrome.storage.local.set({ name: '' });

});

chrome.storage.local.get('mnemonic', function(data) {
  console.log('blub')
  if (data.mnemonic != '' && data.mnemoic != undefined) {
    curMnemonic = data.mnemonic;
    console.log('blub' + curMnemonic);
  } else if (curMnemonic == undefined)
    curMnemonic = '';
});

chrome.runtime.onMessage.addListener(
  async function(request, sender, sendResponse) {

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
          chrome.storage.local.set({ balance: ((await sdk.account.getTotalBalance()) / 10000000) });
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
          await chrome.storage.local.set({ mnemonic: mnemonic }, function() {
            console.log("mnemonic saved");
          });
          await chrome.storage.local.get(['mnemonic'], function(result) {
            console.log('Value currently is ' + result.mnemonic);
          });
          console.log('Unused address:', address.address);
          await chrome.storage.local.set({ address: address.address }, function() {
            console.log("address saved");
          });
          await chrome.storage.local.get(['address'], function(result) {
            console.log('Value currently is ' + result.address);
          });
          await chrome.storage.local.set({ balance: '0' });
        } catch (e) {
          console.error('Something went wrong:', e);
        } finally {
          sdk.disconnect();
        }
      }
      await createWallet();
      sendResponse({ farewell: "goodbye createWallet" });
    }

    if (request.greeting == "sendFunds") {
      const sdkOpts = {
        network: 'testnet',
        mnemonic: curMnemonic,
      };
      console.log('mnemopncifds: ' + curMnemonic)
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
              satoshis: request.amount,
              // amount: 1
            });
          }
          // TODO check if working
          const result = await sdk.account.broadcastTransaction(transaction);
          console.log('Transaction broadcast!\nTransaction ID:', result);
          chrome.storage.local.set({ balance: ((await sdk.account.getTotalBalance()) / 10000000) });
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

      const createIdentity = async function() {
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

      const registerName = async function() {
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

      const getDocuments = async function() {
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
          alert(JSON.stringify(documents));

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

      const getContract = async function() {
        try {
          let platform = sdk.platform;
          await sdk.isReady();

          // await platform
          //     .contracts
          //     // .get('2KfMcMxktKimJxAZUeZwYkFUsEcAZhDKEpQs8GMnpUse')
          //     .get(request.contractid)
          //     .then((contract) => {
          //       console.dir({ contract }, { depth: 5 });
          //       alert(JSON.stringify(contract));
          //       sendResponse({ farewell: "goodbye getContract", contract: contract });
          //     });
          const contract = await platform.contracts.get(request.contractid);
          // .get('77w8Xqn25HwJhjodrHW133aXhjuTsTv9ozQaYpSHACE3');

          console.dir({ contract }, { depth: 5 });
          alert(JSON.stringify(contract));
          sendResponse({ farewell: "goodbye getContract", contract: contract });

        } catch (e) {
          console.error('Something went wrong:', e);
        } finally {
          sdk.disconnect();
        }

      };
      getContract();
    }

  });