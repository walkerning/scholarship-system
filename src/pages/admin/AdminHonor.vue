<template>
	<section>
		<h1>荣誉编辑</h1>
		<!--列表-->
		<el-table :data="honors" highlight-current-row v-loading="honorListLoading" @selection-change="allHonorSelsChange" style="width: 100%;" border>
			<el-table-column type="selection" width="55">
			</el-table-column>
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
					<el-button size="small" @click="singleHonorEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="singleHonorDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="allHonorBatchRemove" :disabled="this.honorSels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="allHonorCurrentChange" :page-size="20" :total="honorTotal" style="float:right;">
			</el-pagination>
		</el-col>

		<!--荣誉编辑界面-->
		<el-dialog title="编辑" v-model="honorEditFormVisible" :close-on-click-modal="false" size="large">
			<el-form :model="honorEditForm" label-width="80px" ref="honorEditForm">
				<el-form-item label="荣誉名" prop="name">
					<el-input v-model="honorEditForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="年份" prop="year">
					<el-input v-model="honorEditForm.year" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="申请开始时间" prop="start_time_date">
					<el-date-picker	v-model="start_time_date" type="datetime" placeholder="选择日期时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="申请结束时间" prop="end_time_date">
					<el-date-picker	v-model="end_time_date" type="datetime" placeholder="选择日期时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="各年级名额">
					<template v-for="(group_quota, index) in honorEditForm.group_quota">
						<el-row>
							<div style="width:150px;float:left;">
								年级：<el-input v-model="group_quota.group"></el-input>
							</div>
							<div style="width:150px;float:left;">
								类别：
								<el-select v-model="group_quota.type">
									<template v-for="userType in _USER_TYPE">
										<el-option :label="_userTypeString(userType)" :value="userType"></el-option>
									</template>
								</el-select>
							</div>
							<div style="width:200px;float:left;">
								名额：<br /> <el-input-number v-model="group_quota.quota":min="0"></el-input-number>
							</div>
							<div style="width:150px;float:left;">
								操作：<br /><el-button type="danger" @click="honorEditForm.group_quota.splice(index, 1)">删除</el-button>
							</div>
						</el-row>
					</template>
					<el-row>
						<el-button type="primary" @click="honorEditForm.group_quota.push({group: '2017', type: 'undergraduate', quota: 1})">添加</el-button>
					</el-row>
				</el-form-item>
				<el-form-item label="申请填写表单">
					<el-select v-model="honorEditForm.form_id">
						<template v-for="form in forms">
							<el-option :label="form.name" :value="form.id"></el-option>
						</template>
					</el-select>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="honorEditFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="singleHonorEditSubmit" :loading="honorEditLoading">提交</el-button>
			</div>
		</el-dialog>

		<h1>荣誉评比</h1>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="rateFilters">
				<el-form-item label="学生年级">
					<el-input v-model="rateFilters.group" placeholder=""></el-input>
				</el-form-item>
				<el-form-item label="学生类别" prop="type">
					<el-select v-model="rateFilters.type">
						<template v-for="userType in _USER_TYPE">
							<el-option :label="_userTypeString(userType)" :value="userType"></el-option>
						</template>
					</el-select>
				</el-form-item>
				<el-form-item label="参与评比的荣誉">
					<el-select v-model="rateFilters.honors" :multiple="true">
						<template v-for="honor in honors">
							<el-option :label="honor.year + ' ' + honor.name" :value="honor.id"></el-option>
						</template>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="rateSearch">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="rates" highlight-current-row v-loading="rateListLoading" @selection-change="allRateSelsChange" style="width: 100%;" border>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="姓名" width="90" sortable>
			</el-table-column>
			<el-table-column prop="class" label="班级" width="90" sortable>
			</el-table-column>
			<el-table-column prop="student_id" label="学号" width="120" sortable>
			</el-table-column>
			<el-table-column prop="numOfOwnHonor" label="已获荣誉数" width="90" sortable>
				<template scope="scope">
					{{ countExistence(scope.row.honor_states, _APPLY_STATUS.SUCCESS) }}
				</template>
			</el-table-column>
			<template v-for="(honor, index) in rateHonors">
				<el-table-column :prop="honor.year + ' ' + honor.name" :sort-method="sort(index)" :label="honor.year + ' ' + honor.name" width="200" sortable>
					<template scope="scope">
						<template v-if="scope.row.honor_states[index] !== null">
							<a @click="singleChangeApplyStatus(scope.$index, index)" style="cursor: pointer;">
								<apply-status-tag :applyStatus="scope.row.honor_states[index]"></apply-status-tag>
							</a>
							<a @click="singleRate(scope.$index, index)" style="cursor: pointer;">
								<el-tag type="gray"> 平均评分：{{ scope.row.honor_aveScore[index] }} </el-tag>
							</a>
							<a @click="singleRate(scope.$index, index)" style="cursor: pointer;">
								<template v-if="scope.row.honor_scores[index][_UID] === undefined">
									<el-tag>您尚未给出评分</el-tag>
								</template>
								<template v-else>
									<el-tag type="gray">您的评分：{{ calcSum(scope.row.honor_scores[index][_UID]) }}</el-tag>
								</template>
							</a>
						</template>
					</template>
				</el-table-column>
			</template>

			<template slot="append">
				<tr>
					<td colspan="5" style="text-align:center;">申请人数</td>
					<template v-for="(honor, index) in rateHonors">
						<td style="text-align:center;">{{ countApply(index) }}</td>
					</template>					
				</tr>
				<tr>
					<td colspan="5" style="text-align:center;">获得人数</td>
					<template v-for="(honor, index) in rateHonors">
						<td style="text-align:center;">{{ countGet(index) }}</td>
					</template>					
				</tr>
				<tr>
					<td colspan="5" style="text-align:center;">名额</td>
					<template v-for="(honor, index) in rateHonors">
						<td style="text-align:center;">{{ countQuota(index) }}</td>
					</template>					
				</tr>
				<tr>
					<td colspan="5" style="text-align:center;">操作</td>
					<template v-for="(honor, index) in rateHonors">
					<td style="text-align:center;">
						<el-button size="small" @click="singleAssignHonor(index)">按名额授予得分最高的同学</el-button>
					</td>
					</template>					
				</tr>
			</template>
		</el-table>

		<!--设置获奖状态-->
		<el-dialog :title="'修改【' + honorStateSettingUser.name + '】申请【' + honorStateSettingHonor.year + ' ' + honorStateSettingHonor.name + '】的申请信息'" v-model="honorStateSettingVisible" size="large">
			<h1>申请状态</h1>
			<el-row>
				<el-radio-group v-model="honorStateSettingState">
					<template v-for="applyStatus in _APPLY_STATUS">
						<el-radio :label="applyStatus">
							<apply-status-tag :applyStatus="applyStatus"></apply-status-tag>
						</el-radio>
					</template>
				</el-radio-group>
			</el-row>
			<el-row>
				<el-button type="primary" @click.native="singleChangeApplyStatusSubmit">修改申请状态</el-button>
			</el-row>

			<h1>申请表</h1>
			<form-view></form-view>
			<br />
			<el-row>
				<el-button type="primary" @click.native="singleApplyEditSubmit" :loading="applyEditLoading">修改申请表</el-button>
			</el-row>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="honorStateSettingVisible = false">取消</el-button>
			</div>
		</el-dialog>

		<!--打分表-->
		<el-dialog :title="'为【' + honorRateUser.name + '】的申请【' + honorRateHonor.year + ' ' + honorRateHonor.name + '】评分'" v-model="honorRateVisible" size="large">
			<form-rate></form-rate>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="honorRateVisible = false">取消</el-button>
				<el-button type="primary" @click.native="singleRateSubmit" :loading="honorRateLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import { mapGetters } from "vuex"
	import { mapActions } from "vuex"
	import { apiGetFormList } from "../../api/api"
	import UserType from "../../common/js/userType"
	import FormType from "../../common/js/formType"
	import ApplyStatus from "../../common/js/applyStatus"
	import QueType from "../../common/js/queType"

	export default {
		computed: {
			_USER_TYPE: function() {
				return UserType.USER_TYPE;
			},
			_FORM_TYPE: function() {
				return FormType.FORM_TYPE;
			},
			_APPLY_STATUS: function() {
				return ApplyStatus.APPLY_STATUS;
			},
			_QUE_TYPE: function() {
				return QueType.QUE_TYPE;
			},
			_UID: function() {
				return sessionStorage.getItem('uid');
			}
		},
		data() {
			return {
				honorListLoading: false,
				honors: [
					{
						id: 4,
						name: "学业优秀奖",
						year: "2018",
						form_id: 6,
						start_time: "2017-09-01T10:54:24.738793",
						end_time: "2017-09-28T10:54:24.738793",
						group_quota: [
							{
								group: "2015",
								type: "undergraduate",
								quota: 10
							},
							{
								group: "2016",
								type: "undergraduate",
								quota: 4
							}
						],
						form_id: 4
					},
					{
						id: 5,
						name: "科技创新优秀奖",
						year: "2018",
						form_id: 6,
						start_time: "2017-09-01T10:54:24.738793",
						end_time: "2017-09-28T10:54:24.738793",
						group_quota: [
							{
								group: "2015",
								type: "undergraduate",
								quota: 10
							},
							{
								group: "2016",
								type: "undergraduate",
								quota: 4
							}
						],
						form_id: 4
					},
					{
						id: 6,
						name: "社会工作优秀奖",
						year: "2018",
						form_id: 7,
						start_time: "2017-09-01T10:54:24.738793",
						end_time: "2017-09-28T10:54:24.738793",
						group_quota: [
							{
								group: "2015",
								type: "undergraduate",
								quota: 10
							},
							{
								group: "2016",
								type: "undergraduate",
								quota: 4
							}
						],
						form_id: 4
					}
				],
				honorTotal: 3,
				honorSels: [],

				honorEditForm: {},
				honorEditFormVisible: false,
				honorEditLoading: false,
				start_time_date: '',
				end_time_date: '',

				forms: [],

				rateFilters: {
					group: "",
					type: "",
					honors: []
				},
				rateHonors: [],
				rateGroup: "",
				rateType: "",
				rateListLoading: false,
				rates: [
					{
						id: 1,
						name: "林梓楠",
						class: "无37",
						student_id: "2013011217",
						honor_fill_ids: [1, 2, 3],
						honor_states: ["applied", "success", "fail"],
						honor_scores: [
							{
								"3": {
									score5: 70,
									score6: 80,
									score7: 90,
									score8: 100,
									score15: [10, 20, 30]
								},
								"2": {
									score5: 70,
									score6: 80,
									score7: 90,
									score8: 100,
									score15: [10, 20, 30]
								}
							},
							{
								"1": {
									score5: 70,
									score6: 80,
									score7: 90,
									score8: 100,
									score15: [10, 20, 30]
								},
								"2": {
									score5: 70,
									score6: 80,
									score7: 90,
									score8: 100,
									score15: [10, 20, 30]
								}
							},
							{
								"1": {
									score5: 70,
									score6: 80,
									score7: 90,
									score8: 100,
									score15: [10, 20, 30]
								},
								"2": {
									score5: 70,
									score6: 80,
									score7: 90,
									score8: 100,
									score15: [10, 20, 30]
								}
							}
						],
						honor_aveScore: [100, 200, 300]
					},
					{
						id: 2,
						name: "宁雪妃",
						class: "无39",
						student_id: "2019011217",
						honor_fill_ids: [1, null, 3],
						honor_states: ["applied", null, "fail"],
						honor_scores: [
							{
								"1": {
									score5: 70,
									score6: 80,
									score7: 90,
									score8: 100,
									score15: [10, 20, 30]
								},
								"2": {
									score5: 70,
									score6: 80,
									score7: 90,
									score8: 100,
									score15: [10, 20, 30]
								}
							},
							null,
							{
								"3": {
									score5: 70,
									score6: 80,
									score7: 90,
									score8: 100,
									score15: [10, 20, 30]
								},
								"2": {
									score5: 70,
									score6: 80,
									score7: 90,
									score8: 100,
									score15: [10, 20, 30]
								}
							}
						],
						honor_aveScore: [200, null, 500]
					},
					{
						id: 3,
						name: "宁雪妃2",
						class: "无392",
						student_id: "2019012172",
						honor_fill_ids: [1, null, 3],
						honor_states: ["applied", null, "success"],
						honor_scores: [
							{
								"1": {
									score5: 70,
									score6: 80,
									score7: 90,
									score8: 100,
									score15: [10, 20, 30]
								},
								"2": {
									score5: 70,
									score6: 80,
									score7: 90,
									score8: 100,
									score15: [10, 20, 30]
								}
							},
							null,
							{
								"1": {
									score5: 70,
									score6: 80,
									score7: 90,
									score8: 100,
									score15: [10, 20, 30]
								},
								"2": {
									score5: 70,
									score6: 80,
									score7: 90,
									score8: 100,
									score15: [10, 20, 30]
								}
							}
						],
						honor_aveScore: [50, null, 900]
					}
				],
				rateSels: [],

				honorStateSettingVisible: false,
				honorStateSettingUser: {},
				honorStateSettingHonor: {},
				honorStateSettingState: "",
				applyEditLoading: false,
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

				honorRateVisible: false,
				honorRateUser: {},
				honorRateHonor: {},
				honorRateLoading: false

			}
		},
		methods: {
			timeFormatter: function (row, column) {
				if (column.property === "end_time") {
					return new Date(row.end_time).toLocaleString().replace(/:\d{1,2}$/,' '); 
				} else {
					return new Date(row.start_time).toLocaleString().replace(/:\d{1,2}$/,' '); 
				}
			},
			allHonorSelsChange: function (sels) {
				this.honorSels = sels;
			},
			allRateSelsChange: function (sels) {
				this.rateSels = sels;
			},
			allHonorCurrentChange: function (val) {

			},
			singleHonorEdit: function (index, row) {
				this.honorEditForm = JSON.parse(JSON.stringify(row));
				this.start_time_date = new Date(row.start_time);
				this.end_time_date = new Date(row.end_time);
				this.honorEditFormVisible = true;
			},
			singleHonorDel: function (index, row) {
			},
			allHonorBatchRemove: function () {

			},
			singleHonorEditSubmit: function () {
				this.honorEditForm.start_time = this.start_time_date.toISOString();
				console.log(this.honorEditForm.start_time);
				this.honorEditForm.end_time = this.end_time_date.toISOString();
			},
			singleChangeApplyStatus: function (row, col) {
				this.honorStateSettingUser = this.rates[row];
				this.honorStateSettingHonor = this.rateHonors[col];
				this.honorStateSettingState = this.rates[row].honor_states[col];
				this.setForm(JSON.parse(JSON.stringify(this.testForm)));
				this.setFill(JSON.parse(JSON.stringify(this.testFill)));
				this.honorStateSettingVisible = true;
			},
			singleChangeApplyStatusSubmit: function () {
				console.log(this.honorStateSettingUser);
				console.log(this.honorStateSettingHonor);
				console.log(this.honorStateSettingState);
			},
			singleApplyEditSubmit: function () {

			},
			singleRate: function (row, col) {
				this.honorRateUser = this.rates[row];
				this.honorRateHonor = this.rateHonors[col];
				var tmpForm = JSON.parse(JSON.stringify(this.testForm));
				tmpForm.fields = [];
				var tmpFill = {};
				var tmpRate = {};
				for (var i in this.rates[row].honor_scores[col]) {
					tmpRate[i] = [];
				}
				for (var i = 0; i < this.testForm.fields.length; i++) {
					if (this.testForm.fields[i].type === this._QUE_TYPE.STRING_SINGLE_LINE || this.testForm.fields[i].type === this._QUE_TYPE.STRING_MULTIPLE_LINE) {
						tmpForm.fields.push(this.testForm.fields[i]);
						tmpFill["data" + (tmpForm.fields.length - 1)] = this.testFill["data" + i];
						for (var j in this.rates[row].honor_scores[col]) {
							tmpRate[j].push(this.rates[row].honor_scores[col][j]["score" + i])
						}
					} else if (this.testForm.fields[i].type === this._QUE_TYPE.TABLE) {
						for (var j = 0; j < this.testFill["data" + i].length; j++) {
							tmpForm.fields.push(JSON.parse(JSON.stringify(this.testForm.fields[i])));
							tmpFill["data" + (tmpForm.fields.length - 1)] = [ this.testFill["data" + i][j] ];
							for (var k in this.rates[row].honor_scores[col]) {
								tmpRate[k].push(this.rates[row].honor_scores[col][k]["score" + i][j])
							}							
						}
					}
				}
				this.setForm(tmpForm);
				this.setFill(tmpFill);
				this.setRate(tmpRate);
				this.honorRateVisible = true;			
			},
			singleRateSubmit: function () {

			},
			singleAssignHonor: function (index) {
				console.log(index);
			},
			updateTable: function () {
				for (var i = 0; i < this.rates.length; i++) {
					this.$set(this.rates, i, this.rates[i]);
				}
			},
			rateSearch: function () {
				this.rateHonors = this.honors;
				this.rateGroup = this.rateFilters.group;
				this.rateType = this.rateFilters.type;
				this.updateTable();
			},
			sort: function (index) {
				return function(a, b) {
					return b.honor_aveScore[index] === null || a.honor_aveScore[index] >= b.honor_aveScore[index];
				}
			},
			countApply: function (index) {
				var sum = 0;
				for (var i in this.rates) {
					if (this.rates[i].honor_states[index] !== null) {
						sum += 1;
					}
				}
				return sum;
			},
			countGet: function (index) {
				var sum = 0;
				for (var i in this.rates) {
					if (this.rates[i].honor_states[index] === this._APPLY_STATUS.SUCCESS) {
						sum += 1;
					}
				}
				return sum;
			},
			countQuota: function (index) {
				var quota = 0;
				for (var i in this.rateHonors[index].group_quota) {				
					if (this.rateHonors[index].group_quota[i].group === this.rateGroup && this.rateHonors[index].group_quota[i].type === this.rateType) {
						quota = this.rateHonors[index].group_quota[i].quota;
						break;
					}
				}
				return quota;
			},
			countExistence: function (arr, obj) {
				var ans = 0;
				for (var i = 0; i < arr.length; i++) {
					if (arr[i] == obj) {
						ans += 1;
					}
				}
				return ans;
			},
			calcSum: function (arr) {
				var sum = 0;
				for (var i in arr) {
					if (typeof arr[i] == 'number') {
						sum += arr[i];
					} else {
						for (var j in arr[i]) {
							sum += arr[i][j];
						}
					}
				}
				return sum;
			},
			_userTypeString: function (type) {
				return UserType.userTypeString(type);
			},
			_applyStatusString: function(str) {
				return ApplyStatus.applyStatusString(str);
			},
			getFormList: function () {
				var params = {};
				params["type"] = this._FORM_TYPE.APPLY;
				apiGetFormList(params).then(res => {
					this.forms = res.data;
				}).catch(error => {
					this.$notify({
						title: "加载表单列表失败",
						message: error.response.data.message,
						type: "error"
					});
				}).catch(error => {
					this.$notify({
						title: "加载表单列表失败",
						message: "请检查网络连接",
						type: "error"
					});
				});
			},
			...mapActions([
				"setForm",
				"setFill",
				"setRate"
			])
		},
		mounted() {
			this.getFormList();
		}
	}

</script>

<style scoped>

</style>