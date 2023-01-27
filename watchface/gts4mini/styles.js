import {img,range} from "../../utils/helper";
import {Colors} from "../../utils/config/constants";

const bgNumArr = range(10).map((v) => {
    return img(`bgNum/${v}.png`);
});

const bgNumAODArr = range(10).map((v) => {
    return img(`bgNumAOD/${v}.png`);
});

const bigNumArr = range(10).map((v) => {
    return img(`bigNum/${v}.png`);
});

const bigNumAODArr = range(10).map((v) => {
    return img(`bigNumAOD/${v}.png`);
});

const smallNumArr = range(10).map((v) => {
    return img(`smallNum/${v}.png`);
});

const smallNumAccentArr = range(10).map((v) => {
    return img(`smallNumAccent/${v}.png`);
});

const weekEnArr = range(1, 8).map((v) => {
    return img(`week_en/${v}.png`);
});

const weatherArr = range(29).map((v) => {
    return img(`weather/${v}.png`);
});

const moonArr = range(1, 30).map((v) => {
    return img(`moon/${v}.png`);
});


export const DIGITAL_TIME = {
    hour_startX: px(84),
    hour_startY: px(6),
    hour_zero: true,
    hour_space: 2,
    hour_align: hmUI.align.CENTER_H,
    hour_array: bigNumArr,
    hour_unit_sc: img('bigNum/sp.png'), // colon
    hour_unit_tc: img('bigNum/sp.png'),
    hour_unit_en: img('bigNum/sp.png'),
    minute_zero: true,
    minute_space: 2,
    minute_align: hmUI.align.CENTER_H,
    minute_array: bigNumArr,
    minute_follow: 1,
    am_x: px(258),
    am_y: px(42),
    am_sc_path: img('bigNum/am.png'),
    am_en_path: img('bigNum/am.png'),
    pm_x: px(258),
    pm_y: px(42),
    pm_sc_path: img('bigNum/pm.png'),
    pm_en_path: img('bigNum/pm.png'),
    show_level: hmUI.show_level.ONLY_NORMAL
};

export const DIGITAL_TIME_AOD = {
    hour_startX: px(54),
    hour_startY: px(122),
    hour_array: bigNumAODArr,
    hour_unit_sc: img('bigNumAOD/sp.png'), // colon
    hour_unit_tc: img('bigNumAOD/sp.png'),
    hour_unit_en: img('bigNumAOD/sp.png'),
    minute_array: bigNumAODArr,
    am_sc_path: img('bigNumAOD/am.png'),
    am_en_path: img('bigNumAOD/am.png'),
    am_x: px(281),
    am_y: px(151),
    pm_sc_path: img('bigNumAOD/pm.png'),
    pm_en_path: img('bigNumAOD/pm.png'),
    pm_x: px(281),
    pm_y: px(151),
    show_level: hmUI.show_level.ONAL_AOD
};

const dateX = px(163);
const dateY = px(75);
const dateFontWidth = 16; // widest image in font array
const dateDotWidth = 7;
const dateFontSpacing = 1;
export const DATE_TEXT_IMG = {
    day_startX: px(dateX),
    day_startY: px(dateY),
    day_zero: 1,
    day_space: dateFontSpacing,
    day_follow: 0,
    day_align: hmUI.align.LEFT,
    day_sc_array: smallNumAccentArr,
    day_tc_array: smallNumAccentArr,
    day_en_array: smallNumAccentArr,
    day_unit_sc: img('smallNumAccent/d.png'), // dot
    day_unit_tc: img('smallNumAccent/d.png'),
    day_unit_en: img('smallNumAccent/d.png'),
    month_startX: px(dateX + (dateFontWidth * 2) + dateDotWidth + (dateFontSpacing * 3)),
    month_startY: px(dateY),
    month_follow: 0,
    month_zero: 1,
    month_space: dateFontSpacing,
    month_align: hmUI.align.LEFT,
    month_sc_array: smallNumAccentArr,
    month_tc_array: smallNumAccentArr,
    month_en_array: smallNumAccentArr,
    month_unit_sc: img('smallNumAccent/d.png'), // dot
    month_unit_tc: img('smallNumAccent/d.png'),
    month_unit_en: img('smallNumAccent/d.png'),
    show_level: hmUI.show_level.ONLY_NORMAL
};

