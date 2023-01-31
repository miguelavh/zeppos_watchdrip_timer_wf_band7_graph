import {getGlobal} from "../../shared/global";

import {
    WATCHDRIP_APP_ID
} from "../config/global-constants";

import {str2json} from "../../shared/data";

import {MessageBuilder} from "../../shared/message";

import {
    Commands,
    DATA_AOD_TIMER_UPDATE_INTERVAL_MS,
    DATA_AOD_UPDATE_INTERVAL_MS,
    DATA_STALE_TIME_MS,
    DATA_TIMER_UPDATE_INTERVAL_MS,
    DATA_UPDATE_INTERVAL_MS,
    XDRIP_UPDATE_INTERVAL_MS
} from "../config/constants";

import {WatchdripData} from "./watchdrip-data";

let {messageBuilder} = getApp()._options.globalData;

export const logger = Logger.getLogger("wf-wathchdrip");

let watchdrip, debug

export class Watchdrip {
    constructor() {
        this.screenType = hmSetting.getScreenType();

        this.updateIntervals = this.isAOD() ? DATA_AOD_UPDATE_INTERVAL_MS : DATA_UPDATE_INTERVAL_MS;

        this.globalNS = getGlobal();
        debug = this.globalNS.debug;
        this.timeSensor = hmSensor.createSensor(hmSensor.id.TIME);
        this.watchdripData = new WatchdripData(this.timeSensor);

        this.lastInfoUpdate = 0;
        this.lastUpdateAttempt = null;
        this.lastUpdateSucessful = false;
        this.updatingData = false;

        this.intervalTimer = null;

        this.connectionActive = false;
        //this.checkConfigUpdate();
        //this.readInfo();
    }

