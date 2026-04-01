"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamsModule = void 0;
const common_1 = require("@nestjs/common");
const exams_service_1 = require("./exams.service");
const exams_controller_1 = require("./exams.controller");
const bullmq_1 = require("@nestjs/bullmq");
const exams_processor_1 = require("./exams.processor");
const emails_module_1 = require("../emails/emails.module");
const users_module_1 = require("../users/users.module");
let ExamsModule = class ExamsModule {
};
exports.ExamsModule = ExamsModule;
exports.ExamsModule = ExamsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({
                name: 'upload_students_queue',
            }),
            emails_module_1.EmailsModule,
            users_module_1.UsersModule,
        ],
        providers: [exams_service_1.ExamsService, exams_processor_1.UploadProcessor],
        controllers: [exams_controller_1.ExamsController],
    })
], ExamsModule);
//# sourceMappingURL=exams.module.js.map