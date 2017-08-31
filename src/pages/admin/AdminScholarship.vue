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
			<el-table-column label="#" width="60">
				<template scope="scope">
					{{ (currentPage - 1) * pageSize + scope.$index + 1 }}
				</template>
			</el-table-column>
			<el-table-column prop="name" label="奖学金名" width="300" sortable>
			</el-table-column>
			<el-table-column prop="year" label="年份" width="100" sortable>
			</el-table-column>
			<el-table-column label="操作" width="300">
				<template scope="scope">
					<el-button size="small" @click="singleScholarshipEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="singleScholarshipDel(scope.$index, scope.row)">删除</el-button>
					<!--<el-button type="primary" size="small" @click="singleScholarshipFinal(scope.$index, scope.row)">最终提交</el-button>-->
					<el-button size="small" @click="singleScholarshipCopy(scope.$index, scope.row)">从该奖学金创建</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="allScholarshipBatchRemove" :disabled="this.scholarshipSels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="allScholarshipCurrentChange" :page-size="pageSize" :total="scholarshipTotal" style="float:right;" :current-page.sync="currentPage">
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
					<el-button type="primary" @click="allocExport">导出</el-button>
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
                        <el-table-column prop="numOfOwnScholarship" label="获已选奖学金数" width="90" sortable>
			        <template scope="scope">
					{{ countExistence(scope.row.scholarship_states, _APPLY_STATUS.SUCCESS) }}
				</template>
			</el-table-column>
			<el-table-column prop="scholarship_money_sum" label="获已选奖学金额度" width="90" sortable>
			</el-table-column>
			<el-table-column type="expand">
			  <template scope="scope">
                            <template v-if="countExistence(scope.row.honor_states, _APPLY_STATUS.SUCCESS) > 0">
					<h4>分配的奖学金及金额</h4>
					<template v-for="(scholarship, index) in allocScholarships">
						<template v-if="scope.row.scholarship_states[index] == _APPLY_STATUS.SUCCESS">
							<el-row :gutter="15">
								<el-col :span="7" :offset="1">
									{{scholarship.year}} {{scholarship.name}}
								</el-col>
								<el-col :span="7">
									<template v-if="scholarship.alloc === _SCHOLARSHIP_ALLOC_TYPE.QUOTA">
										<el-input-number v-model="scholarship.money" size="small" :disabled="true"></el-input-number>
									</template>
									<template v-else-if="scholarship.alloc === _SCHOLARSHIP_ALLOC_TYPE.MONEY">
										<el-input-number v-model="scope.row.scholarship_money[index]" size="small"></el-input-number>
									</template>
								</el-col>
								<template v-if="scholarship.alloc === _SCHOLARSHIP_ALLOC_TYPE.MONEY">
									<el-col :span="4">
										<el-button size="small" type="primary" @click="singleScholarshipAllocSubmit(scope.row, index)">修改金额</el-button>
									</el-col>
								</template>
								<el-col :span="4">
									<el-button size="small" type="danger" @click="singleScholarshipAllocDelete(scope.row, index)">删除</el-button>
								</el-col>
							</el-row>
						</template>
					</template>
					<el-row :gutter="15">
						<el-col :span="7" :offset="1">
							<el-select v-model="scope.row.scholarship_add" placeholder="新增奖学金">
								<template v-for="(scholarship, index) in allocScholarships">
									<el-option :key="index" :value="index" :label="scholarship.year + ' ' + scholarship.name">
									</el-option>
								</template>
							</el-select>
						</el-col>
						<template v-if="scope.row.scholarship_add !== null">
							<el-col :span="7">
								<template v-if="allocScholarships[scope.row.scholarship_add].alloc === _SCHOLARSHIP_ALLOC_TYPE.QUOTA">
									<el-input-number v-model="allocScholarships[scope.row.scholarship_add].money" size="small" :disabled="true"></el-input-number>
								</template>
								<template v-else-if="allocScholarships[scope.row.scholarship_add].alloc === _SCHOLARSHIP_ALLOC_TYPE.MONEY">
									<el-input-number v-model="scope.row.scholarship_money_add" size="small"></el-input-number>
								</template>
							</el-col>
							<el-col :span="4">
								<el-button size="small" type="primary" @click="singleScholarshipAllocAddSubmit(scope.row)">添加</el-button>
							</el-col>
						</template>
					</el-row>
                                    </template>
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
					{{ findAlready(scope.row) }}
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
								<el-button size="small" @click="singleThanksView(scope.row, index)">查看感谢信</el-button>
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
				<el-button type="primary" @click.native="singleThanksSubmit" :loading="thanksViewLoading">修改</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import { mapGetters } from "vuex"
	import { mapActions } from "vuex"
	import { apiGetScholarshipList, apiUpdateScholarship, apiGetGroupId, apiAddScholarship, apiDeleteScholarship, apiGetHonorList, apiGetGroupScholarship, apiDeleteUserScholarship, apiUpdateUserScholarshipForm, apiAddUserScholarshipForm, apiAddUserScholarship, apiGetScholarship, apiGetHonor, apiGetUser, apiGetGroupHonor, apiUpdateUserScholarship, apiGetForm } from "../../api/api"
	import { apiGetFormList } from "../../api/api"
	import UserType from "../../common/js/userType"
	import FormType from "../../common/js/formType"
	import ApplyStatus from "../../common/js/applyStatus"
	import ScholarshipAllocType from "../../common/js/scholarshipAllocType"

	export default {
		computed: {
			...mapGetters([
				"getForm",
				"getFields",
				"getFill"
			]),
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
				scholarships: [],
				scholarshipTotal: 0,
				scholarshipSels: [],
				pageSize: 20,
				currentPage: 1,

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

				honors: [],

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
				alloc: [],
				allocSels: [],

				allocScholarshipListLoading: false,
				allocScholarshipSels: [],

				thanksListLoading: false,
				thanksSels: [],

				thanksFilters: {
					group: "",
					type: "",
					scholarships: []
				},
				thanks: [],
				thanksScholarships: [],
				thanksGroup: "",
				thanksType: "",
				thanksViewVisible: false,
				thanksViewLoading: false,
				thanksScholarshipId: null,
				thanksUserId: null
			}
		},
		methods: {
			allScholarshipSearch: function () {
				this.currentPage = 1;
				this.getScholarshipList();
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
				if (!this.checkGroupQuota(this.scholarshipEditForm.group_quota)) {
					return;
				}
				var params = {
					name: this.scholarshipEditForm.name,
					year: this.scholarshipEditForm.year,
					form_id: this.scholarshipEditForm.form_id,
					alloc: this.scholarshipEditForm.alloc,
					money: this.scholarshipEditForm.money,
					group_quota: []
				};
				var tasks = [];
				for (var i in this.scholarshipEditForm.group_quota) {
					tasks.push(apiGetGroupId(this.scholarshipEditForm.group_quota[i].group, this.scholarshipEditForm.group_quota[i].type));
				}
				Promise.all(tasks).then(reses => {
					for (var i in this.scholarshipEditForm.group_quota) {
						params.group_quota.push({
							group_id: reses[i],
							quota: this.scholarshipEditForm.group_quota[i].quota
						});
					}
					apiUpdateScholarship(this.scholarshipEditForm.id, params).then(res => {
						this.$notify({
							title: "更新成功",
							message: "更新奖学金信息成功",
							type: "success"
						});
						this.scholarshipEditFormVisible = false;
						this.getScholarshipList();
					}).catch(error => {
						//console.log(error);
						this.$notify({
							title: "更新失败",
							message: error.response.data.message,
							type: "error"
						});
					}).catch(error => {
						this.$notify({
							title: "更新失败",
							message: "请检查网络连接",
							type: "error"
						});
					});
				}).catch(error => {
					this.$notify({
						title: "更新失败",
						message: "获取组id失败",
						type: "error"
					});	
				});
			},
			singleScholarshipAddSubmit: function () {
				if (!this.checkGroupQuota(this.scholarshipAddForm.group_quota)) {
					return;
				}
				var params = {
					name: this.scholarshipAddForm.name,
					year: this.scholarshipAddForm.year,
					form_id: this.scholarshipAddForm.form_id,
					alloc: this.scholarshipAddForm.alloc,
					money: this.scholarshipAddForm.money,
					group_quota: []
				};
				var tasks = [];
				for (var i in this.scholarshipAddForm.group_quota) {
					tasks.push(apiGetGroupId(this.scholarshipAddForm.group_quota[i].group, this.scholarshipAddForm.group_quota[i].type));
				}
				Promise.all(tasks).then(reses => {
					for (var i in this.scholarshipAddForm.group_quota) {
						params.group_quota.push({
							group_id: reses[i],
							quota: this.scholarshipAddForm.group_quota[i].quota
						});
					}
					apiAddScholarship(params).then(res => {
						this.$notify({
							title: "新增成功",
							message: "新增奖学金信息成功",
							type: "success"
						});
						this.scholarshipAddFormVisible = false;
						this.getScholarshipList();
					}).catch(error => {
						//console.log(error);
						this.$notify({
							title: "新增失败",
							message: error.response.data.message,
							type: "error"
						});
					}).catch(error => {
						this.$notify({
							title: "新增失败",
							message: "请检查网络连接",
							type: "error"
						});
					});
				}).catch(error => {
					this.$notify({
						title: "新增失败",
						message: "获取组id失败",
						type: "error"
					});	
				});
			},
			singleScholarshipCopy: function(index, row) {
				this.scholarshipAddForm = JSON.parse(JSON.stringify(row));
				this.scholarshipAddFormVisible = true;
			},
			singleScholarshipDel: function (index, row) {
				this.$confirm("确定删除？", "提示", {confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"}).then(() => {
					apiDeleteScholarship(row.id).then(res => {
						this.$notify({
							title: "删除成功",
							message: "删除奖学金成功",
							type: "success"
						});
						this.getScholarshipList();
					}).catch(error => {
						this.$notify({
							title: "删除失败",
							message: "删除奖学金失败",
							type: "error"
						});	
					});
				}).catch(() => {
				});
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
				this.$confirm("确定删除？", "提示", {confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"}).then(() => {
					var tasks = [];
					for (var i in this.scholarshipSels) {
						tasks.push(apiDeleteScholarship(this.scholarshipSels[i].id));
					}
					Promise.all(tasks).then(reses => {
						this.$notify({
							title: "删除成功",
							message: "批量删除奖学金成功",
							type: "success"
						});
						this.getScholarshipList();
					}).catch(error => {
						this.$notify({
							title: "删除失败",
							message: "批量删除奖学金失败",
							type: "error"
						});
						this.getScholarshipList();
					});
				}).catch(() => {
				});
			},
			allScholarshipCurrentChange: function (val) {
				this.getScholarshipList();
			},
			updateTable: function () {
				for (var i = 0; i < this.alloc.length; i++) {
					this.$set(this.alloc, i, this.alloc[i]);
				}
			},
			allocSearch: function () {
				this.getAllocList();
			},
			allocExport: function () {
				function cell(value, colSpan) {
					var bookCell = new wijmo.xlsx.WorkbookCell();
					bookCell.value = value;
					if (colSpan != undefined) {
						bookCell.colSpan = colSpan;
					}
					return bookCell;
				}
				if (this.alloc.length === 0) {
					this.$notify({
						title: "结果为空。请查询后再导出",
						message: "",
						type: "error"
					});					
					return;
				}
 			    var book = new wijmo.xlsx.Workbook();

			    var sheet1 = new wijmo.xlsx.WorkSheet();
			    sheet1.name = "奖学金分配名单";
			    var title1 = new wijmo.xlsx.WorkbookRow();
			    title1.cells.push(cell("姓名"));
			    title1.cells.push(cell("班级"));
			    title1.cells.push(cell("学号"));
			    title1.cells.push(cell("已获荣誉数"));
			    title1.cells.push(cell("已获奖学金额度"));
			    for (var i in this.allocHonors) {
			    	title1.cells.push(cell(this.allocHonors[i].year + " " + this.allocHonors[i].name));
			    }
			    title1.cells.push(cell("获得的奖学金及金额"));
			    sheet1.rows.push(title1);
			    for (var i in this.alloc) {
			    	var row = new wijmo.xlsx.WorkbookRow();
			    	row.cells.push(cell(this.alloc[i].name));
			    	row.cells.push(cell(this.alloc[i].class));
			    	row.cells.push(cell(this.alloc[i].student_id + ""));
			    	row.cells.push(cell(this.countExistence(this.alloc[i].honor_states, this._APPLY_STATUS.SUCCESS)));
			    	row.cells.push(cell(this.alloc[i].scholarship_money_sum));
			    	for (var j in this.alloc[i].honor_states) {
			    		row.cells.push(cell(this._applyStatusString(this.alloc[i].honor_states[j])));
			    	}
			    	for (var j in this.alloc[i].scholarship_states) {
			    		if (this.alloc[i].scholarship_states[j] == this._APPLY_STATUS.SUCCESS) {
			    			row.cells.push(cell(this.allocScholarships[j].year + " " + this.allocScholarships[j].name));
			    			if (this.allocScholarships[j].alloc == this._SCHOLARSHIP_ALLOC_TYPE.MONEY) {
			    				row.cells.push(cell(this.alloc[i].scholarship_money[j]));
			    			} else {
			    				row.cells.push(cell(this.allocScholarships[j].money));
			    			}
			    		}
			    	}
			    	sheet1.rows.push(row);
			    }
			    book.sheets.push(sheet1);

			    var sheet2 = new wijmo.xlsx.WorkSheet();
			    sheet2.name = "奖学金支出情况";
			    var title2 = new wijmo.xlsx.WorkbookRow();
			    title2.cells.push(cell("奖学金名"));
			    title2.cells.push(cell("年份"));
			    title2.cells.push(cell("可分配总金额/名额"));
			    title2.cells.push(cell("已分配总金额/名额"));
			    sheet2.rows.push(title2);
			    for (var i in this.allocScholarships) {
			    	var row = new wijmo.xlsx.WorkbookRow();
			    	row.cells.push(cell(this.allocScholarships[i].name));
			    	row.cells.push(cell(this.allocScholarships[i].year));
			    	row.cells.push(cell(this.findQuota(this.allocScholarships[i].group_quota, this.allocGroup, this.allocType)));
			    	row.cells.push(cell(this.findAlready(this.allocScholarships[i])));
			    	sheet2.rows.push(row);
			    }
			    book.sheets.push(sheet2);

			    book.save("奖学金分配结果");
			},
			allAllocSelsChange: function (sels) {
				this.allocSels = sels;
			},
			singleScholarshipAllocDelete: function (row, colId) {
				apiDeleteUserScholarship(row.id, this.allocScholarships[colId].id).then(res => {
					this.$notify({
						title: "删除奖学金分配成功",
						message: "",
						type: "success"
					});
					this.getAllocList();					
				}).catch(error => {
					this.$notify({
						title: "删除奖学金分配失败",
						message: "",
						type: "error"
					});
				});
			},
			singleScholarshipAllocSubmit: function (row, colId) {
				var params = {
					money: row.scholarship_money[colId]
				}
				var uid = row.id;
				var scholarId = this.allocScholarships[colId].id;
				apiUpdateUserScholarship(uid, scholarId, params).then(res => {
					this.$notify({
						title: "修改奖学金分配成功",
						message: "",
						type: "success"
					});
					this.getAllocList();	
				}).catch(error => {
					console.log(error.response);
					this.$notify({
						title: "修改奖学金分配失败",
						message: error.response.data.message,
						type: "error"
					});
				}).catch(error => {
					this.$notify({
						title: "修改奖学金分配失败",
						message: "请检查网络连接",
						type: "error"
					});					
				});
			},
			singleScholarshipAllocAddSubmit: function (row) {
				var params = {
					scholar_id: this.allocScholarships[row.scholarship_add].id
				}
				if (this.allocScholarships[row.scholarship_add].alloc == this._SCHOLARSHIP_ALLOC_TYPE.MONEY) {
					params.money = row.scholarship_money_add;
				}
				var uid = row.id;
				apiAddUserScholarship(uid, params).then(res => {
					this.$notify({
						title: "新增奖学金分配成功",
						message: "",
						type: "success"
					});
					this.getAllocList();	
				}).catch(error => {
					console.log(error.response);
					this.$notify({
						title: "新增奖学金分配失败",
						message: error.response.data.message,
						type: "error"
					});
				}).catch(error => {
					this.$notify({
						title: "新增奖学金分配失败",
						message: "请检查网络连接",
						type: "error"
					});					
				});
			},
			allAllocScholarshipSelsChange: function (sels) {
				this.allocScholarshipSels = sels;
			},
			allThanksSelsChange: function (sels) {
				this.thanksSels = sels;
			},
			singleThanksView: function (row, colId) {
				apiGetForm(this.thanksScholarships[colId].form_id).then(res => {
					this.setForm(res.data);
					this.setFill(JSON.parse(row.scholarship_fills[colId]));
					this.thanksScholarshipId = this.thanksScholarships[colId].id;
					this.thanksUserId = row.id;
					this.thanksViewVisible = true;
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
			thanksSearch: function () {
				this.getThanksList();
			},
			singleThanksSubmit: function () {
				var uid = this.thanksUserId;
				var scholarshipId = this.thanksScholarshipId;
				var params = {
					fill: this.getFill
				}
				apiUpdateUserScholarshipForm(uid, scholarshipId, params).then(res => {
					this.$notify({
						title: "修改成功",
						message: "修改奖学金感谢信成功",
						type: "success"
					});
					this.thanksViewVisible = false;
					this.getThanksList();
				}).catch(error => {
					this.$notify({
						title: "修改失败",
						message: "修改奖学金感谢信失败",
						type: "error"
					});
				});				
			},
			findQuota: function (quota_list, group, type) {
				for (var i = 0; i < quota_list.length; i++) {
					if (quota_list[i].group === group && quota_list[i].type === type) {
						return quota_list[i].quota;
					}
				}
				return 0;
			},
			findAlready: function(row) {
				var colId = null;
				for (var i in this.allocScholarships) {
					if (this.allocScholarships[i].id == row.id) {
						colId = i;
						break;
					}
				}
				var ans = 0;
				if (row.alloc == this._SCHOLARSHIP_ALLOC_TYPE.QUOTA) {
					for (var i in this.alloc) {
						if (this.alloc[i].scholarship_states[colId] === this._APPLY_STATUS.SUCCESS) {
							ans += 1;
						}
					}
				} else {
					for (var i in this.alloc) {
						if (this.alloc[i].scholarship_states[colId] === this._APPLY_STATUS.SUCCESS) {
							ans += this.alloc[i].scholarship_money[colId];
						}
					}
				}
				return ans;
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
			checkGroupQuota: function(groupQuota) {
				if (groupQuota.length == 0) {
					this.$notify({
						title: "更新失败",
						message: "名额不允许为空",
						type: "error"
					});
					return false;
				}
				if (_.uniqWith(groupQuota, (a, b) => { return a.group == b.group && a.type == b.type } ).length != groupQuota.length) {
					this.$notify({
						title: "更新失败",
						message: "名额不允许重复",
						type: "error"
					});
					return false;					
				}
				return true;
			},
			_userTypeString: function (type) {
				return UserType.userTypeString(type);
			},
			_scholarshipAllocTypeString: function(str) {
				return ScholarshipAllocType.scholarshipAllocTypeString(str);
			},
			_applyStatusString: function(str) {
				return ApplyStatus.applyStatusString(str);
			},
			getThanksList: function() {
				this.thanksScholarships = [];
				this.thanksType = "";
				this.thanksGroup = "";
				this.thanks = [];
				this.thanksListLoading = true;

				apiGetGroupId(this.thanksFilters.group, this.thanksFilters.type).then(groupId => {
					var scholarship_ids = _.join(this.thanksFilters.scholarships, ",");
					apiGetGroupScholarship(groupId, {scholar_ids: scholarship_ids}).then(res => {
						var tThanks = res.data;
						var getScholarshipTasks = _.map(this.thanksFilters.scholarships, apiGetScholarship);
						return Promise.all(getScholarshipTasks).then(scholarshipReses => {
							var scholarships = _.map(scholarshipReses, (h) => { return h.data });
							var newThanks = {};
							for (var i in tThanks) {
								var obj = {
									scholarship_states: [],
									scholarship_fill_ids: [],
									scholarship_fills: []
								}
								for (var j in tThanks[i]) {
									if (tThanks[i][j] == null) {
										obj.scholarship_states.push(null);
										obj.scholarship_fill_ids.push(null);
										obj.scholarship_fills.push(null);
									} else {
										obj.scholarship_states.push(tThanks[i][j].state);
										obj.scholarship_fill_ids.push(tThanks[i][j].fill_id);
										if (tThanks[i][j].fill !== undefined) {
											obj.scholarship_fills.push(tThanks[i][j].fill);
										} else {
											obj.scholarship_fills.push(null);
										}
									}
								}
								newThanks[i] = obj;
							}
							var allUids = _.keys(newThanks);
							var getUserTasks = _.map(allUids, apiGetUser);
							return Promise.all(getUserTasks).then(userReses => {
								var finalThanks = []
								for (var i in userReses) {
									finalThanks.push(_.extend(userReses[i].data, newThanks[userReses[i].data.id]));
								}
								this.thanks = finalThanks;
								this.thanksScholarships = scholarships;
								this.thanksGroup = this.thanksFilters.group;
								this.thanksType = this.thanksFilters.type;
								this.thanksListLoading = false;
							});
						});
					});
				}).catch(error => {
					this.$notify({
						title: "加载感谢信列表失败",
						message: "请检查学生年级、学生类别是否填写正确",
						type: "error"
					});
					this.thanksListLoading = false;
				});	
			},
			getAllocList: function () {
				this.allocHonors = [];
				this.allocScholarships = [];
				this.allocGroup = "";
				this.allocType = "";
				this.alloc = [];
				this.allocListLoading = true;
				this.allocScholarshipListLoading = true;
				apiGetGroupId(this.allocFilters.group, this.allocFilters.type).then(groupId => {
					var honor_ids = _.join(this.allocFilters.honors, ",");
					var scholarship_ids = _.join(this.allocFilters.scholarships, ",");
					var topTasks = [];
					
					var scholarships = [];
					var newAlloc = {};
					var emptyAlloc = {};
					var honors = [];
					var newRate ={};
					var emptyRate = {};

					topTasks.push(apiGetGroupScholarship(groupId, {scholar_ids: scholarship_ids}).then(res => {
						var tAlloc = res.data;
						var getScholarshipTasks = _.map(this.allocFilters.scholarships, apiGetScholarship);
						return Promise.all(getScholarshipTasks).then(scholarshipReses => {
							scholarships = _.map(scholarshipReses, (h) => { return h.data });
							for (var i in tAlloc) {
								var obj = {
									scholarship_money_sum: 0,
									scholarship_states: [],
									scholarship_money: [],
									scholarship_add: null,
									scholarship_money_add: 0,
									scholarship_fill_ids: [],
									scholarship_fills: []
								}
								for (var j in tAlloc[i]) {
									if (tAlloc[i][j] == null) {
										obj.scholarship_states.push(null);
										obj.scholarship_money.push(null);
										obj.scholarship_fill_ids.push(null);
										obj.scholarship_fills.push(null);
									} else {
										obj.scholarship_states.push(tAlloc[i][j].state);
										obj.scholarship_money.push((scholarships[j].alloc === this._SCHOLARSHIP_ALLOC_TYPE.QUOTA) ? scholarships[j].money : tAlloc[i][j].money);
										obj.scholarship_money_sum += obj.scholarship_money[obj.scholarship_money.length - 1];
										obj.scholarship_fill_ids.push(tAlloc[i][j].fill_id);
										if (tAlloc[i][j].fill !== undefined) {
											obj.scholarship_fills.push(tAlloc[i][j].fill);
										} else {
											obj.scholarship_fills.push(null);
										}
									}
								}
								newAlloc[i] = obj;
							}
							emptyAlloc = {
								scholarship_money_sum: 0,
								scholarship_states: _.fill(Array(scholarships.length), null),
								scholarship_money: _.fill(Array(scholarships.length), null),
								scholarship_add: null,
								scholarship_money_add: 0,
								scholarship_fill_ids: _.fill(Array(scholarships.length), null),
								scholarship_fills: _.fill(Array(scholarships.length), null)
							}
							return null;
						});
					}));

					topTasks.push(apiGetGroupHonor(groupId, {honor_ids: honor_ids}).then(res => {
						var tRate = res.data;
						var getHonorTasks = _.map(this.allocFilters.honors, apiGetHonor);
						return Promise.all(getHonorTasks).then(honorReses => {
							honors = _.map(honorReses, (h) => { return h.data });
							for (var i in tRate) {
								var obj = {
									honor_fills: [],
									honor_fill_ids: [],
									honor_states: [],
									honor_scores: [],
									honor_aveScore: []
								}
								for (var j in tRate[i]) {
									if (tRate[i][j] == null) {
										obj.honor_fills.push(null);
										obj.honor_fill_ids.push(null);
										obj.honor_states.push(null);
										obj.honor_scores.push(null);
										obj.honor_aveScore.push(null);
									} else {
										obj.honor_fills.push(tRate[i][j].fill)
										obj.honor_fill_ids.push(tRate[i][j].fill_id);
										obj.honor_states.push(tRate[i][j].state);
										if (tRate[i][j].scores.length != 0) {
											var score = _.mapValues(_.keyBy(tRate[i][j].scores, "scorer_id"), (h) => {return JSON.parse(h.score) });
											obj.honor_scores.push(score);
											var scoreList = _.map(_.values(score), this.calcSum);
											var aveScore = _.reduce(scoreList, (sum, n) => { return sum + n }, 0) / scoreList.length;
											obj.honor_aveScore.push(aveScore);
										} else {
											obj.honor_scores.push([]);
											obj.honor_aveScore.push(null);
										}
									}
								}
								newRate[i] = obj;
							}
							emptyRate = {
								honor_fills: _.fill(Array(honors.length), null),
								honor_fill_ids: _.fill(Array(honors.length), null),
								honor_states: _.fill(Array(honors.length), null),
								honor_scores: [],
								honor_aveScore: []
							}
							return null;  
						});
					}));

					return Promise.all(topTasks).then(reses => {
						var allUids = _.union(_.keys(newAlloc), _.keys(newRate));
						var getUserTasks = _.map(allUids, apiGetUser);
						return Promise.all(getUserTasks).then(userReses => {
							var finalAlloc = [];
							for (var i in userReses) {
								var obj = userReses[i].data;
								if (newAlloc.hasOwnProperty(obj.id)) {
									obj = _.extend(obj, newAlloc[obj.id]);
								} else {
									obj = _.extend(obj, JSON.parse(JSON.stringify(emptyAlloc)));
								}
								if (newRate.hasOwnProperty(obj.id)) {
									obj = _.extend(obj, newRate[obj.id]);
								} else {
									obj = _.extend(obj, JSON.parse(JSON.stringify(emptyRate)));
								}
								finalAlloc.push(obj);
							}
							this.alloc = finalAlloc;
							this.allocScholarships = scholarships;
							this.allocHonors = honors;
							this.allocGroup = this.allocFilters.group;
							this.allocType = this.allocFilters.type;
							this.allocListLoading = false;
							this.allocScholarshipListLoading = false;
						});
					})
				}).catch(error => {
					this.$notify({
						title: "加载奖学金分配列表失败",
						message: "请检查学生年级、学生类别是否填写正确",
						type: "error"
					});
					this.allocListLoading = false;
					this.allocScholarshipListLoading = false;
				});			
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
			getHonorList: function () {
				apiGetHonorList({}).then(res => {
					this.honors = res.data;
				}).catch(error => {
					this.$notify({
						title: "加载荣誉列表失败",
						message: error.response.data.message,
						type: "error"
					});
				}).catch(error => {
					this.$notify({
						title: "加载荣誉列表失败",
						message: "请检查网络连接",
						type: "error"
					});
				});
			},
			getScholarshipList: function () {
				this.scholarshipListLoading = true;
				var params = {
					page: this.currentPage,
					pageSize: this.pageSize
				};
				if (this.scholarshipFilters.name != "") {
					params["name"] = this.scholarshipFilters.name;
				}
				if (this.scholarshipFilters.year != "") {
					params["year"] = this.scholarshipFilters.year;
				}
				apiGetScholarshipList(params).then(res => {
					this.scholarships = res.data.data;
					this.scholarshipListLoading = false;
					this.scholarshipTotal = res.data.pagination.rowCount;
				}).catch(error => {
					this.$notify({
						title: "加载奖学金列表失败",
						message: error.response.data.message,
						type: "error"
					});
					this.scholarshipListLoading = false;
				}).catch(error => {
					this.$notify({
						title: "加载奖学金列表失败",
						message: "请检查网络连接",
						type: "error"
					});
					this.scholarshipListLoading = false;
				});
			},
			...mapActions([
				"setForm",
				"setFill"
			])
		},
		mounted() {
			this.getFormList();
			this.getScholarshipList();
			this.getHonorList();
		}
	}

</script>

<style scoped>

</style>
