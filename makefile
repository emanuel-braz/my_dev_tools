publish:
	@vsce publish

build-publish:
	@npm run compile && vsce package && vsce publish --packagePath deeplink-0.0.26.vsix

setup:
	@sudo npm install -g @vscode/vsce

build:
	@vsce package

install:
	@code --install-extension deeplink-0.0.26.vsix

build-install:
	@npm run compile && vsce package && code --install-extension deeplink-0.0.26.vsix

compile:
	@npm run compile && vsce package