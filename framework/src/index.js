import SynactJSCore from "./core.js";
import { SynactJS, attachBrowserGlobals, attachCommonJSExports } from "./public-api.js";

attachBrowserGlobals();
attachCommonJSExports();

export { SynactJSCore, SynactJS };
