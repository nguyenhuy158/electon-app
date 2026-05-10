.PHONY: help install start test clean i s t c lint format coverage l f cov sc tw w b build pkg package

# Default target
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install  (i)     Install dependencies"
	@echo "  build    (b)     Build the application"
	@echo "  start    (s)     Start the application"
	@echo "  package  (pkg)   Package for macOS (.dmg)"
	@echo "  test     (t)     Run tests"
	@echo "  test-watch (tw/w) Run tests in watch mode"
	@echo "  lint     (l)     Lint code"
	@echo "  format   (f)     Format code"
	@echo "  coverage (cov)   Run tests with coverage"
	@echo "  serve-cov (sc)   Serve coverage report in browser"
	@echo "  clean    (c)     Clean build artifacts and node_modules"
	@echo "  help             Show this help message"

# Shortcuts
i: install
s: start
t: test
c: clean
l: lint
f: format
cov: coverage
sc: serve-cov
tw: test-watch
w: test-watch
b: build
pkg: package

# Install dependencies
install:
	pnpm install

# Start the application (Builds and then runs)
start:
	@$(MAKE) build
	pnpm start

# Build JS and CSS
build:
	@echo "Building project..."
	@pnpm run build
	@echo "Build complete."


# Package for macOS
package:
	pnpm run package

# Run tests
test:
	pnpm test

# Run tests in watch mode
test-watch:
	pnpm run test:watch

# Lint code
lint:
	pnpm run lint

# Format code
format:
	pnpm run format

# Run tests with coverage
coverage:
	pnpm run coverage

# Serve coverage report
serve-cov:
	open coverage/lcov-report/index.html

# Clean build artifacts and node_modules
clean:
	rm -rf node_modules
	rm -rf dist
	rm -rf out
	rm -rf coverage

