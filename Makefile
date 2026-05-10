.PHONY: install run build clean build-ui

install:
	pip install -r requirements.txt
	pnpm install

build-ui:
	npx tailwindcss -i src/renderer/src/styles.css -o src/renderer/styles.css

run: build-ui
	python python/app.py

# Smallest size build for macOS using PyInstaller or just zip
build: build-ui
	@echo "Building for macOS..."
	pip install pyinstaller
	pyinstaller --noconfirm --onefile --windowed --name "QuickClip" \
		--add-data "src/renderer/index.html:src/renderer" \
		--add-data "src/renderer/styles.css:src/renderer" \
		python/app.py
	@echo "Build complete. Check dist/QuickClip.app"

clean:
	rm -rf build dist *.spec
