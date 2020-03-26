let connectBtn = document.getElementById('connectBtn');
let createBtn = document.getElementById('createBtn');
let addressText = document.getElementById('addressText');
let balanceText = document.getElementById('balanceText');
let balanceBtn = document.getElementById('balanceBtn');
let sendBtn = document.getElementById('sendBtn');
let amountText = document.getElementById('amountText');
let toAddressText = document.getElementById('toAddressText');
let identityBtn = document.getElementById('identityBtn');
let identityText = document.getElementById('identityText');
let nameBtn = document.getElementById('nameBtn');
let nameText = document.getElementById('nameText');
let mnemonicText = document.getElementById('mnemonicText');
let mnemonicBtn = document.getElementById('mnemonicBtn');

let exampleQuerySelector = document.getElementById('exampleQuerySelector');
let recordLocatorText = document.getElementById('recordLocatorText');
let queryObjectText = document.getElementById('queryObjectText');
let getDocumentsBtn = document.getElementById('getDocumentsBtn');

let contractText = document.getElementById('contractText');
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
		identityBtn.disabled = true;
	identityText.value = data.identity;
});
chrome.storage.local.get('name', function (data) {
	if (data.name != '') {
		nameText.readOnly = true;
		nameBtn.disabled = true;
	}
	nameText.value = data.name;
});
// import not working for identities yet
// mnemonicBtn.disabled = true;

// connect
document.addEventListener('DOMContentLoaded', function () {
	var myButton = document.getElementById('connectBtn');
	myButton.addEventListener('click', function () {

		chrome.runtime.sendMessage({ greeting: "connect" }, function (response) {
			chrome.extension.getBackgroundPage().console.log(response.farewell);
		});

	}, false);
}, false);

// getContract
document.addEventListener('DOMContentLoaded', function () {
	var myButton = document.getElementById('getContractBtn');
	myButton.addEventListener('click', function () {

		chrome.runtime.sendMessage({ greeting: "getContract", contractid: contractText.value }, function (response) {

			contractText.value = response.contract;
			chrome.extension.getBackgroundPage().console.log(response.farewell);
		});

	}, false);
}, false);

// getDocuments
document.addEventListener('DOMContentLoaded', function () {
	var myButton = document.getElementById('getDocumentsBtn');
	myButton.addEventListener('click', function () {

		chrome.runtime.sendMessage({ greeting: "getDocuments", recordLocator: recordLocatorText.value, queryObject: queryObjectText.value }, function (response) {

			queryObjectText.value = response.document;
			chrome.extension.getBackgroundPage().console.log(response.farewell);
		});

	}, false);
}, false);

document.addEventListener('DOMContentLoaded', function () {
	exampleQuerySelector.addEventListener("change", function () {
		if (exampleQuerySelector.value == "Example 1") {
			recordLocatorText.value = 'dpns.domain';
			queryObjectText.value = "{ where: [\n" +
				"['normalizedParentDomainName', '==', 'dash']\n" +
				"],\n" +
				"startAt: 0 }\n";
			contractText.value = '77w8Xqn25HwJhjodrHW133aXhjuTsTv9ozQaYpSHACE3';
		}
	});
}, false);


// registerName
document.addEventListener('DOMContentLoaded', function () {
	var myButton = document.getElementById('nameBtn');
	myButton.addEventListener('click', function () {

		chrome.runtime.sendMessage({ greeting: "registerName", name: nameText.value }, function (response) {

			chrome.storage.local.get('name', function (data) {
				nameText.value = data.name;
			});
			nameText.readOnly = true;
			nameBtn.disabled = true;
			chrome.extension.getBackgroundPage().console.log(response.farewell);
		});

	}, false);
}, false);

// registerIdentity
document.addEventListener('DOMContentLoaded', function () {
	var myButton = document.getElementById('identityBtn');
	myButton.addEventListener('click', function () {

		chrome.runtime.sendMessage({ greeting: "registerIdentity" }, function (response) {

			if(balanceText.value == '0') {
				alert('No funds detected!\nNeed to pay some fee to create identity.')
			}

			chrome.storage.local.get('identity', function (data) {
				identityText.value = data.identity;
			});
			identityBtn.disabled = true;
			chrome.extension.getBackgroundPage().console.log(response.farewell);
		});

	}, false);
}, false);

// createWallet
document.addEventListener('DOMContentLoaded', function () {
	var myButton = document.getElementById('createBtn');
	myButton.addEventListener('click', function () {

		chrome.runtime.sendMessage({ greeting: "createWallet" }, function (response) {
			
			// TODO: need to use Promise for response somehow
			if(response == null) {
				chrome.extension.getBackgroundPage().console.log("Something went wrong")
			}
			chrome.extension.getBackgroundPage().console.log("blub2")
			
			chrome.storage.local.get('mnemonic', function (data) {
				mnemonicText.value = data.mnemonic;
			});
			chrome.storage.local.get('address', function (data) {
				addressText.value = data.address;
			});
			chrome.storage.local.get('balance', function (data) {
				balanceText.value = data.balance;
			});
			createBtn.disabled = true;
			chrome.extension.getBackgroundPage().console.log(response.farewell);
		});

		// return true from the event listener to indicate you wish to send a response asynchronously
		// (this will keep the message channel open to the other end until sendResponse is called).
		return true;

	}, false);
}, false);

// importMnemonic
document.addEventListener('DOMContentLoaded', function () {
	var myButton = document.getElementById('mnemonicBtn');
	myButton.addEventListener('click', function () {

		chrome.runtime.sendMessage({ greeting: "importMnemonic", mnemonic: mnemonicText.value }, function (response) {

			chrome.storage.local.get('address', function (data) {
				addressText.value = data.address;
			});
			chrome.storage.local.get('balance', function (data) {
				balanceText.value = data.balance;
			});
			//addressText.value = response.address;
			//balanceText.value = response.balance;

			chrome.extension.getBackgroundPage().console.log(response.farewell);
		});

	}, false);
}, false);

// getBalance
document.addEventListener('DOMContentLoaded', function () {
	var myButton = document.getElementById('balanceBtn');
	myButton.addEventListener('click', function () {

		chrome.runtime.sendMessage({ greeting: "getBalance" }, function (response) {

			chrome.storage.local.get('balance', function (data) {
				balanceText.value = data.balance;
			});

			chrome.extension.getBackgroundPage().console.log(response.farewell);
		});

	}, false);
}, false);

// sendFunds
document.addEventListener('DOMContentLoaded', function () {
	var myButton = document.getElementById('sendBtn');
	myButton.addEventListener('click', function () {

		chrome.runtime.sendMessage({ greeting: "sendFunds", toAddress: toAddressText.value, amount: amountText.value }, function (response) {

			chrome.storage.local.get('balance', function (data) {
				balanceText.value = data.balance;
			});

			chrome.extension.getBackgroundPage().console.log(response.farewell);
		});

	}, false);
}, false);

