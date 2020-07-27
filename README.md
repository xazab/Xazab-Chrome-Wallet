# Dash Chrome-Wallet
Cryptocurrency Wallet for [Dash Platform](https://www.dashdevs.org) EvoNet-Testnet environment. Browser-Extension (Chrome, Firefox, Brave, Edge) or Standalone Desktop versions (Windows, Linux, Mac) available.

**Support my work:** XgQpScGHiEWFXxFiJuEKSY2VVpumaTUMkN (Mainnet Dash Address)


<img src="https://raw.githubusercontent.com/readme55/Dash-Chrome-Wallet/master/chrome-wallet.PNG" width="300" />

## Major Changelogs
- v1.4.0 [Changelog](https://github.com/readme55/Dash-Chrome-Wallet/releases/tag/DashChromeWallet-v1.4.0) (3. July 2020) 
- v1.3.1 [Changelog](https://github.com/readme55/Dash-Chrome-Wallet/releases/tag/DashChromeWallet-v1.3.1) (17 May 2020)
- v1.2 [Changelog](https://github.com/readme55/Dash-Chrome-Wallet/releases/tag/DashChromeWallet-v1.2) (9 April 2020)
- v1.1 update to DashJS 2.0 (27 March 2020)
- v1.0 Initial Release

## Description:
Simple GUI Sandbox as Google Chrome Browser Extension for Dash EvoNet-Testnet using [DashJS](https://github.com/dashevo/DashJS) with DAPI (Decentralized API) showing Payments, Usernames, Documents and Contracts features.

## Requirements:
- None

## Installation (Option 1: Google Chrome Extension)
- Go to [Release page](https://github.com/readme55/Dash-Chrome-Wallet/releases) and download `Dash-Chrome-Wallet-Extension-v1.x.x.zip` (all OS)
and extract directory on disk
- Start "Google Chrome Browser"
- type "chrome://extensions" into addressline or open `Three Dots(Menu) -> More Tools -> Extensions`
- Activate "Developer Mode" in the top right corner
- Click "Load Unpacked" in top left corner and choose extracted directory

## Uninstall (for Option 1)
- type "chrome://extensions" into addressline or open `Three Dots(Menu) -> More Tools -> Extensions`
- Hit "Remove" below the Chrome Wallet extension description

## Installation (Option 2: Desktop version)
- Go to [Release page](https://github.com/readme55/Dash-Chrome-Wallet/releases) and download `Dash-Chrome-Wallet-Desktop-v1.x.x-win-x86.zip` (e.g. for Windows)
and extract directory on disk
- Open directory and execute `Dash-Chrome-Wallet-Desktop.exe`

## Installation (Option 3: Quick run, temporary from console)
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
- Activate "Simple Dapp Signing" switch
- Visit [Sample Browser Dapps](http://readme-dapps.dashdevs.org), Sign-in with your Username from Chrome-Wallet. 
- Chrome Wallet will show Notification + Confirmation Dialog for the request. Confirm the dialog to get logged in. 
- Now start the Dapp and submit some data. You will receive a Confirmation dialog inside Chrome Wallet for each submission.

## TODO:
- import identity/name with mnemonic


