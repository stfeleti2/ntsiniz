"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.coreWarn = exports.coreError = void 0;
var logger_1 = require("@/core/observability/logger");
Object.defineProperty(exports, "coreError", { enumerable: true, get: function () { return logger_1.coreError; } });
Object.defineProperty(exports, "coreWarn", { enumerable: true, get: function () { return logger_1.coreWarn; } });
Object.defineProperty(exports, "logger", { enumerable: true, get: function () { return logger_1.logger; } });
