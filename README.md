# Xazab Chrome Wallet
Cryptocurrency-Dapp Wallet for [Xazab Platform](https://xazab.xyz). Create an identity and username. Fetch data contracts and documents. Connect with Dapps using Push Notifications.
Browser-Extension (Chrome, Firefox, Brave, Edge) or Standalone Desktop versions (Windows, Linux, Mac) available.

**Support my work:** XgQpScGHiEWFXxFiJuEKSY2VVpumaTUMkN

<!-- <p align="center"> -->
<img src="https://raw.githubusercontent.com/xazab/Xazab-Chrome-Wallet/master/chrome-wallet.PNG" width="400" />
<!-- </p> -->


## Description:
Cryptocurrency-Dapp Wallet for Xazab Platform (EvoNet-Testnet) using [XazabJS](https://github.com/xazab/js-xazab-sdk) and DAPI (Decentralized API). Create an identity and username. Fetch data contracts and documents. Connect with Dapps using Push Notifications.

## Requirements:
- None

## Installation (Option 1: Google Chrome Extension)
- Go to [Release page](https://github.com/xazab/Xazab-Chrome-Wallet/releases) and download `Xazab-Chrome-Wallet-Extension-v1.x.x.zip` (all OS)
and extract directory on disk
- Start "Google Chrome Browser"
- type "chrome://extensions" into addressline or open `Three Dots(Menu) -> More Tools -> Extensions`
- Activate "Developer Mode" in the top right corner
- Click "Load Unpacked" in top left corner and choose extracted directory

## Debug
In case of any problems or errors open the Debug Console:
- type "chrome://extensions" into addressline or open `Three Dots(Menu) -> More Tools -> Extensions`
- Click on "background page" below the "Dash Chrome Wallet" title

## Uninstall (for Option 1)
- type "chrome://extensions" into addressline or open `Three Dots(Menu) -> More Tools -> Extensions`
- Hit "Remove" below the Chrome Wallet extension description

## Installation (Option 2: Desktop version)
- Go to [Release page](https://github.com/xazab/Xazab-Chrome-Wallet/releases) and download `Xazab-Chrome-Wallet-Desktop-v1.x.x-win-x86.zip` (e.g. for Windows)
and extract directory on disk
- Open directory and execute `Xazab-Chrome-Wallet-Desktop.exe`

## Installation (Option 3: Quick run, temporary from console)
- need firefox installed
- clone repo
- enter root and run `npm install` and after that `npm run start:firefox`
-> this will start firefox with loaded extension until its closed again

## Usage:
- Click the Dash Extension button in the top right corner and click "Create Wallet"
- Follow Tutorials from the [Xazab Development Portal](https://xazabplatform.readme.io/docs/tutorial-create-and-fund-a-wallet)
- Use the [Faucet](http://testnet-452625393.us-west-2.elb.amazonaws.com/) to receive Testnet-Coins and [Explorer](http://testnet-452625393.us-west-2.elb.amazonaws.com:3001/insight/) to check balance if needed

## Push Notifications
- Create Mnemonic, Identity and Username.
- Activate "Push Notifications" switch
- Visit [Sample Browser Dapps](http://readme.dashdevs.org/sample-dapps/), Sign-in with the registered Dash-Username. 
- Chrome Wallet will show Notification + Confirmation Dialog for the request. Confirm the dialog to get logged in. 
- Now start the Dapp and submit some data. You will receive a Confirmation dialog inside Chrome Wallet for each submission.

