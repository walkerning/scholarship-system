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
			<el-table-column label="操作">
				<template scope="scope">
					<el-button size="small" type="primary" @click="singleApply(scope.$index, scope.row)">申请</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!--当前列表工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" @current-change="availableAllCurrentChange" :page-size="20" :total="availableTotal" style="float:right;">
			</el-pagination>
		</el-col>

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
			<el-table-column label="操作">
				<template scope="scope">
					<el-button size="small" @click="singleView(scope.$index, scope.row)">查看申请表单</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--历史列表工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" @current-change="allCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<el-dialog title="查看" v-model="viewVisible" size="large">
			<form-view :disabled="true"></form-view>
		</el-dialog>

		<!--申请界面-->
		<el-dialog title="申请" v-model="applyVisible" :close-on-click-modal="false" size="large">
			<form-view></form-view>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="applyVisible = false">取消</el-button>
				<el-button @click.native="singleSave">暂存</el-button>
				<el-button type="primary" @click.native="singleApplySubmit" :loading="applyLoading">提交</el-button>
			</div>
		</el-dialog>

	</section>
</template>

<script>
	import { apiGetUser, apiGetHonorList, apiGetGroupId, apiGetUserHonor } from "../api/api"
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
				honors: [
					{
						id: 1,
						name: "学业优秀奖",
						year: "2017",
						form_id: 6,
						state: "success",
						fill_id: 10,
						apply_time: "2017-09-28T10:54:24.738793"
					},
					{
						id: 2,
						name: "科技创新优秀奖",
						year: "2018",
						form_id: 6,
						state: "fail",
						fill_id: 11,
						apply_time: "2017-09-28T10:54:24.738793"
					},
					{
						id: 3,
						name: "社会工作优秀奖",
						year: "2017",
						form_id: 7,
						state: "applied",
						fill_id: 12,
						apply_time: "2017-09-28T10:54:24.738793"
					}
				],
				total: 3,

				availableListLoading: false,
				availableHonors: [
					{
						id: 4,
						name: "学业优秀奖",
						year: "2018",
						form_id: 6,
						start_time: "2017-09-01T10:54:24.738793",
						end_time: "2017-09-28T10:54:24.738793"
					},
					{
						id: 5,
						name: "科技创新优秀奖",
						year: "2018",
						form_id: 6,
						start_time: "2017-09-01T10:54:24.738793",
						end_time: "2017-09-28T10:54:24.738793"
					},
					{
						id: 6,
						name: "社会工作优秀奖",
						year: "2018",
						form_id: 7,
						start_time: "2017-09-01T10:54:24.738793",
						end_time: "2017-09-28T10:54:24.738793"
					}
				],
				availableTotal: 3,

				testForm: {
					id: "1",
					name: "测试表单1",
					type: "apply",
					fields: [
						{
							type: 1,
							max_len: -1,
							min_len: -1,
							required: false,
							description: "说明文字",
							content: null
						},
						{
							type: 2,
							max_len: 1267,
							min_len: 1200,
							required: false,
							description: "数字（有限制、可选）",
							content: null
						},
						{
							type: 2,
							max_len: -1,
							min_len: 0,
							required: true,
							description: "数字（无限制、必选）",
							content: null
						},
						{
							type: 3,
							max_len: -1,
							min_len: 0,
							required: true,
							description: "邮箱（无限制、必选）",
							content: null
						},
						{
							type: 4,
							max_len: -1,
							min_len: 0,
							required: true,
							description: "手机（无限制、必选）",
							content: null
						},
						{
							type: 5,
							max_len: -1,
							min_len: 0,
							required: true,
							description: "单行字符串（无限制、必选）",
							content: null
						},
						{
							type: 5,
							max_len: 100,
							min_len: 1,
							required: false,
							description: "单行字符串（有限制、可选）",
							content: null
						},
						{
							type: 6,
							max_len: -1,
							min_len: 0,
							required: true,
							description: "多行字符串（无限制、必选）",
							content: null
						},
						{
							type: 6,
							max_len: 100,
							min_len: 1,
							required: false,
							description: "多行字符串（有限制、可选）",
							content: null
						},
						{
							type: 7,
							max_len: 2,
							min_len: 1,
							required: false,
							description: "多选框（有限制、可选）",
							content: ["A", "B", "C"]
						},
						{
							type: 7,
							max_len: 2,
							min_len: 1,
							required: true,
							description: "多选框（有限制、必选）",
							content: ["A", "B", "C"]
						},
						{
							type: 8,
							max_len: -1,
							min_len: -1,
							required: false,
							description: "单选框（可选）",
							content: ["A", "B", "C"]
						},
						{
							type: 9,
							max_len: -1,
							min_len: -1,
							required: false,
							description: "附件说明",
							content: 1
						},
						{
							type: 10,
							max_len: -1,
							min_len: -1,
							required: false,
							description: "上传附件（无限制、可选）",
							content: null
						},
						{
							type: 10,
							max_len: -1,
							min_len: 10000,
							required: true,
							description: "上传附件（有限制、必选）",
							content: null
						},
						{
							type: 11,
							description: "表格",
							content: ["列1", "列2", "列3"]
						}
					],
					template: ""
				},
				testFill: {
					data0: "",
					data1: "1200",
					data2: "100",
					data3: "linzinan1995@126.com",
					data4: "18800182102",
					data5: "test",
					data6: "test2",
					data7: "test\ntest",
					data8: "",
					data9: [],
					data10: ["A", "B"],
					data11: "A",
					data15: [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]]
				},

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
				this.setForm(JSON.parse(JSON.stringify(this.testForm)));
				this.setFill(JSON.parse(JSON.stringify(this.testFill)));
				this.viewVisible = true;
			},
			singleApply: function (index, row) {
				this.setForm(JSON.parse(JSON.stringify(this.testForm)));
				var fill = {};
				for (var i in this.getFields) {
					var field = this.getFields[i];
					if (field.type === this._QUE_TYPE.CHECKBOX) {
						fill["data" + i] = [];
					} else {
						fill["data" + i] = null;
					}
				}
				this.setFill(fill);
				this.applyVisible = true;
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
			allCurrentChange: function (val) {

			},
			availableAllCurrentChange: function (val) {

			},
			singleApplySubmit: function () {

			},
			singleSave: function() {

			},
			_applyStatusString: function (str) {
				return ApplyStatus.applyStatusString(str);
			},
			getAvailableHonorList: function () {
				this.availableListLoading = true;
				this.availableHonors = []
				var uid = sessionStorage.getItem("uid");
				apiGetUser(uid).then(res => {
					var group = res.data.group;
					var type = res.data.type;
					apiGetGroupId(group, type).then(id => {
						var params = {
							group_id: id,
							available: 1
						};
						apiGetHonorList(params).then(res => {
							var tHonors = res.data;
							var tasks = []
							for (var i in tHonors) {
								tasks.push(apiGetUserHonor(uid, {honor_ids: tHonors.id}));
							}
							Promise.all(tasks).then(reses => {
								for (var j in tHonors) {
									if (reses[j].data.length == 0) {
										this.availableHonors.push(tHonors[j]);
									}
								}
								this.availableListLoading = false;
							});
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
		}
	}

</script>

<style scoped>

</style>