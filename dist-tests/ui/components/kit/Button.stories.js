"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Disabled = exports.Loading = exports.Ghost = exports.Secondary = exports.Primary = void 0;
const Button_1 = require("./Button");
const meta = {
    title: "Kit/Button",
    component: Button_1.Button,
    args: {
        label: "Start Session",
    },
};
exports.default = meta;
exports.Primary = {};
exports.Secondary = {
    args: {
        variant: "secondary",
        label: "Open Preview",
    },
};
exports.Ghost = {
    args: {
        variant: "ghost",
        label: "Skip",
    },
};
exports.Loading = {
    args: {
        loading: true,
    },
};
exports.Disabled = {
    args: {
        disabled: true,
    },
};
