export default {
  PERMISSION_TYPE: {
    LOGIN: "login",
    APPLY: "apply",
    USER: "user",
    FORM: "form",
    SCHOLAR: "scholar",
    HONOR: "honor",
    USER_SCHOLAR: "user_scholar",
    USER_HONOR: "user_honor",
    EXPORT: "export",
    PERMISSION: "permission",
    NOTICE: "notice"
  },
  permissionTypeString: function(type) {
    if (type === this.PERMISSION_TYPE.LOGIN) {
      return "有效";
    } else if (type === this.PERMISSION_TYPE.APPLY) {
      return "奖学金荣誉申请";
    } else if (type === this.PERMISSION_TYPE.USER) {
      return "用户管理";
    } else if (type === this.PERMISSION_TYPE.FORM) {
      return "表单管理";
    } else if (type === this.PERMISSION_TYPE.SCHOLAR) {
      return "奖学金信息管理";
    } else if (type === this.PERMISSION_TYPE.HONOR) {
      return "荣誉信息管理";
    } else if (type === this.PERMISSION_TYPE.USER_SCHOLAR) {
      return "用户-奖学金状态管理";
    } else if (type === this.PERMISSION_TYPE.USER_HONOR) {
      return "用户-荣誉状态管理";
    } else if (type === this.PERMISSION_TYPE.EXPORT) {
      return "学校奖助系统对接";
    } else if (type === this.PERMISSION_TYPE.PERMISSION) {
      return "权限管理";
    } else if (type === this.PERMISSION_TYPE.NOTICE) {
      return "公告管理";
    } else {
      return "";
    }
  }
}
