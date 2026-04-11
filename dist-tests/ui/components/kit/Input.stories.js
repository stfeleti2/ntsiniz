"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Disabled = exports.WithError = exports.WithHelper = exports.Default = void 0;
const Input_1 = require("./Input");
const meta = {
    title: "Kit/Input",
    component: Input_1.Input,
    args: {
        value: "",
        onChangeText: () => { },
        label: "Email",
        placeholder: "you@ntsiniz.app",
    },
};
exports.default = meta;
exports.Default = {
    args: {},
};
exports.WithHelper = {
    args: {
        helperText: "We will send you a one-time sign-in code.",
    },
};
exports.WithError = {
    args: {
        value: "invalid",
        errorText: "Please enter a valid email address",
    },
};
exports.Disabled = {
    args: {
        value: "singer@ntsiniz.app",
        disabled: true,
    },
};
