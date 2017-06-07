<template>
	<section>
		<h1>荣誉编辑</h1>
		<!--列表-->
		<el-table :data="honors" highlight-current-row v-loading="honorListLoading" @selection-change="allHonorSelsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="荣誉名" width="220" sortable>
			</el-table-column>
			<el-table-column prop="year" label="年份" width="150" sortable>
			</el-table-column>
			<el-table-column prop="start_time" label="申请开始时间" :formatter="timeFormatter" width="180" sortable>
			</el-table-column>
			<el-table-column prop="end_time" label="申请结束时间" :formatter="timeFormatter" width="180" sortable>
			</el-table-column>
			<el-table-column label="操作">
				<template scope="scope">
					<el-button size="small" @click="singleHonorEdit(scope.$index, scope.row)">编辑</el-button>
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
		<el-dialog title="编辑" v-model="honorEditFormVisible" :close-on-click-modal="false">
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
							<el-col :span="5">年级：<el-input v-model="group_quota.group"></el-input></el-col>
							<el-col :span="5">
								类别：
								<el-select v-model="group_quota.type">
									<template v-for="userType in _USER_TYPE">
										<el-option :label="_userTypeString(userType)" :value="userType"></el-option>
									</template>
								</el-select>
							</el-col>
							<el-col :span="7">名额：<el-col><el-input-number v-model="group_quota.quota":min="0"></el-input-number></el-col></el-col>
							<el-col :span="6">操作：<br /><el-button type="danger" @click="honorEditForm.group_quota.splice(index, 1)">删除</el-button></el-col>
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
					<el-button type="primary" v-on:click="rateSearch">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="rates" highlight-current-row v-loading="rateListLoading" @selection-change="allRateSelsChange" style="width: 100%;">
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="姓名" width="120" sortable>
			</el-table-column>
			<el-table-column prop="class" label="班级" width="120" sortable>
			</el-table-column>
			<el-table-column prop="student_id" label="学号" width="120" sortable>
			</el-table-column>
			<el-table-column prop="numOfOwnHonor" label="获得荣誉个数" width="150" sortable>
				<template scope="scope">
					{{ countExistence(scope.row.states, _APPLY_STATUS.SUCCESS) }}
				</template>
			</el-table-column>
			<template v-for="(honor, index) in rateHonors">
				<el-table-column :prop="honor.year + ' ' + honor.name" :sort-method="sort(index)" :label="honor.year + ' ' + honor.name" width="200" sortable>
					<template scope="scope">
						<template v-if="scope.row.states[index] !== null">
							<template v-if="scope.row.states[index] === _APPLY_STATUS.SUCCESS">
								<el-tag type="success"> {{ _applyStatusString(scope.row.states[index]) }} </el-tag>
							</template>
							<template v-else-if="scope.row.states[index] === _APPLY_STATUS.FAIL">
								<el-tag type="danger"> {{ _applyStatusString(scope.row.states[index]) }} </el-tag>
							</template>
							<template v-else-if="scope.row.states[index] === _APPLY_STATUS.APPLIED">
								<el-tag type="primary"> {{ _applyStatusString(scope.row.states[index]) }} </el-tag>
							</template>
							<el-tag type="gray"> 平均评分：{{ scope.row.aveScore[index] }} </el-tag>
							<template v-if="scope.row.scores[index][_UID] === undefined">
								<el-tag>您尚未给出评分</el-tag>
							</template>
							<template v-else>
								<el-tag type="gray">您的评分：{{ calcSum(scope.row.scores[index][_UID]) }}</el-tag>
							</template>
						</template>
					</template>
				</el-table-column>
			</template>

			<template slot="append">
				<tr>
					<td colspan="5" style="text-align:center;">申请人数</td>
					<template v-for="(honor, index) in rateHonors">
						<td>{{ countApply(index) }}</td>
					</template>					
				</tr>
				<tr>
					<td colspan="5" style="text-align:center;">获得人数</td>
					<template v-for="(honor, index) in rateHonors">
						<td>{{ countGet(index) }}</td>
					</template>					
				</tr>
				<tr>
					<td colspan="5" style="text-align:center;">名额</td>
					<template v-for="(honor, index) in rateHonors">
						<td>{{ countQuota(index) }}</td>
					</template>					
				</tr>
				<tr>
					<td colspan="5" style="text-align:center;">操作</td>
					<template v-for="(honor, index) in rateHonors">
						<td></td>
					</template>					
				</tr>
			</template>
		</el-table>

	</section>
