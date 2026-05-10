.PHONY: help install run build clean build-ui s i b c t l f cov sc dev

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install (i)   Install Python and Node.js dependencies"
	@echo "  run (s)       Build UI and start the application in development mode"
	@echo "  dev           Alias for run"
	@echo "  build (b)     Build a standalone macOS application (.app) and DMG"
	@echo "  build-ui      Compile Tailwind CSS"
	@echo "  test (t)      Run Python tests using pytest"
	@echo "  lint (l)      Lint code using ruff"
	@echo "  format (f)    Format code using ruff"
	@echo "  cov           Run tests with coverage report"
	@echo "  sc            Show coverage report in browser"
	@echo "  clean (c)     Remove build artifacts"
	@echo "  help          Show this help message"

# Shortcuts
i: install
s: run
b: build
c: clean
t: test
l: lint
f: format
dev:
	npx tailwindcss -i src/renderer/src/styles.css -o src/renderer/styles.css --watch &
	./.venv/bin/python src/main.py

install:
	uv venv .venv --clear
	uv pip install -r requirements.txt
	pnpm install

build-ui:
	npx tailwindcss -i src/renderer/src/styles.css -o src/renderer/styles.css

run: build-ui
	./.venv/bin/python src/main.py

test:
	./.venv/bin/pytest src

lint:
	./.venv/bin/ruff check .
	npx htmlhint src/renderer/index.html

format:
	./.venv/bin/ruff format .
	pnpm prettier --write src/renderer/index.html

cov:
	./.venv/bin/pytest --cov=src src --cov-report=term-missing --cov-report=html

sc:
	open htmlcov/index.html

# Smallest size build for macOS using PyInstaller or just zip
build: build-ui
	@echo "Building for macOS..."
	uv pip install pyinstaller
	./.venv/bin/pyinstaller --noconfirm --onefile --windowed --name "QuickClip" \
		--icon "icon.png" \
		--add-data "src/renderer/index.html:src/renderer" \
		--add-data "src/renderer/app.js:src/renderer" \
		--add-data "src/renderer/styles.css:src/renderer" \
		--add-data "icon.png:." \
		src/main.py
	@echo "Creating DMG..."
	rm -f dist/QuickClip.dmg
	rm -rf dist/dmg_temp
	mkdir -p dist/dmg_temp
	cp -R dist/QuickClip.app dist/dmg_temp/
	ln -s /Applications dist/dmg_temp/Applications
	hdiutil create -volname "QuickClip" -srcfolder dist/dmg_temp -ov -format UDZO dist/QuickClip.dmg
	rm -rf dist/dmg_temp
	@echo "DMG created at dist/QuickClip.dmg"


clean:
	rm -rf build dist *.spec .venv src/renderer/styles.css htmlcov
