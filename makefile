publish:
	@vsce publish

setup:
	@sudo npm install -g @vscode/vsce

build:
	@vsce package

install:
	@code --install-extension deeplink-0.0.18.vsix

build-install:
	@vsce package && code --install-extension deeplink-0.0.18.vsix