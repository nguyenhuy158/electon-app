.PHONY: help install start test clean i s t c lint format coverage l f cov sc

# Default target
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install  (i)   Install dependencies"
	@echo "  start    (s)   Start the application"
	@echo "  test     (t)   Run tests"
	@echo "  lint     (l)   Lint code"
	@echo "  format   (f)   Format code"
	@echo "  coverage (cov) Run tests with coverage"
	@echo "  serve-cov (sc) Serve coverage report in browser"
	@echo "  clean    (c)   Clean build artifacts and node_modules"
	@echo "  help           Show this help message"

# Shortcuts
i: install
s: start
t: test
c: clean
l: lint
f: format
cov: coverage
sc: serve-cov

# Install dependencies
install:
	pnpm install

# Start the application
start:
	pnpm start

# Run tests
test:
	pnpm test

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