export const WEEK_DAYS_IMG = {
    x: px(101),
    y: px(75),
    week_en: weekEnArr,
    week_tc: weekEnArr,
    week_sc: weekEnArr,
    show_level: hmUI.show_level.ONLY_NORMAL
};

export const BG_VALUE_NO_DATA_TEXT = {
    x: px(114),
    y: px(122),
    w: px(108),
    h: px(50),
    color: Colors.white,
    text_size: px(34),
    align_h: hmUI.align.RIGHT,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
    text: 'No data',
    show_level: hmUI.show_level.ONLY_NORMAL
};

export const BG_VALUE_TEXT_IMG = {
    x: px(114),
    y: px(125),
    w: px(108),
    align_h: hmUI.align.CENTER_H,
    dot_image: img('bgNum/d.png'),
    font_array: bgNumArr,
    text: '0',
    visible: false,
    h_space:1,
    show_level: hmUI.show_level.ONLY_NORMAL
};

export const BG_VALUE_TEXT_IMG_AOD = {
    x: px(65),
    y: px(201),
    w: px(206),
    dot_image: img('bgNumAOD/d.png'),
    font_array: bgNumAODArr,
    show_level: hmUI.show_level.ONAL_AOD
};

export const BG_TIME_TEXT = {
    x: px(111),
    y: px(217),
    w: px(114),
    h: px(33),
    color: Colors.defaultTransparent,
    text_size: px(23),
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
    show_level: hmUI.show_level.ONLY_NORMAL
};

export const BG_DELTA_TEXT = {
    x: px(134),
    y: px(190),
    w: px(69),
    h: px(45),
    color: Colors.defaultTransparent,
    text_size: px(27),
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
    show_level: hmUI.show_level.ONLY_NORMAL
};

export const BG_TREND_IMAGE = {
    src: 'watchdrip/arrows/None.png',
    x: px(147),
    y: px(253),
    w: px(42),
    h: px(45),
    show_level: hmUI.show_level.ONLY_NORMAL
};

export const BG_STALE_IMG = {
    x: px(115),
    y: px(148),
    src: 'watchdrip/stale.png',
    visible: false,
    show_level: hmUI.show_level.ONLY_NORMAL
};

// Xdrip modified to put ExternalStatusService.getLastStatusLine()
export const AAPS_TEXT = {
    x: px(18),
    y: px(316),
    w: px(300),
    h: px(30),
    color: Colors.white,
    text_size: px(23),
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
    show_level: hmUI.show_level.ONLY_NORMAL
};

// Xdrip modified to put ExternalStatusService.getLastStatusLineTime()
export const AAPS_TIME_TEXT = {
    x: px(50),
    y: px(347),
    w: px(236),
    h: px(30),
    color: Colors.defaultTransparent,
    text_size: px(23),
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
    show_level: hmUI.show_level.ONLY_NORMAL
};

export const PHONE_BATTERY_TEXT = {
    x: px(259),
    y: px(276),
    w: px(65),
    h: px(27),
    color: Colors.white,
    text_size: px(22),
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
    show_level: hmUI.show_level.ONLY_NORMAL
};

export const WATCH_BATTERY_TEXT = {
    x: px(5),
    y: px(276),
    w: px(65),
    h: px(27),
    color: Colors.white,
    text_size: px(22),
    align_h: hmUI.align.RIGHT,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
    show_level: hmUI.show_level.ONLY_NORMAL
};

export const BG_STATUS_LOW_IMG = {
    x: px(105),
    y: px(108),
    src: 'watchdrip/bgLow.png',
    show_level: hmUI.show_level.ONLY_NORMAL
};

export const BG_STATUS_OK_IMG = {
    x: px(125),
    y: px(108),
    src: 'watchdrip/bgOk.png',
    show_level: hmUI.show_level.ONLY_NORMAL
};

export const BG_STATUS_HIGH_IMG = {
    x: px(216),
    y: px(108),
    src: 'watchdrip/bgHigh.png',
    show_level: hmUI.show_level.ONLY_NORMAL
};

