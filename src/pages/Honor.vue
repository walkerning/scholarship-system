<template>
  <section>
    <!--当前列表-->
    <h1>可申请荣誉</h1>
    <el-table :data="availableHonors" highlight-current-row v-loading="availableListLoading" @selection-change="availableAllSelsChange" style="width: 100%;" border>
      <el-table-column type="index" width="60">
      </el-table-column>
      <el-table-column prop="name" label="荣誉名" width="200" sortable>
      </el-table-column>
      <el-table-column prop="year" label="年份" width="100" sortable>
      </el-table-column>
      <el-table-column prop="start_time" label="申请开始时间" :formatter="timeFormatter" width="190" sortable>
      </el-table-column>
      <el-table-column prop="end_time" label="申请结束时间" :formatter="timeFormatter" width="190" sortable>
      </el-table-column>
      <el-table-column label="操作" width="80">
	<template scope="scope">
	  <el-button size="small" type="primary" @click="singleApply(scope.$index, scope.row)">申请</el-button>
	</template>
      </el-table-column>
    </el-table>

    <!--历史列表-->
    <h1>申请历史</h1>
    <el-table :data="honors" highlight-current-row v-loading="listLoading" @selection-change="allSelsChange" style="width: 100%;" border>
      <el-table-column type="index" width="60">
      </el-table-column>
      <el-table-column prop="name" label="荣誉名" width="200" sortable>
      </el-table-column>
      <el-table-column prop="year" label="年份" width="100" sortable>
      </el-table-column>
      <el-table-column prop="state" label="状态" width="100" sortable>
	<template scope="scope">
	  <apply-status-tag :applyStatus="scope.row.state"></apply-status-tag>
	</template>
      </el-table-column>
      <el-table-column prop="apply_time" label="申请时间" :formatter="timeFormatter" width="190" sortable>
      </el-table-column>
      <el-table-column label="操作" width="230">
	<template scope="scope">
	  <el-button size="small" @click="singleView(scope.$index, scope.row)">查看申请表单</el-button>
	  <!-- <template v-if="scope.row.state === _APPLY_STATUS.APPLIED"> -->
	  <!--   <el-button type="danger" size="small" @click="singleCancel(scope.$index, scope.row)">删除申请</el-button> -->
	  <!-- </template> -->
	</template>
      </el-table-column>
    </el-table>

    <el-dialog title="查看" v-model="viewVisible" size="large">
      <form-view :disabled="true"></form-view>
    </el-dialog>

    <!--申请界面-->
    <el-dialog title="申请" v-model="applyVisible" :close-on-click-modal="false" size="large">
      <form-view ref="form"></form-view>
      <div slot="footer" class="dialog-footer">
	<el-button @click.native="applyVisible = false">取消</el-button>
	<el-button @click.native="singleSave">暂存</el-button>
	<el-button type="primary" @click.native="singleApplySubmit" :loading="applyLoading">提交</el-button>
      </div>
    </el-dialog>

  </section>
</template>

<script>
  import _ from "lodash"
import { apiGetUser, apiGetHonorList, apiGetGroupId, apiGetUserHonor, apiGetHonor, apiGetForm, apiApplyUserHonor, apiUpdateUserHonor, apiDeleteUserHonor } from "../api/api"
import { mapGetters } from "vuex"
import { mapActions } from "vuex"
import QueType from "../common/js/queType"
import ApplyStatus from "../common/js/applyStatus"

