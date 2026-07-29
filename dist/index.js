"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const app = (0, express_1.default)();
app.use(healthRoutes_1.default);
app.listen(4000, () => {
    console.log('server radi na portu 4000');
});
//# sourceMappingURL=index.js.map