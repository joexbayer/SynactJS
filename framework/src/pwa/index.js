import { PWAService } from "./pwa-service.js";

export function createPWAService(options = {}) {
    return new PWAService(options);
}

export const pwaHelpers = {
    createPWAService,
    PWAService
};

export {
    PWAService
};
