<template>
	<section>
		<h1>奖学金编辑</h1>
		<!--列表-->
		<el-table :data="scholarships" highlight-current-row v-loading="scholarshipListLoading" @selection-change="allScholarshipSelsChange" style="width: 100%;" border>
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="奖学金名" width="200" sortable>
			</el-table-column>
			<el-table-column prop="year" label="年份" width="100" sortable>
			</el-table-column>
			<el-table-column label="操作">
				<template scope="scope">
					<el-button size="small" @click="singleScholarshipEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="singleSchoarshipDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="allScholarshipBatchRemove" :disabled="this.scholarshipSels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="allScholarshipCurrentChange" :page-size="20" :total="scholarshipTotal" style="float:right;">
			</el-pagination>
		</el-col>
		
		<!--奖学金编辑界面-->
		<el-dialog title="编辑" v-model="scholarshipEditFormVisible" :close-on-click-modal="false" size="large">
			<el-form :model="scholarshipEditForm" label-width="80px" ref="scholarshipEditForm">
				<el-form-item label="奖学金名" prop="name">
					<el-input v-model="scholarshipEditForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="年份" prop="year">
					<el-input v-model="scholarshipEditForm.year" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="感谢信表单">
					<el-select v-model="scholarshipEditForm.form_id">
						<template v-for="form in forms">
							<el-option :label="form.name" :value="form.id"></el-option>
						</template>
					</el-select>
				</el-form-item>
				<el-form-item label="分配方式">
					<el-select v-model="scholarshipEditForm.alloc">
						<template v-for="type in _SCHOLARSHIP_ALLOC_TYPE">
							<el-option :label="_scholarshipAllocTypeString(type)" :value="type"></el-option>
						</template>
					</el-select>
				</el-form-item>
				<template v-if="scholarshipEditForm.alloc === _SCHOLARSHIP_ALLOC_TYPE.QUOTA">
					<el-form-item label="每人金额（元）">
						<el-input-number v-model="scholarshipEditForm.money" :min="0"></el-input-number>
					</el-form-item>
					<el-form-item label="各年级名额">
						<template v-for="(group_quota, index) in scholarshipEditForm.group_quota">
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
									操作：<br /><el-button type="danger" @click="scholarshipEditForm.group_quota.splice(index, 1)">删除</el-button>
								</div>
							</el-row>
						</template>
						<el-row>
							<el-button type="primary" @click="scholarshipEditForm.group_quota.push({group: '2017', type: 'undergraduate', quota: 1})">添加</el-button>
						</el-row>
					</el-form-item>
				</template>
				<template v-else-if="scholarshipEditForm.alloc === _SCHOLARSHIP_ALLOC_TYPE.MONEY">
					<el-form-item label="各年级总金额（元）">
						<template v-for="(group_quota, index) in scholarshipEditForm.group_quota">
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
									总金额：<br /> <el-input-number v-model="group_quota.quota":min="0"></el-input-number>
								</div>
								<div style="width:150px;float:left;">
									操作：<br /><el-button type="danger" @click="scholarshipEditForm.group_quota.splice(index, 1)">删除</el-button>
								</div>
							</el-row>
						</template>
						<el-row>
							<el-button type="primary" @click="scholarshipEditForm.group_quota.push({group: '2017', type: 'undergraduate', quota: 1})">添加</el-button>
						</el-row>
					</el-form-item>
				</template>

			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="scholarshipEditFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="singleScholarshipEditSubmit" :loading="scholarshipEditLoading">提交</el-button>
			</div>
		</el-dialog>


		<h1>奖学金分配</h1>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="allocFilters">
				<el-form-item label="学生年级">
					<el-input v-model="allocFilters.group" placeholder=""></el-input>
				</el-form-item>
				<el-form-item label="学生类别" prop="type">
					<el-select v-model="allocFilters.type">
						<template v-for="userType in _USER_TYPE">
							<el-option :label="_userTypeString(userType)" :value="userType"></el-option>
						</template>
					</el-select>
				</el-form-item>
				<el-form-item label="显示的荣誉">
					<el-select v-model="allocFilters.honors" :multiple="true">
						<template v-for="honor in honors">
							<el-option :label="honor.year + ' ' + honor.name" :value="honor.id"></el-option>
						</template>
					</el-select>
				</el-form-item>
				<el-form-item label="参与分配的奖学金">
					<el-select v-model="allocFilters.scholarships" :multiple="true">
						<template v-for="scholarship in scholarships">
							<el-option :label="scholarship.year + ' ' + scholarship.name" :value="scholarship.id"></el-option>
						</template>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="allocSearch">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="alloc" highlight-current-row v-loading="allocListLoading" @selection-change="allAllocSelsChange" style="width: 100%;" border>
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
					{{ countExistence(scope.row.states, _APPLY_STATUS.SUCCESS) }}
				</template>
			</el-table-column>
			<template v-for="(honor, index) in allocHonors">
				<el-table-column :prop="honor.year + ' ' + honor.name":label="honor.year + ' ' + honor.name" width="90">
					<template scope="scope">
						<template v-if="scope.row.states[index] !== null">
							<apply-status-tag :applyStatus="scope.row.states[index]"></apply-status-tag>
						</template>
					</template>
				</el-table-column>
			</template>
		</el-table>
	</section>
