# Dash Chrome-Wallet
Chrome- and Firefox-Extension Cryptocurrency Wallet for [Dash Platform](https://www.dashdevs.org) EvoNet-Testnet environment.

<img src="https://raw.githubusercontent.com/readme55/Dash-Chrome-Wallet/master/chrome-wallet.PNG" width="300" />

## Changelog
- v1.3.1 [Changelog](https://github.com/readme55/Dash-Chrome-Wallet/releases/tag/DashChromeWallet-v1.3.1) (17 May 2020)
- v1.2 [Changelog](https://github.com/readme55/Dash-Chrome-Wallet/releases/tag/DashChromeWallet-v1.2) (9 April 2020)
- v1.1 update to DashJS 2.0 (27 March 2020)
- v1.0 Initial Release

## Description:
Simple GUI Sandbox as Google Chrome Browser Extension for Dash EvoNet-Testnet using [DashJS](https://github.com/dashevo/DashJS) with DAPI (Decentralized API) showing Payments, Usernames, Documents and Contracts features

## Requirements:
- Google Chrome Browser

## Installation (Option 1: suggested)
- Go to [Release page](https://github.com/readme55/Dash-Chrome-Wallet/releases) and download .zip for Windows/MacOS or .tar for Linux and extract directory on disk
- Start "Google Chrome Browser"
- type "chrome://extensions" into addressline or open `Three Dots(Menu) -> More Tools -> Extensions`
- Activate "Developer Mode" in the top right corner
- Click "Load Unpacked" in top left corner and choose extracted directory

## Uninstall (for Option 1)
- type "chrome://extensions" into addressline or open `Three Dots(Menu) -> More Tools -> Extensions`
- Hit "Remove" below the Chrome Wallet extension description

## Installation (Option 2: Quick run, temporary from console)
- need firefox installed
- clone repo
- enter root and run `npm install` and after that `npm run start:firefox`
-> this will start firefox with loaded extension until its closed again

## Usage:
- Click the Dash Extension button in the top right corner and click "Create Wallet"
- Follow Tutorials from the [Dash Development Portal](https://dashplatform.readme.io/docs/tutorial-create-and-fund-a-wallet)
- Use the [Faucet](http://faucet.evonet.networks.dash.org/) to receive Testnet-Coins and [Explorer](http://insight.evonet.networks.dash.org:3001/insight/) to check balance if needed

## Dapp Signing (experimental)
- Create Mnemonic, Identity and Username.
- Activate "Dapp Signing" switch
- Visit [Web-Dapp-Sample](http://wds.dashmachine.net:8082/), insert your Username and displayed PIN from Chrome-Wallet. Hit "Sign Up"
- Chrome Wallet will show Notification + Confirmation Dialog for the request. Confirm the dialog and check status on Web-Dapp-Sample

## TODO:
- import identity/name with mnemonic


