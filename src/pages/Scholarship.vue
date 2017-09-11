<template>
  <section>
    <!--列表-->
    <h1>奖学金历史</h1>
    <el-table :data="scholarships" highlight-current-row v-loading="listLoading" @selection-change="allSelsChange" style="width: 100%;" border>
      <el-table-column type="index" width="60">
      </el-table-column>
      <el-table-column prop="name" label="奖学金名" width="220" sortable>
      </el-table-column>
      <el-table-column prop="year" label="年份" width="150" sortable>
      </el-table-column>
      <el-table-column prop="state" label="状态" width="150" sortable>
	<template scope="scope">
	  <apply-status-tag :applyStatus="scope.row.state"></apply-status-tag>
	</template>
      </el-table-column>
      <el-table-column label="操作">
	<template scope="scope">
	  <template v-if="scope.row.fill_id === null">
	    <el-button type="info" size="small" @click="singleFill(scope.$index, scope.row)" :disabled="scope.row.state !== 'success'">填写感谢信</el-button>
	  </template>
	  <template v-if="scope.row.fill_id !== null">
	    <el-button size="small" @click="singleView(scope.$index, scope.row)">查看/修改感谢信</el-button>
	  </template>
	</template>
      </el-table-column>
    </el-table>

    <!--查看界面-->
    <el-dialog title="查看/修改" v-model="viewVisible" size="large">
      <form-view></form-view>
      <div slot="footer" class="dialog-footer">
	<el-button @click.native="viewVisible = false">取消</el-button>
	<el-button type="primary" @click.native="singleFillUpdate" :loading="viewLoading">修改</el-button>
      </div>
    </el-dialog>

    <!--填写界面-->
    <el-dialog title="填写" v-model="fillVisible" size="large">
      <form-view></form-view>
      <div slot="footer" class="dialog-footer">
	<el-button @click.native="fillVisible = false">取消</el-button>
	<el-button type="primary" @click.native="singleFillSubmit" :loading="fillLoading">提交</el-button>
      </div>
    </el-dialog>

  </section>
</template>

<script>
  import { mapGetters } from "vuex"
import { mapActions } from "vuex"	
import { apiGetUserScholarship, apiGetScholarship, apiGetForm, apiAddUserScholarshipForm, apiUpdateUserScholarshipForm } from "../api/api"
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
      scholarships: [],

      viewVisible: false,
      viewLoading: false,
      viewScholarshipId: null,
      fillVisible: false,
      fillLoading: false,
      fillScholarshipId: null,

      sels: [],//列表选中列
    }
  },
  methods: {
    allSelsChange: function (sels) {
      this.sels = sels;
    },
    singleFill: function (index, row) {
      apiGetForm(row.form_id).then(res => {
	this.setForm(JSON.parse(JSON.stringify(res.data)));
        this.setFill({});
	var fill = {};
	for (var i in this.getFields) {
	  var field = this.getFields[i];
	  if (field.type === this._QUE_TYPE.CHECKBOX || field.type === this._QUE_TYPE.TABLE) {
	    fill["data" + i] = [];
	  } else {
	    fill["data" + i] = "";
	  }
	}
	this.setFill(fill);
	this.fillScholarshipId = index;
	this.fillVisible = true;
      }).catch(error => {
	this.$notify({
	  title: "加载奖学金感谢信表单失败",
	  message: error.response.data.message,
	  type: "error"
	});					
      }).catch(error => {
	this.$notify({
	  title: "加载奖学金感谢信表单失败",
	  message: "请检查网络连接",
	  type: "error"
	});
      });
    },
    singleView: function (index, row) {
      apiGetForm(row.form_id).then(res => {
	this.setForm(JSON.parse(JSON.stringify(res.data)));
	this.setFill(JSON.parse(row.fill));
	this.viewScholarshipId = index;
	this.viewVisible = true;
      }).catch(error => {
	this.$notify({
	  title: "加载奖学金感谢信表单失败",
	  message: error.response.data.message,
	  type: "error"
	});					
      }).catch(error => {
	this.$notify({
	  title: "加载奖学金感谢信表单失败",
	  message: "请检查网络连接",
	  type: "error"
	});
      });
    },
    singleFillSubmit: function () {
      var uid = sessionStorage.getItem("uid");
      var scholarshipId = this.scholarships[this.fillScholarshipId].id;
      var params = {
	fill: this.getFill
      }
      apiAddUserScholarshipForm(uid, scholarshipId, params).then(res => {
	this.$notify({
	  title: "提交成功",
	  message: "提交奖学金感谢信成功",
	  type: "success"
	});
	this.fillVisible = false;
	this.getScholarshipList();
      }).catch(error => {
	this.$notify({
	  title: "提交失败",
	  message: "提交奖学金感谢信失败",
	  type: "error"
	});
      });
    },
    singleFillUpdate: function () {
      var uid = sessionStorage.getItem("uid");
      var scholarshipId = this.scholarships[this.viewScholarshipId].id;
      var params = {
	fill: this.getFill
      }
      apiUpdateUserScholarshipForm(uid, scholarshipId, params).then(res => {
	this.$notify({
	  title: "修改成功",
	  message: "修改奖学金感谢信成功",
	  type: "success"
	});
	this.viewVisible = false;
	this.getScholarshipList();
      }).catch(error => {
	this.$notify({
	  title: "修改失败",
	  message: "修改奖学金感谢信失败",
	  type: "error"
	});
      });
    },
    _applyStatusString: function(str) {
      return ApplyStatus.applyStatusString(str);
    },
    getScholarshipList: function () {
      this.listLoading = true;
      var uid = sessionStorage.getItem("uid");
      var scholars = [];
      apiGetUserScholarship(uid).then(res => {
	var userScholarshipStates = res.data;
	var scholarshipIds = _.map(userScholarshipStates, (h) => { return h.scholar_id });
	var tasks = _.map(scholarshipIds, (id) => { return apiGetScholarship(id).then((s) => { return s; }).catch((e) => { return null; }); });
	return Promise.all(tasks).then(scholarshipReses => {
	  for (var i in userScholarshipStates) {
            if (scholarshipReses[i] != null) {
	      scholars.push(_.extend(userScholarshipStates[i], scholarshipReses[i].data));
	    }
          }
	  this.scholarships = scholars;
	  this.listLoading = false;
	});
      }).catch(error => {
	this.$notify({
	  title: "加载奖学金历史列表失败",
	  message: error.response.data.message,
	  type: "error"
	});
	this.listLoading = false;
      }).catch(error => {
	this.$notify({
	  title: "加载奖学金历史列表失败",
	  message: "请检查网络连接",
	  type: "error"
	});
	this.listLoading = false;
      });
    },
      ...mapActions([
	"setForm",
	"setFill"
      ])
  },
  mounted() {
    this.getScholarshipList();
  }
}

</script>

<style scoped>
</style>
