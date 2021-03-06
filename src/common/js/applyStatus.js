export default {
  APPLY_STATUS: {
    SUCCESS: "success",
    FAIL: "fail",
    APPLIED: "applied",
    TEMP: "temp",
    LEAVEOUT: "leaveout"
  },
  applyStatusString: function(type) {
    if (type === this.APPLY_STATUS.SUCCESS) {
      return "已获得";
    } else if (type === this.APPLY_STATUS.FAIL) {
      return "未获得";
    } else if (type === this.APPLY_STATUS.APPLIED) {
      return "申请中";
    } else if (type === this.APPLY_STATUS.TEMP) {
      return "暂存";
    } else if (type === this.APPLY_STATUS.LEAVEOUT) {
      return "不参与";
    } else {
      return "";
    }
  }
}