</template>

<script>
	import { apiGetFormList } from "../../api/api"
	import UserType from "../../common/js/userType"
	import FormType from "../../common/js/formType"
	import ApplyStatus from "../../common/js/applyStatus"
	import ScholarshipAllocType from "../../common/js/scholarshipAllocType"

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
			_SCHOLARSHIP_ALLOC_TYPE: function() {
				return ScholarshipAllocType.SCHOLARSHIP_ALLOC_TYPE;
			}
		},
		data() {
			return {
				scholarshipListLoading: false,
				scholarships: [
					{
						id: 1,
						name: "国家奖学金",
						year: "2017",
						form_id: 5,
						alloc: "quota",
						group_quota: [
							{
								group: "2015",
								type: "undergraduate",
								quota: 15
							},
							{
								group: "2016",
								type: "undergraduate",
								quota: 4
							}
						],
						money: 8000
					},
					{
						id: 2,
						name: "一二九奖学金",
						year: "2015",
						form_id: 5,
						alloc: "money",
						group_quota: [
							{
								group: "2015",
								type: "undergraduate",
								quota: 20000
							},
							{
								group: "2016",
								type: "undergraduate",
								quota: 40000
							}
						],
						money: null
					}
				],
				scholarshipTotal: 0,
				scholarshipSels: [],

				scholarshipEditForm: {},
				scholarshipEditFormVisible: false,
				scholarshipEditLoading: false,
				forms: [],

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

				allocFilters: {
					group: "",
					type: "",
					honors: [],
					scholarships: []
				},
				allocHonors: [],
				allocGroup: "",
				allocType: "",
				allocListLoading: false,
				alloc: [
					{
						id: 1,
						name: "林梓楠",
						class: "无37",
						student_id: "2013011217",
						fill_ids: [1, 2, 3],
						states: ["applied", "success", "fail"],
						scores: [
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
						aveScore: [50, null, 900]
					}
				],
				allocSels: []
			}
		},
		methods: {
			allScholarshipSelsChange: function (sels) {
				this.scholarshipSels = sels;
			},	
			singleScholarshipEdit: function (index, row) {
				this.scholarshipEditForm = JSON.parse(JSON.stringify(row));
				this.scholarshipEditFormVisible = true;
			},
			singleSchoarshipDel: function (index, row) {

			},
			allScholarshipBatchRemove: function () {

			},
			allScholarshipCurrentChange: function (val) {

			},
			updateTable: function () {
				for (var i = 0; i < this.alloc.length; i++) {
					this.$set(this.alloc, i, this.alloc[i]);
				}
			},
			allocSearch: function () {
				this.allocHonors = this.honors;
				this.allocGroup = this.allocFilters.group;
				this.allocType = this.allocFilters.type;
				this.updateTable();
			},
			allAllocSelsChange: function (sels) {
				this.allocSels = sels;
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
			_userTypeString: function (type) {
				return UserType.userTypeString(type);
			},
			_scholarshipAllocTypeString: function(str) {
				return ScholarshipAllocType.scholarshipAllocTypeString(str);
			},
			getFormList: function () {
				var params = {};
				params["type"] = this._FORM_TYPE.THANKS;
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