export const IMG_STATUS_BT_DISCONNECTED = {
    x: px(30),
    y: px(30),
    src: img('status/bt_disconnect.png'),
    type: hmUI.system_status.DISCONNECT,
    show_level: hmUI.show_level.ONLY_NORMAL
};

export const IMG_LOADING_PROGRESS = {
    x: px(152),
    y: px(206),
    src: 'watchdrip/progress.png',
    angle: 0,
    center_x: 20,
    center_y: 20,
    visible: false,
    show_level: hmUI.show_level.ONLY_NORMAL
};


// 100% edit mask
export const EDIT_MASK_100 = {
    x: px(0),
    y: px(0),
    w: px(336),
    h: px(384),
    src: img('mask/mask100.png'),
    show_level: hmUI.show_level.ONLY_EDIT
};

// 70% edit mask
export const EDIT_MASK_70 = {
    x: px(0),
    y: px(0),
    w: px(336),
    h: px(384),
    src: img('mask/mask70.png'),
    show_level: hmUI.show_level.ONLY_EDIT
};


// BEGIN edit group treatments aaps/xdrip data
export const CUSTOM_WIDGETS = {
    NONE: 100001,
    XDRIP: 100002,
    AAPS: 100003
};

export const EDIT_GROUP_AAPS_XDRIP = {
    edit_id: 105,
    x: px(50),
    y: px(316),
    w: px(236),
    h: px(57),
    select_image: img('mask/select-wide.png'),
    un_select_image: img('mask/un_select-wide.png'),
    optional_types: [
        {
            type: CUSTOM_WIDGETS.XDRIP,
            title_sc: 'xDrip+ default treatments data',
            title_tc: 'xDrip+ default treatments data',
            title_en: 'xDrip+ default treatments data',
            preview: img('widgets/xdrip.png')
        },
        {
            type: CUSTOM_WIDGETS.AAPS,
            title_sc: 'AAPS IOB/COB data (requires modified xDrip+)',
            title_tc: 'AAPS IOB/COB data (requires modified xDrip+)',
            title_en: 'AAPS IOB/COB data (requires modified xDrip+)',
            preview: img('widgets/aaps.png')
        },
        // custom empty widget, nothing is rendered
        {
            type: CUSTOM_WIDGETS.NONE,
            title_sc: 'None (empty space)',
            title_tc: 'None (empty space)',
            title_en: 'None (empty space)',
            preview: img('widgets/empty.png')
        }
    ],
    count: 3,
    default_type: CUSTOM_WIDGETS.XDRIP,
    tips_BG: img('mask/text_tag-wide.png'),
    tips_width: 300,
    tips_margin: 0, // optional, default value: 0,
    tips_x: -32,
    tips_y: -45,
    show_level: hmUI.show_level.ONLY_NORMAL | hmUI.show_level.ONLY_EDIT
};
// END edit group treatments aaps/xdrip data


// BEGIN edit group default styles
const editWidgetW = px(90);
const editWidgetH = px(70);
const editWidgetIconHeight = 40;
const editWidgetIconWidth = 40;
const editWidgetIconMargin = 7;
const editWidgetArcRadius = 19;
const editWidgetArcMarginLeft = 4;
const editWidgetArcMarginTop = 1;

