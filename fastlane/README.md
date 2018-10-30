fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew cask install fastlane`

# Available Actions
## iOS
### ios increment
```
fastlane ios increment
```
Increment
### ios test_slack
```
fastlane ios test_slack
```
Tests Slack
### ios test
```
fastlane ios test
```
Runs all the tests
### ios beta
```
fastlane ios beta
```
Submit a new Beta Build to Apple TestFlight

This will also make sure the profile is up to date
### ios deploy
```
fastlane ios deploy
```
Push production version to App Store

This will also make sure the profile is up to date

----

## Android
### android test_slack
```
fastlane android test_slack
```
Tests Slack
### android beta
```
fastlane android beta
```
Submit a new Alpha Build to Google Play Store

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
