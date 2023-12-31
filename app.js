import "./shared/device-polyfill";
import { MessageBuilder } from "./shared/message";
import {WATCHDRIP_APP_ID} from "./utils/config/global-constants";

const appId = WATCHDRIP_APP_ID;
const messageBuilder = new MessageBuilder({ appId });

App({
  globalData: {
    messageBuilder: messageBuilder,
    watchDrip: { }
  },
  onCreate(options) {
    console.log("wf-app on create invoke");
  },

  onDestroy(options) {
    console.log("wf-app on destroy invoke");
  },
});