export const EDIT_GROUP_DEFAULTS = {
    w: px(editWidgetW),
    h: px(editWidgetH),
    select_image: img('mask/select.png'),
    un_select_image: img('mask/un_select.png'),
    optional_types: [
        {
            type: hmUI.edit_type.HEART,
            preview: img('widgets/heart.png')
        },
        {
            type: hmUI.edit_type.SPO2,
            preview: img('widgets/spo2.png')
        },
        {
            type: hmUI.edit_type.STEP,
            preview: img('widgets/steps/steps.png')
        },
        {
            type: hmUI.edit_type.DISTANCE,
            preview: img('widgets/distance.png')
        },
        {
            type: hmUI.edit_type.CAL,
            preview: img('widgets/calories.png')
        },
        {
            type: hmUI.edit_type.STAND,
            preview: img('widgets/stand.png')
        },
        {
            type: hmUI.edit_type.PAI_DAILY,
            preview: img('widgets/pai.png')
        },
        {
            type: hmUI.edit_type.WEATHER,
            preview: img('widgets/temp.png')
        },
        {
            type: hmUI.edit_type.ALTIMETER,
            preview: img('widgets/air-pressure.png')
        },
        {
            type: hmUI.edit_type.UVI,
            preview: img('widgets/uvi.png')
        },
        {
            type: hmUI.edit_type.AQI,
            preview: img('widgets/aqi.png')
        },
        {
            type: hmUI.edit_type.MOON,
            preview: img('widgets/moon.png')
        },
        // custom empty widget, nothing is rendered
        {
            type: CUSTOM_WIDGETS.NONE,
            title_sc: 'None (empty space)',
            title_tc: 'None (empty space)',
            title_en: 'None (empty space)',
            preview: img('widgets/empty.png')
        }
    ],
    count: 13,
    tips_BG: img('mask/text_tag.png'),
    tips_width: 110,
    tips_margin: 0, // optional, default value: 0
    show_level: hmUI.show_level.ONLY_NORMAL | hmUI.show_level.ONLY_EDIT
};

// Default styles for all IMG widgets 
export const EDIT_DEFAULT_IMG = {
    // TODO: make images full width and remove this
    w: px(editWidgetW), // full width to center
    pos_x: px((editWidgetW - editWidgetIconWidth) / 2), // center the image
    show_level: hmUI.show_level.ONLY_NORMAL
};

// Default styles for all ARC_PROGRESS widgets
export const EDIT_DEFAULT_ARC_PROGRESS = {
    radius: px(editWidgetArcRadius),
    start_angle: -90,
    end_angle: 270,
    color: Colors.accent,
    line_width: 5,
    show_level: hmUI.show_level.ONLY_NORMAL
};

// Default styles for all TEXT_IMG widgets
export const EDIT_DEFAULT_TEXT_IMG = {
    w: px(editWidgetW),
    padding: false,
    h_space: 1,
    align_h: hmUI.align.CENTER_H,
    show_level: hmUI.show_level.ONLY_NORMAL,
    font_array: smallNumArr,
    dot_image: img('smallNum/d.png'),
    negative_image: img('smallNum/negative_image.png')
};
// END edit group default styles


// BEGIN Top Left Edit Widgets
const topLeftX = px(7);
const topLeftY = px(110);

export const EDIT_TOP_LEFT_GROUP = {
    edit_id: 101,
    x: px(topLeftX),
    y: px(topLeftY),
    tips_x: 0,
    tips_y: -45,
    default_type: hmUI.edit_type.HEART
}; 

// Styles for all Top Left IMG widgets
export const EDIT_TL_IMG = {
    x: px(topLeftX),
    y: px(topLeftY)
};

// Styles for all Top Left ARC_PROGRESS widgets
export const EDIT_TL_ARC_PROGRESS = {
    center_x: px(topLeftX + editWidgetArcRadius + (editWidgetW / 2) + editWidgetArcMarginLeft),
    center_y: px(topLeftY + editWidgetArcRadius + editWidgetArcMarginTop)
};

// Styles for all Top Left TEXT_IMG widgets
export const EDIT_TL_TEXT_IMG = {
    x: px(topLeftX),
    y: px(topLeftY + editWidgetIconHeight + editWidgetIconMargin)
};
// END Top Left Edit Widgets


// BEGIN Top Right Edit Widgets
const topRightX = px(239);
const topRightY = px(110);

export const EDIT_TOP_RIGHT_GROUP = {
    edit_id: 102,
    x: px(topRightX),
    y: px(topRightY),
    tips_x: -25,
    tips_y: -45,
    default_type: hmUI.edit_type.STEP
}; 

// Default styles for all Top Right IMG widgets
export const EDIT_TR_IMG = {
    x: px(topRightX),
    y: px(topRightY)
};

// Styles for all Top Right ARC_PROGRESS widgets
export const EDIT_TR_ARC_PROGRESS = {
    center_x: px(topRightX + editWidgetArcRadius + (editWidgetW / 2) + editWidgetArcMarginLeft),
    center_y: px(topRightY + editWidgetArcRadius + editWidgetArcMarginTop)
};

