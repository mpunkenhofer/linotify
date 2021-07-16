import { Preferences } from "../types";
import { i18n } from "./i18n";

export const defaultPreferences: Preferences = {
  popupTheme: "light",
  popupCollapsibleStatuses: {
    playing: true,
    online: true,
    offline: false,
  },
  notificationsEnabled: true,
  displayBadgeTextEnabled: true,
};

export const TITLES = {
  LM: i18n.lm,
  CM: i18n.cm,
  WCM: i18n.wcm,
  NM: i18n.nm,
  WNM: i18n.wnm,
  FM: i18n.fm,
  WFM: i18n.wfm,
  IM: i18n.im,
  WIM: i18n.wim,
  GM: i18n.gm,
  WGM: i18n.wgm,
};

export const ICONS = {
  ultraBullet: "\ue000",
  bullet: "\ue001",
  blitz: "\ue002",
  rapid: "\ue003",
  classical: "\ue004",
  correspondence: "\ue005",
  crazyhouse: "\ue006",
  chess960: "\ue007",
  antichess: "\ue008",
  atomic: "\ue009",
  threeCheck: "\ue00A",
  kingOfTheHill: "\ue00B",
  horde: "\ue00C",
  racingKings: "\ue00D",
  puzzle: "\ue00e",
  arrow_upperright: "\ue012",
  arrow_lowerright: "\ue013",
  check: "\ue014",
  times: "\ue015",
  options: "\ue016",
  patron: "\ue018",
  offline: "\ue019",
  online: "\ue01A",
  arrow_down: "\ue01E",
  arrow_right: "\ue020",
  delicious: "\ue021",
  sun: "\ue023",
  moon: "\ue024",
  linotify: "\ue025",
  alarm: "\ue02A",
  alarm_disabled: "\ue02B",
  tv: "\ue02F",
};

export const clearBadgeTextMessage = "clearBadgeText";

export const GITHUB = "https://github.com/mpunkenhofer/linotify";
