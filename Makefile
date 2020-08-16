
TARGET_DIR = src/target
NODE_DIR := $(TARGET_DIR)/node
NODE_DIR_ABS := $(CURDIR)/$(NODE_DIR)
NODE_MODULES_DIR := $(NODE_DIR)/lib/node_modules
NODE_MODULES_DIR_ABS := $(CURDIR)/$(NODE_MODULES_DIR)


$(TARGET_DIR):
		mkdir -p $(TARGET_DIR)

$(NODE_DIR): | $(TARGET_DIR)
	cd $(TARGET_DIR) && curl 'https://nodejs.org/dist/v14.8.0/node-v14.8.0-linux-x64.tar.xz' | tar xJ \
				  && mv node-v14.8.0-linux-x64 node
	touch $@


$(TARGET_DIR)/env.sh: $(NODE_DIR)
	echo 'export PATH="$(NODE_DIR_ABS)/bin:$(PATH)"' >> $(TARGET_DIR)/env.sh
	echo 'export NODE_PATH="$(NODE_MODULES_DIR_ABS)"' >> $(TARGET_DIR)/env.sh

src/node_modules: $(TARGET_DIR)/env.sh src/package.json src/package-lock.json
	bash -c "source $(TARGET_DIR)/env.sh && cd src && npm install"
	touch src/node_modules

install: src/node_modules

compile: src/node_modules
	bash -c "source $(TARGET_DIR)/env.sh && cd src && npx tsc --sourceMap"


# dep: $(MODULES)

.PHONY: test clean install compile
