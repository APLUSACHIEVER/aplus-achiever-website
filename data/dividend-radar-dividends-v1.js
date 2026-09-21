// APLUS Dividend Radar — verified dividend dataset
// Method: latest completed fiscal-year CASH dividend per A-share.
// Declared but not yet completed current-year interim dividends are NOT included
// in the core "即时股息率" to avoid forward-dividend inflation.

const DIVIDEND_DATA = {
  "600031": {
    name: "三一重工",
    completedYear: 2025,
    annualDividend: 0.49,
    note: "2025全年现金分红：0.31元中期 + 0.18元年度"
  },
  "600585": {
    name: "海螺水泥",
    completedYear: 2025,
    annualDividend: 0.85,
    note: "2025全年现金分红：0.24元中期 + 0.61元末期"
  },
  "600507": {
    name: "方大特钢",
    completedYear: 2025,
    annualDividend: 0.20,
    note: "2025年度现金分红0.20元"
  },
  "600010": {
    name: "包钢股份",
    completedYear: 2025,
    annualDividend: 0,
    note: "2025年度不派发现金股利"
  },
  "600350": {
    name: "山东高速",
    completedYear: 2025,
    annualDividend: 0.42,
    note: "2025年度现金分红0.42元"
  },
  "600050": {
    name: "中国联通",
    completedYear: 2025,
    annualDividend: 0.1635,
    note: "2025全年现金分红：0.1112元中期 + 0.0523元末期"
  }
};