// Styles for all Top Right TEXT_IMG widgets
export const EDIT_TR_TEXT_IMG = {
    x: px(topRightX),
    y: px(topRightY + editWidgetIconHeight + editWidgetIconMargin)
};
// END Top Right Edit Widgets


// BEGIN Bottom Left Edit Widgets
const bottomLeftX = px(7);
const bottomLeftY = px(195);

export const EDIT_BOTTOM_LEFT_GROUP = {
    edit_id: 103,
    x: px(bottomLeftX),
    y: px(bottomLeftY),
    tips_x: 0,
    tips_y: 75,
    default_type: hmUI.edit_type.WEATHER
}; 

// Styles for all Bottom Left IMG widgets
export const EDIT_BL_IMG = {
    x: px(bottomLeftX),
    y: px(bottomLeftY)
};

// Styles for all Bottom Left ARC_PROGRESS widgets
export const EDIT_BL_ARC_PROGRESS = {
    center_x: px(bottomLeftX + editWidgetArcRadius + (editWidgetW / 2) + editWidgetArcMarginLeft),
    center_y: px(bottomLeftY + editWidgetArcRadius + editWidgetArcMarginTop)
};

// Styles for all Bottom Left TEXT_IMG widgets
export const EDIT_BL_TEXT_IMG = {
    x: px(bottomLeftX),
    y: px(bottomLeftY + editWidgetIconHeight + editWidgetIconMargin)
};
// END Bottom Left Edit Widgets


// BEGIN Bottom Right Edit Widgets
const bottomRightX = px(239);
const bottomRightY = px(195);

export const EDIT_BOTTOM_RIGHT_GROUP = {
    edit_id: 104,
    x: px(bottomRightX),
    y: px(bottomRightY),
    tips_x: -25,
    tips_y: 75,
    default_type: hmUI.edit_type.DISTANCE
}; 

// Styles for all Bottom Right IMG widgets
export const EDIT_BR_IMG = {
    x: px(bottomRightX),
    y: px(bottomRightY)
};

// Styles for all Bottom Right ARC_PROGRESS widgets
export const EDIT_BR_ARC_PROGRESS = {
    center_x: px(bottomRightX + editWidgetArcRadius + (editWidgetW / 2) + editWidgetArcMarginLeft),
    center_y: px(bottomRightY + editWidgetArcRadius + editWidgetArcMarginTop)
};

// Styles for all Bottom Right TEXT_IMG widgets
export const EDIT_BR_TEXT_IMG = {
    x: px(bottomRightX),
    y: px(bottomRightY + editWidgetIconHeight + editWidgetIconMargin)
};
// END Bottom Right Edit Widgets


// BEGIN Edit Widgets
// These styles are merged with the above default styles.
// HEART widget
export const EDIT_HEART_IMG = {
    src: img('widgets/heart.png') // 40x40px
};
export const EDIT_HEART_TEXT_IMG = {
    type: hmUI.data_type.HEART
};

// STEP widget
export const EDIT_STEP_IMG = {
    src: img('widgets/steps/steps-base.png'), // 90x40px
    pos_x: 0 // remove later 
};
export const EDIT_STEP_ARC_PROGRESS = {
    type: hmUI.data_type.STEP,
    //level: 9
};
export const EDIT_STEP_TEXT_IMG = {
    type: hmUI.data_type.STEP
};

// DISTANCE widget
export const EDIT_DISTANCE_IMG = {
    src: img('widgets/distance.png') // 40x40px
};
export const EDIT_DISTANCE_TEXT_IMG = {
    type: hmUI.data_type.DISTANCE,
    unit_sc: img('smallNum/unit-distance-metric.png'),
    unit_tc: img('smallNum/unit-distance-metric.png'),
    unit_en: img('smallNum/unit-distance-metric.png'),
    imperial_unit_sc: img('smallNum/unit-distance-imperial.png'),
    imperial_unit_tc: img('smallNum/unit-distance-imperial.png'),
    imperial_unit_en: img('smallNum/unit-distance-imperial.png'),
    align_h: hmUI.align.LEFT  // override alignment because of unit
};

