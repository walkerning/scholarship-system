<template>
	<section>
		<h1>奖学金编辑</h1>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="scholarshipFilters">
				<el-form-item>
					<el-input v-model="scholarshipFilters.name" placeholder="奖学金名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="scholarshipFilters.year" placeholder="年份"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="allScholarshipSearch">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="allScholarshipAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>
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
					<el-button type="primary" size="small" @click="singleScholarshipFinal(scope.$index, scope.row)">最终提交</el-button>
					<el-button size="small" @click="singleScholarshipCopy(scope.$index, scope.row)">从该奖学金创建</el-button>
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

		<!--奖学金新增界面-->
		<el-dialog title="新增" v-model="scholarshipAddFormVisible" :close-on-click-modal="false" size="large">
			<el-form :model="scholarshipAddForm" label-width="80px" ref="scholarshipAddForm">
				<el-form-item label="奖学金名" prop="name">
					<el-input v-model="scholarshipAddForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="年份" prop="year">
					<el-input v-model="scholarshipAddForm.year" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="感谢信表单">
					<el-select v-model="scholarshipAddForm.form_id">
						<template v-for="form in forms">
							<el-option :label="form.name" :value="form.id"></el-option>
						</template>
					</el-select>
				</el-form-item>
				<el-form-item label="分配方式">
					<el-select v-model="scholarshipAddForm.alloc">
						<template v-for="type in _SCHOLARSHIP_ALLOC_TYPE">
							<el-option :label="_scholarshipAllocTypeString(type)" :value="type"></el-option>
						</template>
					</el-select>
				</el-form-item>
				<template v-if="scholarshipAddForm.alloc === _SCHOLARSHIP_ALLOC_TYPE.QUOTA">
					<el-form-item label="每人金额（元）">
						<el-input-number v-model="scholarshipAddForm.money" :min="0"></el-input-number>
					</el-form-item>
					<el-form-item label="各年级名额">
						<template v-for="(group_quota, index) in scholarshipAddForm.group_quota">
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
									操作：<br /><el-button type="danger" @click="scholarshipAddForm.group_quota.splice(index, 1)">删除</el-button>
								</div>
							</el-row>
						</template>
						<el-row>
							<el-button type="primary" @click="scholarshipAddForm.group_quota.push({group: '2017', type: 'undergraduate', quota: 1})">添加</el-button>
						</el-row>
					</el-form-item>
				</template>
				<template v-else-if="scholarshipAddForm.alloc === _SCHOLARSHIP_ALLOC_TYPE.MONEY">
					<el-form-item label="各年级总金额（元）">
						<template v-for="(group_quota, index) in scholarshipAddForm.group_quota">
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
									操作：<br /><el-button type="danger" @click="scholarshipAddForm.group_quota.splice(index, 1)">删除</el-button>
								</div>
							</el-row>
						</template>
						<el-row>
							<el-button type="primary" @click="scholarshipAddForm.group_quota.push({group: '2017', type: 'undergraduate', quota: 1})">添加</el-button>
						</el-row>
					</el-form-item>
				</template>

			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="scholarshipAddFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="singleScholarshipAddSubmit" :loading="scholarshipAddLoading">提交</el-button>
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

		<!--学生分配列表-->
		<el-table :data="alloc" highlight-current-row v-loading="allocListLoading" @selection-change="allAllocSelsChange" style="width: 100%;" border max-height="1000">
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
			</el-table-column>
			<el-table-column prop="scholarship_money_sum" label="已获奖学金额度" width="90" sortable>
			</el-table-column>
			<el-table-column type="expand">
				<template scope="scope">
					<h4>分配的奖学金及金额</h4>
					<template v-for="(scholarship, index) in allocScholarships">
						<template v-if="scope.row.scholarship_states[index] == _APPLY_STATUS.SUCCESS">
							<el-row :gutter="20">
								<el-col :span="7" :offset="1">
									{{scholarship.year}} {{scholarship.name}}
								</el-col>
								<el-col :span="5">
									<template v-if="scholarship.alloc === _SCHOLARSHIP_ALLOC_TYPE.QUOTA">
										<el-input-number v-model="scholarship.money" size="small" :disabled="true"></el-input-number>
									</template>
									<template v-else-if="scholarship.alloc === _SCHOLARSHIP_ALLOC_TYPE.MONEY">
										<el-input-number v-model="scope.row.scholarship_money[index]" size="small"></el-input-number>
									</template>
								</el-col>
								<template v-if="scholarship.alloc === _SCHOLARSHIP_ALLOC_TYPE.MONEY">
									<el-col :span="3">
										<el-button size="small" type="primary" @click="singleScholarshipAllocSubmit(scope.$index, index)">修改金额</el-button>
									</el-col>
								</template>
								<el-col :span="3">
									<el-button size="small" type="danger" @click="singleScholarshipAllocDelete(scope.$index, index)">删除</el-button>
								</el-col>
							</el-row>
						</template>
					</template>
					<el-row :gutter="20">
						<el-col :span="7" :offset="1">
							<el-select v-model="scope.row.scholarship_add" placeholder="新增奖学金">
								<template v-for="(scholarship, index) in allocScholarships">
									<el-option :key="index" :value="index" :label="scholarship.year + ' ' + scholarship.name">
									</el-option>
								</template>
							</el-select>
						</el-col>
						<template v-if="scope.row.scholarship_add !== null">
							<el-col :span="5">
								<template v-if="allocScholarships[scope.row.scholarship_add].alloc === _SCHOLARSHIP_ALLOC_TYPE.QUOTA">
									<el-input-number v-model="allocScholarships[scope.row.scholarship_add].money" size="small" :disabled="true"></el-input-number>
								</template>
								<template v-else-if="allocScholarships[scope.row.scholarship_add].alloc === _SCHOLARSHIP_ALLOC_TYPE.MONEY">
									<el-input-number v-model="scope.row.scholarship_money_add" size="small"></el-input-number>
								</template>
							</el-col>
							<el-col :span="3">
								<el-button size="small" type="primary" @click="singleScholarshipAllocAddSubmit(scope.$index)">添加</el-button>
							</el-col>
						</template>
					</el-row>
				</template>
			</el-table-column>
			<template v-for="(honor, index) in allocHonors">
				<el-table-column :prop="honor.year + ' ' + honor.name" :label="honor.year + ' ' + honor.name" width="90">
					<template scope="scope">
						<template v-if="scope.row.honor_states[index] !== null">
							<apply-status-tag :applyStatus="scope.row.honor_states[index]"></apply-status-tag>
						</template>
					</template>
				</el-table-column>
			</template>
		</el-table>

		<br />
		<!--奖学金分配列表-->
		<el-table :data="allocScholarships" highlight-current-row v-loading="allocScholarshipListLoading" @selection-change="allAllocScholarshipSelsChange" style="width: 100%;" border max-height="1000">
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="奖学金名" width="200" sortable>
			</el-table-column>
			<el-table-column prop="year" label="年份" width="100" sortable>
			</el-table-column>
			<el-table-column label="可分配总金额/名额">
				<template scope="scope">
					{{ findQuota(scope.row.group_quota, allocGroup, allocType) }}
				</template>
			</el-table-column>
			<el-table-column label="已分配总金额/名额">
				<template scope="scope">
					{{ findQuota(scope.row.group_alloc_quota, allocGroup, allocType) }}
				</template>
			</el-table-column>
		</el-table>

		<h1>感谢信查看</h1>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="thanksFilters">
				<el-form-item label="学生年级">
					<el-input v-model="thanksFilters.group" placeholder=""></el-input>
				</el-form-item>
				<el-form-item label="学生类别" prop="type">
					<el-select v-model="thanksFilters.type">
						<template v-for="userType in _USER_TYPE">
							<el-option :label="_userTypeString(userType)" :value="userType"></el-option>
						</template>
					</el-select>
				</el-form-item>
				<el-form-item label="奖学金">
					<el-select v-model="thanksFilters.scholarships" :multiple="true">
						<template v-for="scholarship in scholarships">
							<el-option :label="scholarship.year + ' ' + scholarship.name" :value="scholarship.id"></el-option>
						</template>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="thanksSearch">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>
		<!--感谢信列表-->
		<el-table :data="thanks" highlight-current-row v-loading="thanksListLoading" @selection-change="allThanksSelsChange" style="width: 100%;" border max-height="1000">
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="姓名" width="90" sortable>
			</el-table-column>
			<el-table-column prop="class" label="班级" width="90" sortable>
			</el-table-column>
			<el-table-column prop="student_id" label="学号" width="120" sortable>
			</el-table-column>
			<template v-for="(scholarship, index) in thanksScholarships">
				<el-table-column :prop="scholarship.year + ' ' + scholarship.name" :label="scholarship.year + ' ' + scholarship.name" width="125">
					<template scope="scope">
						<template v-if="scope.row.scholarship_states[index] === _APPLY_STATUS.SUCCESS">
							<template v-if="scope.row.scholarship_fill_ids[index] === null">
								未填写感谢信
							</template>
							<template v-else>
								<el-button size="small" @click="singleThanksView(scope.$index, index)">查看感谢信</el-button>
							</template>
						</template>
					</template>
				</el-table-column>				
			</template>
		</el-table>
		<!--感谢信查看界面-->
		<el-dialog title="查看" v-model="thanksViewVisible" size="large">
			<form-view></form-view>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="thanksViewVisible = false">取消</el-button>
				<el-button type="primary" @click.native="singleThanksSubmit" :loading="thanksViewLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import { mapActions } from "vuex"
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
				scholarshipFilters: {
					name: "",
					year: ""
				},
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
						group_alloc_quota: [
							{
								group: "2015",
								type: "undergraduate",
								quota: 10
							},
							{
								group: "2016",
								type: "undergraduate",
								quota: 2
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
						group_alloc_quota: [
							{
								group: "2015",
								type: "undergraduate",
								quota: 10000
							},
							{
								group: "2016",
								type: "undergraduate",
								quota: 20000
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

				scholarshipAddForm: {
					name: "",
					year: "",
					form_id: null,
					alloc: "",
					group_quota: []
				},
				scholarshipAddFormVisible: false,
				scholarshipAddLoading: false,

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
				allocScholarships: [],
				allocGroup: "",
				allocType: "",
				allocListLoading: false,
				alloc: [
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
						honor_aveScore: [100, 200, 300],
						scholarship_money_sum: 10000,
						scholarship_states: ["success", "success"],
						scholarship_money: [1000, 4000],
						scholarship_add: null,
						scholarship_money_add: 0,
						scholarship_fill_ids: [1, null]
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
						honor_aveScore: [200, null, 500],
						scholarship_money_sum: 20000,
						scholarship_states: ["success", null],
						scholarship_money: [null, null],
						scholarship_add: null,
						scholarship_money_add: 0,
						scholarship_fill_ids: [1, null]
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
						honor_aveScore: [50, null, 900],
						scholarship_money_sum: 30000,
						scholarship_states: [null, "success"],
						scholarship_money: [null, 3000],
						scholarship_add: null,
						scholarship_money_add: 0,
						scholarship_fill_ids: [null, null]
					}
				],
				allocSels: [],

				allocScholarshipListLoading: false,
				allocScholarshipSels: [],

				thanksListLoading: false,
				thanksSels: [],

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

				thanksFilters: {
					group: "",
					type: "",
					scholarships: []
				},
				thanks: [
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
						honor_aveScore: [100, 200, 300],
						scholarship_money_sum: 10000,
						scholarship_states: ["success", "success"],
						scholarship_money: [1000, 4000],
						scholarship_add: null,
						scholarship_money_add: 0,
						scholarship_fill_ids: [1, null]
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
						honor_aveScore: [200, null, 500],
						scholarship_money_sum: 20000,
						scholarship_states: ["success", null],
						scholarship_money: [null, null],
						scholarship_add: null,
						scholarship_money_add: 0,
						scholarship_fill_ids: [1, null]
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
						honor_aveScore: [50, null, 900],
						scholarship_money_sum: 30000,
						scholarship_states: [null, "success"],
						scholarship_money: [null, 3000],
						scholarship_add: null,
						scholarship_money_add: 0,
						scholarship_fill_ids: [null, null]
					}
				],
				thanksScholarships: [],
				thanksGroup: "",
				thanksType: "",
				thanksViewVisible: false,
				thanksViewLoading: false
			}
		},
		methods: {
			allScholarshipSearch: function () {

			},
			allScholarshipAdd: function () {
				this.scholarshipAddFormVisible = true;
			},	
			allScholarshipSelsChange: function (sels) {
				this.scholarshipSels = sels;
			},	
			singleScholarshipEdit: function (index, row) {
				this.scholarshipEditForm = JSON.parse(JSON.stringify(row));
				this.scholarshipEditFormVisible = true;
			},
			singleScholarshipEditSubmit: function () {

			},
			singleScholarshipAddSubmit: function () {

			},
			singleScholarshipCopy: function(index, row) {
				this.scholarshipAddForm = JSON.parse(JSON.stringify(row));
				this.scholarshipAddFormVisible = true;
			},
			singleSchoarshipDel: function (index, row) {

			},
			singleScholarshipFinal: function (index, row) {
				this.$confirm("提交后，奖学金信息、奖学金分配情况无法修改。确定提交？", "提示", {confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"}).then(() => {
					apiDeleteUser(row.id).then(res => {
					}).catch(error => {
					});
				}).catch(() => {
				});
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
				this.allocScholarships = this.scholarships;
				this.allocGroup = this.allocFilters.group;
				this.allocType = this.allocFilters.type;
				this.updateTable();
			},
			allAllocSelsChange: function (sels) {
				this.allocSels = sels;
			},
			singleScholarshipAllocDelete: function (row, col) {

			},
			singleScholarshipAllocSubmit: function (row, col) {

			},
			singleScholarshipAllocAddSubmit: function (row) {

			},
			allAllocScholarshipSelsChange: function (sels) {
				this.allocScholarshipSels = sels;
			},
			allThanksSelsChange: function (sels) {
				this.thanksSels = sels;
			},
			singleThanksView: function (row, col) {
				this.setForm(JSON.parse(JSON.stringify(this.testForm)));
				this.setFill(JSON.parse(JSON.stringify(this.testFill)));
				this.thanksViewVisible = true;
			},
			thanksSearch: function () {
				this.thanksScholarships = this.scholarships;
			},
			singleThanksSubmit: function () {

			},
			findQuota: function (quota_list, group, type) {
				for (var i = 0; i < quota_list.length; i++) {
					if (quota_list[i].group === group && quota_list[i].type === type) {
						return quota_list[i].quota;
					}
				}
				return 0;
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
			},
			...mapActions([
				"setForm",
				"setFill"
			])
		},
		mounted() {
			this.getFormList();
		}
	}

</script>

<style scoped>

</style>