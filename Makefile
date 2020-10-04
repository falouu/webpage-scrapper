
TARGET_DIR = src/target
NODE_DIR := $(TARGET_DIR)/node
NODE_DIR_ABS := $(CURDIR)/$(NODE_DIR)
NODE_MODULES_DIR := $(NODE_DIR)/lib/node_modules
NODE_MODULES_DIR_ABS := $(CURDIR)/$(NODE_MODULES_DIR)
GO_DIR := $(TARGET_DIR)/go
GO_DIR_ABS := $(CURDIR)/$(GO_DIR)
UPX_BIN := $(TARGET_DIR)/upx-3.96-amd64_linux/upx
UPX_BIN_ABS := $(CURDIR)/$(UPX_BIN)

$(TARGET_DIR):
		mkdir -p $(TARGET_DIR)

$(NODE_DIR): | $(TARGET_DIR)
	cd $(TARGET_DIR) && curl 'https://nodejs.org/dist/v14.8.0/node-v14.8.0-linux-x64.tar.xz' | tar xJ \
				  && mv node-v14.8.0-linux-x64 node
	touch $@

$(GO_DIR): | $(TARGET_DIR)
	cd $(TARGET_DIR) && curl 'https://dl.google.com/go/go1.15.linux-amd64.tar.gz' | tar xz
	touch $@

$(UPX_BIN): | $(TARGET_DIR)
	cd $(TARGET_DIR) && curl -L https://github.com/upx/upx/releases/download/v3.96/upx-3.96-amd64_linux.tar.xz | tar -x --xz
	touch $@

$(TARGET_DIR)/env.sh: $(UPX_BIN) | $(NODE_DIR) $(GO_DIR)
	echo "" > $(TARGET_DIR)/env.sh
	echo 'export PATH="$(NODE_DIR_ABS)/bin:$(GO_DIR_ABS)/bin:$(GO_DIR_ABS)/gopath/bin:$${PATH}"' >> $(TARGET_DIR)/env.sh
	echo 'export NODE_PATH="$(NODE_MODULES_DIR_ABS)"' >> $(TARGET_DIR)/env.sh
	echo 'export GOROOT="$(GO_DIR_ABS)"' >> $(TARGET_DIR)/env.sh
	echo 'export GOPATH="$(GO_DIR_ABS)/gopath"' >> $(TARGET_DIR)/env.sh
	echo 'export UPX_BIN="$(UPX_BIN_ABS)"' >> $(TARGET_DIR)/env.sh

$(GO_DIR)/gopath/pkg/mod: $(GO_DIR) $(TARGET_DIR)/env.sh src/go/go.*
	bash -c "source $(TARGET_DIR)/env.sh && cd src/go && go mod download"

$(GO_DIR)/gopath/bin/packr2: $(GO_DIR) $(TARGET_DIR)/env.sh src/go/go.*
	bash -c "source $(TARGET_DIR)/env.sh && cd src/go && go get github.com/gobuffalo/packr/v2/packr2@v2.8.0"

go_all = $(GO_DIR)/gopath/pkg/mod $(GO_DIR)/gopath/bin/packr2

src/node_modules: $(TARGET_DIR)/env.sh src/package.json src/package-lock.json
	bash -c "source $(TARGET_DIR)/env.sh && cd src && npm install"
	touch src/node_modules

npm_install: src/node_modules

TS_DIST := $(shell find src/target/src/ -type f)
TS_SRC := $(shell find src/ts/ -type f) 

$(TS_DIST): src/node_modules $(go_all) $(TS_SRC) $(UPX_BIN)
	bash -c "source $(TARGET_DIR)/env.sh && cd src && npx tsc --sourceMap"

compile: $(TS_DIST)

# dep: $(MODULES)

.PHONY: test clean npm_install compile