// WEATHER widget
export const EDIT_WEATHER_CONDITION_IMG_LEVEL = {
    image_array: weatherArr, // 90x40px
    image_length: weatherArr.length,
    type: hmUI.data_type.WEATHER
};
export const EDIT_WEATHER_CURRENT_TEXT_IMG = {
    type: hmUI.data_type.WEATHER_CURRENT,
    unit_sc: img('smallNum/unit-temperature-metric.png'),
    unit_tc: img('smallNum/unit-temperature-metric.png'),
    unit_en: img('smallNum/unit-temperature-metric.png'),
    imperial_unit_sc: img('smallNum/unit-temperature-imperial.png'),
    imperial_unit_tc: img('smallNum/unit-temperature-imperial.png'),
    imperial_unit_en: img('smallNum/unit-temperature-imperial.png')
};

// PAI widget
export const EDIT_PAI_IMG = {
    src: img('widgets/pai.png') // 40x40px
};
export const EDIT_PAI_TEXT_IMG = {
    type: hmUI.data_type.PAI_DAILY
};

// UVI widget
export const EDIT_UVI_IMG = {
    src: img('widgets/uvi.png') // 40x40px
};
export const EDIT_UVI_TEXT_IMG = {
    type: hmUI.data_type.UVI
};

// ALTIMETER widget
export const EDIT_ALTIMETER_IMG = {
    src: img('widgets/air-pressure.png') // 40x40px
};
export const EDIT_ALTIMETER_TEXT_IMG = {
    type: hmUI.data_type.ALTIMETER,
    nit_sc: img('smallNum/unit-pressure-metric.png'),
    unit_tc: img('smallNum/unit-pressure-metric.png'),
    unit_en: img('smallNum/unit-pressure-metric.png'),
    imperial_unit_sc: img('smallNum/unit-pressure-imperial.png'),
    imperial_unit_tc: img('smallNum/unit-pressure-imperial.png'),
    imperial_unit_en: img('smallNum/unit-pressure-imperial.png'),
    align_h: hmUI.align.LEFT  // override alignment because of unit
};

// MOON widget
export const EDIT_MOON_IMG_LEVEL = {
    image_array: moonArr, // 90x70px
    image_length: moonArr.length,
    type: hmUI.data_type.WEATHER
};

// CAL widget
export const EDIT_CAL_IMG = {
    src: img('widgets/calories.png') // 40x40px
};
export const EDIT_CAL_TEXT_IMG = {
    type: hmUI.data_type.CAL,
    nit_sc: img('smallNum/unit-calories.png'),
    unit_tc: img('smallNum/unit-calories.png'),
    unit_en: img('smallNum/unit-calories.png'),
    imperial_unit_sc: img('smallNum/unit-calories.png'),
    imperial_unit_tc: img('smallNum/unit-calories.png'),
    imperial_unit_en: img('smallNum/unit-calories.png'),
    align_h: hmUI.align.LEFT  // override alignment because of unit
};

// AQI widget
export const EDIT_AQI_IMG = {
    src: img('widgets/aqi.png') // 40x40px
};
export const EDIT_AQI_TEXT_IMG = {
    type: hmUI.data_type.AQI
};

// SPO2 widget
export const EDIT_SPO2_IMG = {
    src: img('widgets/spo2.png') // 40x40px
};
export const EDIT_SPO2_TEXT_IMG = {
    type: hmUI.data_type.SPO2,
    nit_sc: img('smallNum/unit-spo2.png'),
    unit_tc: img('smallNum/unit-spo2.png'),
    unit_en: img('smallNum/unit-spo2.png'),
    imperial_unit_sc: img('smallNum/unit-spo2.png'),
    imperial_unit_tc: img('smallNum/unit-spo2.png'),
    imperial_unit_en: img('smallNum/unit-spo2.png')
};

// STAND widget
export const EDIT_STAND_IMG = {
    src: img('widgets/stand.png') // 40x40px
};
export const EDIT_STAND_TEXT_IMG = {
    type: hmUI.data_type.STAND,
    dot_image: img('smallNum/slash.png')
};
// END Edit Widgets