    start() { 
        watchdrip = this.globalNS.watchdrip;
        //this.checkUpdates();
        // this.updateValuesWidget();
        //Monitor watchface activity in order to recreate connection
        if (this.isAOD()) {
            //watchdrip.widgetDelegateCallbackResumeCall();
            logger.log("IS_AOD_TRUE");
            this.startTimerDataUpdates();
        }
        else {
            logger.log("IS_AOD_FALSE");
            hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
                resume_call: this.widgetDelegateCallbackResumeCall,
                pause_call: this.widgetDelegateCallbackPauseCall,
            });
        }
    }

    startTimerDataUpdates() {
        if (this.intervalTimer !== null) return; //already started
        
        if (this.isAOD()) {
            logger.log("startTimerDataUpdates, interval: " + DATA_AOD_TIMER_UPDATE_INTERVAL_MS);
            this.intervalTimer = this.globalNS.setInterval(() => {
                this.checkUpdates();
            }, DATA_AOD_TIMER_UPDATE_INTERVAL_MS);
        }
    }

    stopTimerDataUpdates() {
        if (this.intervalTimer !== null) {
            logger.log("stopTimerDataUpdates");
            this.globalNS.clearInterval(this.intervalTimer);
            this.intervalTimer = null;
        }
    }

    isAOD(){
        return  this.screenType === hmSetting.screen_type.AOD;
    }

    checkUpdates() {
        let fetchNewData = false;

        logger.log("CHECK_UPDATES");
        
        if (this.updatingData) {
            return;
        }

        let utc = this.timeSensor.utc;
        if (this.lastInfoUpdate === 0) {
            if (this.lastUpdateAttempt === null) {
                logger.log("initial fetch");
                fetchNewData = true;
            }
        } else {
            if (!this.lastUpdateSucessful) {
                if (this.lastUpdateAttempt !== null){
                    if ((utc - this.lastUpdateAttempt > DATA_STALE_TIME_MS)) {
                        logger.log("side app not responding, force update again");
                        fetchNewData = true;
                    }
                }
            }

            if (utc - this.lastInfoUpdate > DATA_UPDATE_INTERVAL_MS) {
                logger.log("data older than watch data update interval, update again");
                fetchNewData = true;
            }

            if (utc - this.watchdripData.getBg().time > XDRIP_UPDATE_INTERVAL_MS) {
                logger.log("data older than sensor update interval, update again");
                fetchNewData = true;
            }
        }

        if(fetchNewData){
            logger.log("CHECK_UPDATES_FETCH");
            this.fetchInfo();
        }

        this.updateWidgets();
    }

    //connect watch with side app
    initConnection() {
        logger.log("initConnection");
        this.connectionActive = true;
        const appId = WATCHDRIP_APP_ID;
        messageBuilder = new MessageBuilder({appId});
        messageBuilder.connect();
    }

    dropConnection(){
        if (this.connectionActive) {
            logger.log("dropConnection");
            messageBuilder.disConnect();
            this.connectionActive = false;
        }
    }

    setUpdateValueWidgetCallback(callback){
        this.updateValueWidgetCallback = callback;
    }

    setUpdateTimesWidgetCallback(callback){
        this.updateTimesWidgetCallback = callback;
    }

    setOnUpdateStartCallback(callback){
        this.onUpdateStartCallback = callback;
    }

    setOnUpdateFinishCallback(callback){
        this.onUpdateFinishCallback = callback;
    }

    updateWidgets() {
        logger.log("updateWidgets");
        this.updateValuesWidget();
        this.updateTimesWidget();
    }

    updateValuesWidget() {
        if (typeof this.updateValueWidgetCallback === "function"){
            logger.log("updateValuesWidget");
            this.updateValueWidgetCallback(this.watchdripData);
        }
    }

    updateTimesWidget() {
        if (typeof this.updateTimesWidgetCallback === "function"){
            logger.log("updateTimesWidget");
            this.updateTimesWidgetCallback(this.watchdripData);
        }
    }

    drawGraph() {
    }

    fetchInfo() {
        this.lastUpdateAttempt = this.timeSensor.utc;
        this.lastUpdateSucessful = false;

        if (!this.connectionActive) {
            this.initConnection();
        }

        logger.log("fetchInfo");
        if (messageBuilder.connectStatus() === false) {
            logger.log("No bt connection");
            return;
        }
        logger.log("bt connection ok");
        this.updatingData = true;
        if (typeof this.onUpdateStartCallback === "function"){
            this.onUpdateStartCallback();
        }

        messageBuilder.request({
            method: Commands.getInfo,
        }, {
            timeout: 10000
        }).then((data) => {
            logger.log("received data");
            const {result: info = {}} = data;
            logger.log(info);
            try {
                if (info.error) {
                    logger.log("error:" + info.message);
                    return;
                }
                const dataInfo = str2json(info);

                this.watchdripData.setData(dataInfo);
                this.watchdripData.updateTimeDiff();

                this.lastInfoUpdate = this.timeSensor.utc;
                this.lastUpdateSucessful = true;
                this.updateWidgets();
            } catch (e) {
                logger.log("error:" + e);
            }
        }).catch((error) => {
            logger.log("fetch error:" + error);
        }).finally(() => {
            this.updatingData = false;
            if (typeof this.onUpdateFinishCallback === "function"){
                this.onUpdateFinishCallback(this.lastUpdateSucessful);
            }
            //if (this.isAOD()){
                this.dropConnection();
            //}
        });
    }

    // REMINDER: Callbacks need watchdrip instead of this. this is not working.
    /*Callback which is called  when watchface is active  (visible)*/
    widgetDelegateCallbackResumeCall() {
        logger.log("resume_call");
        watchdrip.updatingData = false;
        watchdrip.checkUpdates();
        logger.log("resume_callend");
    }

    /*Callback which is called  when watchface deactivating (not visible)*/
    widgetDelegateCallbackPauseCall() {
        logger.log("pause_call");
        watchdrip.updatingData = false;
        if (typeof watchdrip.onUpdateFinishCallback === "function"){
            watchdrip.onUpdateFinishCallback(watchdrip.lastUpdateSucessful);
        }
        watchdrip.dropConnection();
    }

    destroy() {
        this.stopTimerDataUpdates();
        this.dropConnection();
    }
}