</template>

<script>
	import { apiGetFormList } from "../../api/api"
	import UserType from "../../common/js/userType"
	import FormType from "../../common/js/formType"
	import ApplyStatus from "../../common/js/applyStatus"

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
						start_time: 1489742695,
						end_time: 1489743000,
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
						start_time: 1489742695,
						end_time: 1489743000,
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
						start_time: 1489742695,
						end_time: 1489743000,
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
						fill_ids: [1, 2, 3],
						states: ["applied", "success", "fail"],
						scores: [
							{
								"3": [90, 80, 70, 60, 50],
								"2": [20, 30, 40, 50, 60]
							},
							{
								"1": [90, 80, 70, 60, 50],
								"2": [20, 30, 40, 50, 60]
							},
							{
								"1": [90, 80, 70, 60, 50],
								"2": [20, 30, 40, 50, 60]
							}
						],
						aveScore: [100, 200, 300]
					},
					{
						id: 2,
						name: "宁雪妃",
						class: "无39",
						student_id: "2019011217",
						fill_ids: [1, null, 3],
						states: ["applied", null, "fail"],
						scores: [
							{
								"1": [90, 80, 70, 60, 50],
								"2": [20, 30, 40, 50, 60]
							},
							null,
							{
								"3": [90, 80, 70, 60, 50],
								"2": [20, 30, 40, 50, 60]
							}
						],
						aveScore: [200, null, 500]
					},
					{
						id: 3,
						name: "宁雪妃2",
						class: "无392",
						student_id: "2019012172",
						fill_ids: [1, null, 3],
						states: ["applied", null, "success"],
						scores: [
							{
								"1": [90, 80, 70, 60, 50],
								"2": [20, 30, 40, 50, 60]
							},
							null,
							{
								"1": [90, 80, 70, 60, 50],
								"2": [20, 30, 40, 50, 60]
							}
						],
						aveScore: [50, null, 900]
					}
				],
				rateSels: []

			}
		},
		methods: {
			timeFormatter: function (row, column) {
				if (column.property === "end_time") {
					return new Date(row.end_time * 1000).toLocaleString().replace(/:\d{1,2}$/,' '); 
				} else {
					return new Date(row.start_time * 1000).toLocaleString().replace(/:\d{1,2}$/,' '); 
				}
			},
			allHonorSelsChange: function(sels) {
				this.honorSels = sels;
			},
			allRateSelsChange: function(sels) {
				this.rateSels = sels;
			},
			allHonorCurrentChange: function (val) {

			},
			singleHonorEdit: function (index, row) {
				this.honorEditForm = JSON.parse(JSON.stringify(row));
				this.start_time_date = new Date(row.start_time * 1000);
				this.end_time_date = new Date(row.end_time * 1000);
				this.honorEditFormVisible = true;
			},
			allHonorBatchRemove: function () {

			},
			singleHonorEditSubmit: function () {
				this.honorEditForm.start_time = this.start_time_date.getTime() / 1000;
				this.honorEditForm.end_time = this.end_time_date.getTime() / 1000;
			},
			rateSearch: function () {
				this.rateHonors = this.honors;
				this.rateGroup = this.rateFilters.group;
				this.rateType = this.rateFilters.type;
				//Vue.set(this.rates[0].aveScore, 0, this.rates[0].aveScore[0] + 100);
				//this.rates[0].aveScore[0] += 100;
			},
			sort: function (index) {
				return function(a, b) {
					return b.aveScore[index] === null || a.aveScore[index] >= b.aveScore[index];
				}
			},
			countApply: function (index) {
				var sum = 0;
				for (var i in this.rates) {
					if (this.rates[i].states[index] !== null) {
						sum += 1;
					}
				}
				return sum;
			},
			countGet: function (index) {
				var sum = 0;
				for (var i in this.rates) {
					if (this.rates[i].states[index] === this._APPLY_STATUS.SUCCESS) {
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
					sum += arr[i];
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
				this.listLoading = true;
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
			}
		},
		mounted() {
			this.getFormList();
		}
	}

</script>

<style scoped>

</style>