export default {
  computed: {
      ...mapGetters([
	"getForm",
	"getFields",
	"getFill"
      ]),
    _QUE_TYPE: function() {
      return QueType.QUE_TYPE;
    },
    _APPLY_STATUS: function() {
      return ApplyStatus.APPLY_STATUS;
    }
  },
  data() {
    return {
      listLoading: false,
      honors: [],

      availableListLoading: false,
      availableHonors: [],

      isSave: false,

      viewVisible: false,
      applyVisible: false,
      applyLoading: false,

      sels: [],
      availableSels: []
    };
  },
  methods: {
    allSelsChange: function (sels) {
      this.sels = sels;
    },
    availableAllSelsChange: function(sels) {
      this.availableSels = sels;
    },
    singleView: function (index, row) {
      apiGetForm(row.form_id).then(res => {
	this.setForm(res.data);
	this.setFill(JSON.parse(row.fill));
	this.viewVisible = true;
      }).catch(error => {
	this.$notify({
	  title: "加载荣誉申请表单失败",
	  message: error.response.data.message,
	  type: "error"
	});					
      }).catch(error => {
	this.$notify({
	  title: "加载荣誉申请表单失败",
	  message: "请检查网络连接",
	  type: "error"
	});
      });
    },
    singleCancel: function(index, row) {
      this.$confirm("确定删除？", "提示", {confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"}).then(() => {
	var uid = sessionStorage.getItem("uid");
	var honorId = row.honor_id;
	apiDeleteUserHonor(uid, honorId).then(res => {
	  this.$notify({
	    title: "删除成功",
	    message: "删除荣誉申请表成功",
	    type: "success"
	  });
	  this.getHistoryHonorList();
	  this.getAvailableHonorList();
	}).catch(error => {
	  this.$notify({
	    title: "删除失败",
	    message: "删除荣誉申请表失败",
	    type: "error"
	  });
	})
	  }).catch(() => {
	  });
    },
    singleApply: function (index, row) {
      var uid = sessionStorage.getItem("uid");
      apiGetForm(row.form_id).then(res => {
	res.data.honor_id = row.id;
	this.setForm(res.data);
	return apiGetUserHonor(uid, {honor_id: row.id}).then(res => {
	  var fill = {};
	  if (res.data.length != 0 && res.data[0].state === this._APPLY_STATUS.TEMP) {
	    fill = JSON.parse(res.data[0].fill);
	    this.isSave = true;
	  } else {
	    for (var i in this.getFields) {
	      var field = this.getFields[i];
	      if (field.type === this._QUE_TYPE.CHECKBOX || field.type === this._QUE_TYPE.TABLE) {
		fill["data" + i] = [];
	      } else {
		fill["data" + i] = "";
	      }
	    }
	    this.isSave = false;							
	  }
	  this.setFill(fill);
	  this.applyVisible = true;
	});
      }).catch(error => {
	this.$notify({
	  title: "加载荣誉申请表单失败",
	  message: error.response.data.message,
	  type: "error"
	});					
      }).catch(error => {
	this.$notify({
	  title: "加载荣誉申请表单失败",
	  message: "请检查网络连接",
	  type: "error"
	});
      });
    },
    timeFormatter: function (row, column) {
      if (column.property === "end_time") {
	return new Date(row.end_time).toLocaleString().replace(/:\d{1,2}$/,' '); 
      } else if (column.property === "start_time") {
	return new Date(row.start_time).toLocaleString().replace(/:\d{1,2}$/,' '); 
      } else {
	return new Date(row.apply_time).toLocaleString().replace(/:\d{1,2}$/,' '); 
      }
    },
    singleApplySubmit: function () {
      this.$refs.form.validate((valid) => {
	if (valid) {
          this.$confirm("确定提交荣誉申请？一旦提交, 将无法修改或删除该荣誉申请表单. 如果只是暂时保存, 需要后续修改表单, 请选择暂存申请.",
                        "提示", {confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"}).then(() => {
	    var start = null;
	    if (this.isSave) {
	      start = Promise.resolve(null);
	    } else {
	      start = this.doApply();
	    }
	    start.then(() => {
	      return this.doUpdate(false).then(() => {
	        this.$notify({
		  title: "提交成功",
		  message: "提交荣誉申请表成功",
		  type: "success"
	        });
	        this.applyVisible = false;
	        this.getHistoryHonorList();
	        this.getAvailableHonorList();
	      });
	    }).catch(error => {
	      this.$notify({
	        title: "提交失败",
	        message: error.response.data.message,
	        type: "error"
	      });
	      this.applyVisible = false;
	    }).catch(error => {
	      this.$notify({
	        title: "提交失败",
	        message: "请检查网络连接",
	        type: "error"
	      });
	      this.applyVisible = false;
	    });
	  });
        }
      });
    },
    singleSave: function () {
      var start = null;
      if (this.isSave) {
	start = this.doUpdate(true);
      } else {
	start = this.doApply();
      }
      start.then(() => {
	this.$notify({
	  title: "暂存成功",
	  message: "暂存荣誉申请表成功",
	  type: "success"
	});
	this.applyVisible = false;
      }).catch(error => {
	this.$notify({
	  title: "暂存失败",
	  message: error.response.data.message,
	  type: "error"
	});
	this.applyVisible = false;
      }).catch(error => {
	this.$notify({
	  title: "暂存失败",
	  message: "请检查网络连接",
	  type: "error"
	});		
	this.applyVisible = false;
      });
    },
    doApply: function () {
      var uid = sessionStorage.getItem("uid");
      var params = {
	honor_id: this.getForm.honor_id,
	fill: this.getFill
      }
      return apiApplyUserHonor(uid, params);

    },
    doUpdate: function (bSave) {
      var uid = sessionStorage.getItem("uid");
      var honor_id = this.getForm.honor_id;
      var params = {
	fill: this.getFill,
	state: bSave? this._APPLY_STATUS.TEMP : this._APPLY_STATUS.APPLIED
      }
      return apiUpdateUserHonor(uid, honor_id, params);
    },
    _applyStatusString: function (str) {
      return ApplyStatus.applyStatusString(str);
    },
    getHistoryHonorList: function () {
      this.listLoading = true;
      this.honors = [];
      var uid = sessionStorage.getItem("uid");
      apiGetUserHonor(uid, {}).then(res => {
	var userHonorStates = res.data;
	var tasks = [];
	var tUserHonorStates = [];
	for (var i in userHonorStates) {
	  if (userHonorStates[i].state != this._APPLY_STATUS.TEMP) {
	    tasks.push(apiGetHonor(userHonorStates[i].honor_id).then((h) => { return h; }).catch((e) => { return null; }));
	    tUserHonorStates.push(userHonorStates[i])
	  }
	}
	return Promise.all(tasks).then(reses => {
	  for (var i in tUserHonorStates) {
            if (reses[i] !== null) {
	      this.honors.push(_.extend(tUserHonorStates[i], _.pick(reses[i].data, ["form_id", "name", "year"])));
            }
	  }
	  this.listLoading = false;
	});

      }).catch(error => {
	this.$notify({
	  title: "加载荣誉申请历史列表失败",
	  message: error.response.data.message,
	  type: "error"
	});
	this.listLoading = false;
      }).catch(error => {
	this.$notify({
	  title: "加载荣誉申请历史列表失败",
	  message: "请检查网络连接",
	  type: "error"
	});
	this.listLoading = false;
      });
    },
    getAvailableHonorList: function () {
      this.availableListLoading = true;
      this.availableHonors = [];
      var uid = sessionStorage.getItem("uid");
      apiGetUser(uid).then(res => {
	var params = {
	  group_id: res.data.group_id,
	  available: 1
	};
	return apiGetHonorList(params).then(res => {
	  var tHonors = res.data;
	  var tasks = []
	  for (var i in tHonors) {
	    tasks.push(apiGetUserHonor(uid, {honor_id: tHonors[i].id}));
	  }
	  return Promise.all(tasks).then(reses => {
	    for (var j in tHonors) {
	      if (reses[j].data.length === 0 || reses[j].data[0].state === this._APPLY_STATUS.TEMP) {
		this.availableHonors.push(tHonors[j]);
	      }
	    }
	    this.availableListLoading = false;
	  });
	});
      }).catch(error => {
	this.$notify({
	  title: "加载可申请荣誉列表失败",
	  message: error.response.data.message,
	  type: "error"
	});
	this.availableListLoading = false;
      }).catch(error => {
	this.$notify({
	  title: "加载可申请荣誉列表失败",
	  message: "请检查网络连接",
	  type: "error"
	});
	this.availableListLoading = false;
      });
    },
      ...mapActions([
	"setForm",
	"setFill"
      ])
  },
  mounted() {
    this.getAvailableHonorList();
    this.getHistoryHonorList();
  }
}

</script>

<style scoped>
</style>
