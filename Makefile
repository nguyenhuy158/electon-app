.PHONY: help install run build clean build-ui s i b c

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install (i)   Install Python and Node.js dependencies"
	@echo "  run (s)       Build UI and start the application in development mode"
	@echo "  build (b)     Build a standalone macOS application (.app)"
	@echo "  build-ui      Compile Tailwind CSS"
	@echo "  clean (c)     Remove build artifacts"
	@echo "  help          Show this help message"

# Shortcuts
i: install
s: run
b: build
c: clean

install:
	pip install -r requirements.txt
	pnpm install

build-ui:
	npx tailwindcss -i src/renderer/src/styles.css -o src/renderer/styles.css

run: build-ui
	python src/main/index.py

# Smallest size build for macOS using PyInstaller or just zip
build: build-ui
	@echo "Building for macOS..."
	pip install pyinstaller
	pyinstaller --noconfirm --onefile --windowed --name "QuickClip" \
		--add-data "src/renderer/index.html:src/renderer" \
		--add-data "src/renderer/styles.css:src/renderer" \
		src/main/index.py
	@echo "Build complete. Check dist/QuickClip.app"

clean:
	rm -rf build dist *.spec
