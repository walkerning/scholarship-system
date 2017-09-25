<template>
  <section>
    <h1>{{ hasPermissionHonor? "荣誉编辑": "荣誉查看" }}</h1>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="honorFilters">
        <el-form-item>
          <el-input v-model="honorFilters.name" placeholder="荣誉名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="honorFilters.year" placeholder="年份"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="allHonorSearch">查询</el-button>
        </el-form-item>
        <el-form-item v-if="hasPermissionHonor">
          <el-button type="primary" @click="allHonorAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <!--列表-->
    <el-table :data="honors" highlight-current-row v-loading="honorListLoading" @selection-change="allHonorSelsChange" style="width: 100%;" border>
      <el-table-column type="selection" width="55">
      </el-table-column>
      <el-table-column label="#" width="60">
        <template scope="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="荣誉名" width="200" sortable>
      </el-table-column>
      <el-table-column prop="year" label="年份" width="90" sortable>
      </el-table-column>
      <el-table-column prop="start_time" label="申请开始时间" :formatter="timeFormatter" width="190" sortable>
      </el-table-column>
      <el-table-column prop="end_time" label="申请结束时间" :formatter="timeFormatter" width="190" sortable>
      </el-table-column>
      <el-table-column label="操作" width="250" >
        <template scope="scope">
          <template v-if="hasPermissionHonor">
            <el-button size="small" @click="singleHonorEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="singleHonorDel(scope.$index, scope.row)">删除</el-button>
            <!--<el-button type="primary" size="small" @click="singleHonorFinal(scope.$index, scope.row)">最终提交</el-button>-->
            <el-button size="small" @click="singleHonorCopy(scope.$index, scope.row)">从该荣誉创建</el-button>
          </template>
          <template v-else>
            <el-button size="small" @click="singleHonorEdit(scope.$index, scope.row)">查看</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-button type="danger" @click="allHonorBatchRemove" :disabled="this.honorSels.length===0" v-if="hasPermissionHonor">批量删除</el-button>
      <el-pagination layout="prev, pager, next" @current-change="allHonorCurrentChange" :page-size="pageSize" :total="honorTotal" style="float:right;" :current-page.sync="currentPage">
      </el-pagination>
    </el-col>

    <!--荣誉编辑/查看界面-->
    <el-dialog :title="hasPermissionHonor?'编辑':'查看'" v-model="honorEditFormVisible" :close-on-click-modal="false" size="large">
      <el-form :model="honorEditForm" label-width="80px" ref="honorEditForm">
        <el-form-item label="荣誉名" prop="name">
          <el-input v-model="honorEditForm.name" auto-complete="off" :disabled="!hasPermissionHonor"></el-input>
        </el-form-item>
        <el-form-item label="年份" prop="year">
          <el-input v-model="honorEditForm.year" auto-complete="off" :disabled="!hasPermissionHonor"></el-input>
        </el-form-item>
        <el-form-item label="申请开始时间" prop="start_time_date">
          <el-date-picker  v-model="start_time_date" type="datetime" placeholder="选择日期时间" :disabled="!hasPermissionHonor"></el-date-picker>
        </el-form-item>
        <el-form-item label="申请结束时间" prop="end_time_date">
          <el-date-picker  v-model="end_time_date" type="datetime" placeholder="选择日期时间" :disabled="!hasPermissionHonor"></el-date-picker>
        </el-form-item>
        <el-form-item label="各年级名额">
          <template v-for="(group_quota, index) in honorEditForm.group_quota">
            <el-row>
              <div style="width:150px;float:left;">
                年级：<el-input v-model="group_quota.group" :disabled="!hasPermissionHonor"></el-input>
              </div>
              <div style="width:150px;float:left;">
                类别：
                <el-select v-model="group_quota.type" :disabled="!hasPermissionHonor">
                  <template v-for="userType in _USER_TYPE">
                    <el-option :label="_userTypeString(userType)" :value="userType"></el-option>
                  </template>
                </el-select>
              </div>
              <div style="width:200px;float:left;">
                名额：<br /> <el-input-number v-model="group_quota.quota":min="0" :disabled="!hasPermissionHonor"></el-input-number>
              </div>
              <div style="width:150px;float:left;"  v-if="hasPermissionHonor">
                操作：<br /><el-button type="danger" @click="honorEditForm.group_quota.splice(index, 1)">删除</el-button>
              </div>
            </el-row>
          </template>
          <el-row  v-if="hasPermissionHonor">
            <el-button type="primary" @click="honorEditForm.group_quota.push({group: '2017', type: 'undergraduate', quota: 1})">添加</el-button>
          </el-row>
        </el-form-item>
        <el-form-item label="申请填写表单">
          <el-select v-model="honorEditForm.form_id" :disabled="!hasPermissionHonor">
            <template v-for="form in forms">
              <el-option :label="form.name" :value="form.id"></el-option>
            </template>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="hasPermissionHonor">
        <el-button @click.native="honorEditFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="singleHonorEditSubmit" :loading="honorEditLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--荣誉新增界面-->
    <el-dialog title="新增" v-model="honorAddFormVisible" :close-on-click-modal="false" size="large">
      <el-form :model="honorAddForm" label-width="80px" ref="honorAddForm">
        <el-form-item label="荣誉名" prop="name">
          <el-input v-model="honorAddForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="年份" prop="year">
          <el-input v-model="honorAddForm.year" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="申请开始时间" prop="start_time_date">
          <el-date-picker  v-model="start_time_date" type="datetime" placeholder="选择日期时间"></el-date-picker>
        </el-form-item>
        <el-form-item label="申请结束时间" prop="end_time_date">
          <el-date-picker  v-model="end_time_date" type="datetime" placeholder="选择日期时间"></el-date-picker>
        </el-form-item>
        <el-form-item label="各年级名额">
          <template v-for="(group_quota, index) in honorAddForm.group_quota">
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
                操作：<br /><el-button type="danger" @click="honorAddForm.group_quota.splice(index, 1)">删除</el-button>
              </div>
            </el-row>
          </template>
          <el-row>
            <el-button type="primary" @click="honorAddForm.group_quota.push({group: '2017', type: 'undergraduate', quota: 1})">添加</el-button>
          </el-row>
        </el-form-item>
        <el-form-item label="申请填写表单">
          <el-select v-model="honorAddForm.form_id">
            <template v-for="form in forms">
              <el-option :label="form.name" :value="form.id"></el-option>
            </template>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="honorAddFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="singleHonorAddSubmit" :loading="honorAddLoading">提交</el-button>
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
          <el-button type="primary" @click="rateExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="rates" highlight-current-row v-loading="rateListLoading" @selection-change="allRateSelsChange" style="width: 100%;" border max-height="1000">
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
              <a @click="singleChangeApplyStatus(scope.row, index)" style="cursor: pointer;">
                <apply-status-tag :applyStatus="scope.row.honor_states[index]"></apply-status-tag>
              </a>
              <a @click="singleRate(scope.row, index)" style="cursor: pointer;">
                <el-tag type="gray"> 平均评分：{{ scope.row.honor_aveScore[index] }} </el-tag>
              </a>
              <a @click="singleRate(scope.row, index)" style="cursor: pointer;">
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

      <template v-if="rates.length > 0">
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
      <b>该生GPA：     {{ honorRateUser.gpa }}</b><br />
      <b>该生班级排名：{{ honorRateUser.class_rank }}</b><br />
      <b>该生年级排名：{{ honorRateUser.year_rank }}</b><br />
      <form-rate></form-rate>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="honorRateVisible = false">取消</el-button>
        <el-button type="primary" @click.native="singleRateSubmit" :loading="honorRateLoading">提交</el-button>
      </div>
    </el-dialog>

    <!-- 申请理由管理栏 -->
    <h1>{{ hasPermissionHonor? "申请理由管理": "申请理由" }}</h1>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="reasonFilters">
        <el-form-item>
          <el-input v-model="reasonFilters.year" placeholder="年份"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="currentReasonSearch">当前年份查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="allReasonSearch">查询</el-button>
        </el-form-item>
        <el-form-item v-if="hasPermissionHonor">
          <el-button type="primary" @click="allReasonAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <!--列表-->
    <el-table :data="reasons" highlight-current-row v-loading="reasonListLoading" style="width: 100%;" border>
      <el-table-column label="#" width="60">
        <template scope="scope">
          {{ (reasonCurrentPage - 1) * reasonPageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="申请理由名" width="200" sortable>
      </el-table-column>
      <el-table-column prop="year" label="年份" width="90" sortable>
      </el-table-column>
      <el-table-column label="操作" width="250" >
        <template scope="scope">
          <template v-if="hasPermissionHonor">
            <el-button size="small" @click="singleReasonEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="singleReasonDel(scope.$index, scope.row)">删除</el-button>
            <el-button size="small" @click="singleReasonCopy(scope.$index, scope.row)">从该模版创建</el-button>
          </template>
          <template v-else>
            <el-button size="small" @click="singleReasonEdit(scope.$index, scope.row)">查看</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-pagination layout="prev, pager, next" @current-change="allReasonCurrentChange" :page-size="reasonPageSize" :total="reasonTotal" style="float:right;" :current-page.sync="reasonCurrentPage">
      </el-pagination>
    </el-col>

    <!--申请理由编辑/查看界面-->
    <el-dialog :title="hasPermissionHonor?'编辑申请理由':'查看申请理由'" v-model="reasonEditFormVisible" :close-on-click-modal="false" size="large">
      <el-form :model="reasonEditForm" label-width="80px" ref="reasonEditForm">
        <el-form-item label="申请理由名" prop="name">
          <el-input v-model="reasonEditForm.name" auto-complete="off" :disabled="!hasPermissionHonor"></el-input>
        </el-form-item>
        <el-form-item label="年份(一年最多只能有一个申请理由项)" prop="year">
          <el-input v-model="reasonEditForm.year" auto-complete="off" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="填写表单">
          <el-select v-model="reasonEditForm.form_id" :disabled="!hasPermissionHonor">
            <template v-for="form in forms">
              <el-option :label="form.name" :value="form.id"></el-option>
            </template>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="hasPermissionHonor">
        <el-button @click.native="reasonEditFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="singleReasonEditSubmit" :loading="reasonEditLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--申请理由新增界面-->
    <el-dialog title="新增申请理由" v-model="reasonAddFormVisible" :close-on-click-modal="false" size="large">
      <el-form :model="reasonAddForm" label-width="80px" ref="reasonAddForm">
        <el-form-item label="申请理由名" prop="name">
          <el-input v-model="reasonAddForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="年份(一年最多只能有一个申请理由项)" prop="year">
          <el-input v-model="reasonAddForm.year" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="填写表单">
          <el-select v-model="reasonAddForm.form_id">
            <template v-for="form in forms">
              <el-option :label="form.name" :value="form.id"></el-option>
            </template>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="reasonAddFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="singleReasonAddSubmit" :loading="reasonAddLoading">提交</el-button>
      </div>
    </el-dialog>

    <!-- 申请理由查看 -->
    <h1>申请理由查看</h1>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="groupReasonFilters">
	      <el-form-item label="学生年级">
	        <el-input v-model="groupReasonFilters.group" placeholder=""></el-input>
	      </el-form-item>
	      <el-form-item label="学生类别" prop="type">
	        <el-select v-model="groupReasonFilters.type">
	          <template v-for="userType in _USER_TYPE">
	            <el-option :label="_userTypeString(userType)" :value="userType"></el-option>
	          </template>
	        </el-select>
	      </el-form-item>
	      <el-form-item label="申请理由年份">
	        <el-select v-model="groupReasonFilters.reasons" :multiple="true">
	          <template v-for="reason in reasons">
	            <el-option :label="reason.year + ' ' + reason.name" :value="reason.year"></el-option>
	          </template>
	        </el-select>
	      </el-form-item>
	      <el-form-item>
	        <el-button type="primary" @click="getGroupReasonList">查询</el-button>
	      </el-form-item>
      </el-form>
    </el-col>
    <!--申请理由填写列表-->
    <el-table :data="groupReason" highlight-current-row v-loading="groupReasonListLoading" style="width: 100%;" border max-height="1000">
      <el-table-column type="index" width="60">
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="90" sortable>
      </el-table-column>
      <el-table-column prop="class" label="班级" width="90" sortable>
      </el-table-column>
      <el-table-column prop="student_id" label="学号" width="120" sortable>
      </el-table-column>
      <template v-for="(reason, index) in groupReasonReasons">
        <el-table-column :prop="reason.year + ' ' + reason.name" :label="reason.year + ' ' + reason.name" width="150">
          <template scope="scope">
            <template v-if="scope.row.reason_fill_ids[index] === null">
              未填写该申请理由
            </template>
            <template v-else>
              <el-button size="small" @click="singleUserReasonView(scope.row, index)">查看申请理由</el-button>
            </template>
          </template>
        </el-table-column>
      </template>
    </el-table>

    <!-- 申请理由查看界面 -->
    <el-dialog title="查看" v-model="userReasonViewVisible" size="large">
      <form-view></form-view>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="userReasonViewVisible = false">取消</el-button>
        <el-button type="primary" @click.native="singleUserReasonSubmit" :loading="userReasonViewLoading">修改</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
  import { mapGetters } from "vuex"
import { mapActions } from "vuex"
import { apiGetFormList, apiGetHonorList, apiUpdateHonor, apiAddHonor, apiGetGroupId, apiDeleteHonor,
         apiGetGroupHonor, apiGetUser, apiGetHonor, apiGetForm, apiAddUserHonorScore, apiUpdateUserHonorScore,
         apiDeleteUserHonorScore, apiUpdateUserHonorAdmin,
         apiGetReason, apiGetReasonList, apiAddReason, apiUpdateReason, apiDeleteReason,
         apiUpdateUserReason, apiGetGroupReason } from "../../api/api"
import UserType from "../../common/js/userType"
import FormType from "../../common/js/formType"
import ApplyStatus from "../../common/js/applyStatus"
import QueType from "../../common/js/queType"

export default {
  computed: {
      ...mapGetters([
        "getForm",
        "getFields",
        "getFill",
        "getRate"
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
    _QUE_TYPE: function() {
      return QueType.QUE_TYPE;
    },
    _UID: function() {
      return sessionStorage.getItem('uid');
    },
    hasPermissionHonor: function() {
      return _.includes(this.sysUserPermissions, "honor");
    }
  },
  data() {
    return {
      sysUserPermissions: [],

      reasonFilters: {
        year: ""
      },
      reasonPageSize: 5,
      reasonCurrentPage: 1,
      reasonListLoading: false,
      reasons: [],
      reasonTotal: 0,

      reasonEditLoading: false,
      reasonEditFormVisible: false,
      reasonEditForm: {},

      reasonAddFormVisible: false,
      reasonAddLoading: false,
      reasonAddForm: {
        name: "",
        year: "",
        form_id: null
      },

      groupReasonReasons: [],
      groupReasonType: "",
      groupReasonGroup: "",
      groupReason: [],
      groupReasonListLoading: false,
      groupReasonFilters: {
        group: "",
        type: "",
        reasons: []
      },

      userReasonReasonId: "",
      userReasonUserId: "",
      userReasonViewVisible: false,
      userReasonViewLoading: false,

      // Honor attributes.
      honorFilters: {
        name: "",
        year: ""
      },
      honorListLoading: false,
      honors: [],
      honorTotal: 0,
      honorSels: [],
      pageSize: 20,
      currentPage: 1,

      honorEditForm: {},
      honorEditFormVisible: false,
      honorEditLoading: false,
      start_time_date: '',
      end_time_date: '',

      honorAddFormVisible: false,
      honorAddLoading: false,
      honorAddForm: {
        name: "",
        year: "",
        start_time: "",
        end_time: "",
        group_quota: [],
        form_id: null
      },

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
      rates: [],
      rateSels: [],
      hasMyRate: false,
      scoreMap: [],

      honorStateSettingVisible: false,
      honorStateSettingUser: {},
      honorStateSettingHonor: {},
      honorStateSettingState: "",
      applyEditLoading: false,

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
    // Honor query/selection method.
    allHonorSearch: function () {
      this.currentPage = 1;
      this.getHonorList();
    },
    allHonorAdd: function () {
      this.start_time_date = new Date();
      this.end_time_date = new　Date();
      this.honorAddFormVisible = true;
    },
    allHonorSelsChange: function (sels) {
      this.honorSels = sels;
    },
    allRateSelsChange: function (sels) {
      this.rateSels = sels;
    },
    allHonorCurrentChange: function (val) {
      this.getHonorList();
    },

    // Reason query methods.
    currentReasonSearch: function () {
      this.reasonFilters.year = (new Date()).getFullYear();
      this.reasonCurrentPage = 1;
      this.getReasonList();
    },
    allReasonSearch: function () {
      this.reasonCurrentPage = 1;
      this.getReasonList();
    },
    allReasonAdd: function () {
      this.reasonAddFormVisible = true;
    },
    allReasonCurrentChange: function (val) {
      this.getReasonList();
    },

    // Honor operation methods.
    singleHonorEdit: function (index, row) {
      this.honorEditForm = JSON.parse(JSON.stringify(row));
      this.start_time_date = new Date(row.start_time);
      this.end_time_date = new Date(row.end_time);
      this.honorEditFormVisible = true;
    },
    singleHonorDel: function (index, row) {
      this.$confirm("危险操作: 如果已存在对该荣誉的申请或分配信息, 这些信息均会被删除! 仍然确定删除?", "提示", {confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"}).then(() => {
        apiDeleteHonor(row.id).then(res => {
          this.$notify({
            title: "删除成功",
            message: "删除荣誉成功",
            type: "success"
          });
          this.getHonorList();
        }).catch(error => {
          this.$notify({
            title: "删除失败",
            message: error.response.data.message,
            type: "error"
          });  
        });
      }).catch(() => {
      });
    },
    singleHonorFinal: function (index, row) {
      this.$confirm("提交后，荣誉信息、荣誉分配情况无法修改。确定提交？", "提示", {confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"}).then(() => {
      }).catch(() => {
      });
    },
    singleHonorCopy: function (index, row) {
      this.honorAddForm = JSON.parse(JSON.stringify(row));
      this.start_time_date = new Date(row.start_time);
      this.end_time_date = new Date(row.end_time);
      this.honorAddFormVisible = true;
    },
    allHonorBatchRemove: function () {
      this.$confirm("危险操作: 如果已存在对这些荣誉的申请或分配信息, 这些信息均会被删除! 仍然确定删除?", "提示", {confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"}).then(() => {
        var tasks = [];
        for (var i in this.honorSels) {
          tasks.push(apiDeleteHonor(this.honorSels[i].id));
        }
        Promise.all(tasks).then(reses => {
          this.$notify({
            title: "删除成功",
            message: "批量删除荣誉成功",
            type: "success"
          });
          this.getHonorList();
        }).catch(error => {
          this.$notify({
            title: "删除失败",
            message: "批量删除荣誉失败",
            type: "error"
          });
          this.getHonorList();
        });
      }).catch(() => {
      });
    },
    singleHonorEditSubmit: function () {
      if (!this.checkGroupQuota(this.honorEditForm.group_quota)) {
        return;
      }
      this.honorEditForm.start_time = this.start_time_date.toISOString();
      this.honorEditForm.end_time = this.end_time_date.toISOString();
      var params = {
        name: this.honorEditForm.name,
        year: this.honorEditForm.year,
        start_time: this.honorEditForm.start_time,
        end_time: this.honorEditForm.end_time,
        form_id: this.honorEditForm.form_id,
        group_quota: []
      };
      var tasks = [];
      for (var i in this.honorEditForm.group_quota) {
        tasks.push(apiGetGroupId(this.honorEditForm.group_quota[i].group, this.honorEditForm.group_quota[i].type));
      }
      Promise.all(tasks).then(reses => {
        for (var i in this.honorEditForm.group_quota) {
          params.group_quota.push({
            group_id: reses[i],
            quota: this.honorEditForm.group_quota[i].quota
          });
        }
        apiUpdateHonor(this.honorEditForm.id, params).then(res => {
          this.$notify({
            title: "更新成功",
            message: "更新荣誉信息成功",
            type: "success"
          });
          this.honorEditFormVisible = false;
          this.getHonorList();
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

    // User-Honor State operations.
    singleChangeApplyStatus: function (row, colId) {
      var rowId = null;
      for (var i in this.rates) {
        if (this.rates[i].id == row.id) {
          rowId = i;
          break;
        }
      }
      this.honorStateSettingUser = this.rates[rowId];
      this.honorStateSettingHonor = this.rateHonors[colId];
      this.honorStateSettingState = this.rates[rowId].honor_states[colId];
      var fill = JSON.parse(this.rates[rowId].honor_fills[colId]);
      apiGetForm(this.rateHonors[colId].form_id).then(formRes => {
        var form = formRes.data;
        this.setForm(JSON.parse(JSON.stringify(form)));
        this.setFill(JSON.parse(JSON.stringify(fill)));
        this.honorStateSettingVisible = true;
      }).catch(error => {
        this.$notify({
          title: "加载申请表失败",
          message: error.response.data.message,
          type: "error"
        });
      });
    },
    singleChangeApplyStatusSubmit: function () {
      this.$confirm("确定要修改申请状态吗? 如果对此用户分配的当前年份荣誉有变动, 此用户当前年份已经分配的奖学金会全被取消, 需要重新分配.",
                    "提示", {confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"}).then(() => {
                      apiUpdateUserHonorAdmin(this.honorStateSettingUser.id, this.honorStateSettingHonor.id, {state: this.honorStateSettingState}).then(res => {
                        this.$notify({
                          title: "修改成功",
                          message: "修改申请状态成功",
                          type: "success"
                        });
                        this.honorStateSettingVisible = false;
                        this.getRateList();
                      }).catch(error => {
                        this.$notify({
                          title: "修改失败",
                          message: error.response.data.message,
                          type: "error"
                        });
                      });
                    });
    },

    singleApplyEditSubmit: function () {
      apiUpdateUserHonorAdmin(this.honorStateSettingUser.id, this.honorStateSettingHonor.id, {fill: this.getFill}).then(res => {
        this.$notify({
          title: "修改成功",
          message: "修改申请表成功",
          type: "success"
        });  
        this.honorStateSettingVisible = false;
        this.getRateList();
      }).catch(error => {
        this.$notify({
          title: "修改失败",
          message: "修改申请表失败",
          type: "error"
        });  
      });
    },
    singleHonorAddSubmit: function () {
      if (!this.checkGroupQuota(this.honorAddForm.group_quota)) {
        return;
      }
      this.honorAddForm.start_time = this.start_time_date.toISOString();
      this.honorAddForm.end_time = this.end_time_date.toISOString();
      var params = {
        name: this.honorAddForm.name,
        year: this.honorAddForm.year,
        start_time: this.honorAddForm.start_time,
        end_time: this.honorAddForm.end_time,
        form_id: this.honorAddForm.form_id,
        group_quota: []
      };
      var tasks = [];
      for (var i in this.honorAddForm.group_quota) {
        tasks.push(apiGetGroupId(this.honorAddForm.group_quota[i].group, this.honorAddForm.group_quota[i].type));
      }
      Promise.all(tasks).then(reses => {
        for (var i in this.honorAddForm.group_quota) {
          params.group_quota.push({
            group_id: reses[i],
            quota: this.honorAddForm.group_quota[i].quota
          });
        }
        apiAddHonor(params).then(res => {
          this.$notify({
            title: "新增成功",
            message: "新增荣誉信息成功",
            type: "success"
          });
          this.honorAddFormVisible = false;
          this.getHonorList();
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
    singleRate: function (row, colId) {
      var rowId = null;
      for (var i in this.rates) {
        if (this.rates[i].id == row.id) {
          rowId = i;
          break;
        }
      }
      this.honorRateUser = this.rates[rowId];
      this.honorRateHonor = this.rateHonors[colId];
      var fill = JSON.parse(this.rates[rowId].honor_fills[colId]);
      apiGetForm(this.rateHonors[colId].form_id).then(formRes => {
        var form = formRes.data;
        var tmpForm = JSON.parse(JSON.stringify(form));
        tmpForm.fields = [];
        var tmpFill = {};
        var tmpRate = {};
        for (var i in this.rates[rowId].honor_scores[colId]) {
          tmpRate[i] = [];
        }
        this.scoreMap = [];
        for (var i = 0; i < form.fields.length; i++) {
          if (form.fields[i].type === this._QUE_TYPE.STRING_SINGLE_LINE || form.fields[i].type === this._QUE_TYPE.STRING_MULTIPLE_LINE || form.fields[i].type === this._QUE_TYPE.NUMBER) {
            tmpForm.fields.push(form.fields[i]);
            tmpFill["data" + (tmpForm.fields.length - 1)] = fill["data" + i];
            for (var j in this.rates[rowId].honor_scores[colId]) {
              tmpRate[j].push(this.rates[rowId].honor_scores[colId][j]["score" + i])

            }
            this.scoreMap.push({
              key: "score" + i,
              inArray: false
            })
          } else if (form.fields[i].type === this._QUE_TYPE.TABLE) {
            for (var j = 0; j < fill["data" + i].length; j++) {
              tmpForm.fields.push(JSON.parse(JSON.stringify(form.fields[i])));
              tmpFill["data" + (tmpForm.fields.length - 1)] = [ fill["data" + i][j] ];
              for (var k in this.rates[rowId].honor_scores[colId]) {
                tmpRate[k].push(this.rates[rowId].honor_scores[colId][k]["score" + i][j])
              }
              this.scoreMap.push({
                key: "score" + i,
                inArray: true
              })              
            }
          }
        }
        this.setForm(tmpForm);
        this.setFill(tmpFill);
        this.setRate(tmpRate);
        this.hasMyRate = tmpRate[sessionStorage.getItem("uid")] !== undefined;
        this.honorRateVisible = true;  
      }).catch(error => {
        this.$notify({
          title: "加载评分表失败",
          message: "获取荣誉申请表失败",
          type: "error"
        });  
      });
    },
    singleRateSubmit: function () {
      var nowRate = this.getRate;
      var uid = sessionStorage.getItem("uid");
      if (nowRate[uid] !== undefined) {
        var score = {};
        for (var i in nowRate[uid]) {
          if (!this.scoreMap[i].inArray) {
            score[this.scoreMap[i].key] = nowRate[uid][i];
          } else {
            if (score[this.scoreMap[i].key] === undefined) {
              score[this.scoreMap[i].key] = [ nowRate[uid][i] ];
            } else {
              score[this.scoreMap[i].key].push(nowRate[uid][i]);
            }
          }
        }
        if (!this.hasMyRate) {
          apiAddUserHonorScore(this.honorRateUser.id, this.honorRateHonor.id, {score: score}).then(res => {
            this.$notify({
              title: "评分成功",
              message: "创建评分成功",
              type: "success"
            });  
            this.honorRateVisible = false;    
            this.getRateList();
          }).catch(error => {
            this.$notify({
              title: "评分失败",
              message: "创建评分失败",
              type: "error"
            });  
          });
        } else {
          apiUpdateUserHonorScore(this.honorRateUser.id, this.honorRateHonor.id, uid, {score: score}).then(res => {
            this.$notify({
              title: "评分成功",
              message: "修改评分成功",
              type: "success"
            });  
            this.honorRateVisible = false;    
            this.getRateList();
          }).catch(error => {
            this.$notify({
              title: "评分失败",
              message: "修改评分失败",
              type: "error"
            });  
          });
        }
      } else {
        if (this.hasMyRate) {
          apiDeleteUserHonorScore(this.honorRateUser.id, this.honorRateHonor.id, uid).then(res => {
            this.$notify({
              title: "评分成功",
              message: "删除评分成功",
              type: "success"
            });  
            this.honorRateVisible = false;    
            this.getRateList();
          }).catch(error => {
            this.$notify({
              title: "评分失败",
              message: error.response.data.message,
              type: "error"
            });
          });
        } else {
          this.$notify({
            title: "您没有做出评分",
            message: "",
            type: "success"
          });
          this.honorRateVisible = false;
        }
      }
    },
    singleAssignHonor: function (index) {
      this.$confirm("确定要批量修改申请状态吗? 如果对任意用户分配的当前年份荣誉有变动, 对应用户当前年份已经分配的奖学金会全被取消, 需要重新分配.",
                    "提示", {confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"}).then(() => {
                      var quota = this.countQuota(index);
                      var scoreList = [];
                      for (var i in this.rates) {
                        if (this.rates[i].honor_states[index] != null) {
                          var score = {
                            state: this.rates[i].honor_states[index],
                            id: this.rates[i].id,
                          };
                          if (this.rates[i].honor_aveScore[index] == null) {
                            score["score"] = 0;
                          } else {
                            score["score"] = this.rates[i].honor_aveScore[index]
                          }
                          scoreList.push(score);
                        }
                      }
                      scoreList = _.reverse(_.sortBy(scoreList, "score"));
                      var success_ids = [];
                      var fail_tasks = [];
                      var successed_num = 0;
                      for (var i in scoreList) {
                        if (successed_num < quota) {
                          if (scoreList[i].state !== this._APPLY_STATUS.LEAVEOUT) {
                            success_ids.push(scoreList[i].id);
                            successed_num = successed_num + 1;
                          }
                        } else {
                          fail_tasks.push(apiUpdateUserHonorAdmin(scoreList[i].id, this.rateHonors[index].id, {state: this._APPLY_STATUS.FAIL}));
                        }
                      }

                      Promise.all(fail_tasks).then(() => {
                        var success_tasks = [];
                        for (var i in success_ids) {
                          success_tasks.push(apiUpdateUserHonorAdmin(success_ids[i], this.rateHonors[index].id, {state: this._APPLY_STATUS.SUCCESS}));
                        }
                        return Promise.all(success_tasks);
                      })
                        .then(reses => {
                          this.$notify({
                            title: "荣誉分配成功",
                            message: "",
                            type: "success"
                          });
                          this.getRateList();
                        }).catch(error => {
                          this.$notify({
                            title: "荣誉分配失败",
                            message: error.response.data.message,
                            type: "error"
                          });
                        });
                    });
    },

    // Reasons operations.
    singleReasonEdit: function (index, row) {
      this.reasonEditForm = JSON.parse(JSON.stringify(row));
      this.reasonEditFormVisible = true;
    },
    singleReasonDel: function (index, row) {
      this.$confirm("危险操作: 如果已存在该申请理由的填写, 这些信息均会被删除! 仍然确定删除?", "提示", {confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"}).then(() => {
        apiDeleteReason(row.year).then(res => {
          this.$notify({
            title: "删除成功",
            message: "删除申请理由成功",
            type: "success"
          });
          this.getReasonList();
        }).catch(error => {
          this.$notify({
            title: "删除失败",
            message: error.response.data.message,
            type: "error"
          });
        });
      }).catch(() => {
      });
    },
    singleReasonCopy: function (index, row) {
      this.reasonAddForm = JSON.parse(JSON.stringify(row));
      this.reasonAddFormVisible = true;
    },
    singleReasonAddSubmit: function () {
      var params = {
        name: this.reasonAddForm.name,
        year: this.reasonAddForm.year,
        form_id: this.reasonAddForm.form_id,
      };
      apiAddReason(params).then(res => {
        this.$notify({
          title: "新增成功",
          message: "新增荣誉信息成功",
          type: "success"
        });
        this.reasonAddFormVisible = false;
        this.getReasonList();
      }).catch(error => {
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
    },
    singleReasonEditSubmit: function () {
      var params = {
        name: this.reasonEditForm.name,
        year: this.reasonEditForm.year,
        form_id: this.reasonEditForm.form_id,
      };
      apiUpdateReason(this.reasonEditForm.year, params).then(res => {
        this.$notify({
          title: "更新成功",
          message: "更新申请理由成功",
          type: "success"
        });
        this.reasonEditFormVisible = false;
        this.getReasonList();
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
    },

    // Users-Reasons operations.
    singleUserReasonView: function (row, colId) {
      apiGetForm(this.groupReasonReasons[colId].form_id).then(res => {
        this.setForm(res.data);
        this.setFill(JSON.parse(row.reason_fills[colId]));
        this.userReasonReasonId = this.groupReasonReasons[colId].year;
        this.userReasonUserId = row.id;
        this.userReasonViewVisible = true;
      }).catch(error => {
        this.$notify({
          title: "加载申请理由表单失败",
          message: error.response.data.message,
          type: "error"
        });
      }).catch(error => {
        this.$notify({
          title: "加载申请理由表单失败",
          message: "请检查网络连接",
          type: "error"
        });
      });
    },
    singleUserReasonSubmit: function () {
      var uid = this.userReasonUserId;
      var reasonId = this.userReasonReasonId
      var params = {
        fill: this.getFill
      }
      apiUpdateUserReason(uid, reasonId, params).then(res => {
        this.$notify({
          title: "修改成功",
          message: "修改用户申请原因填写成功",
          type: "success"
        });
        this.userReasonViewVisible = false;
        this.getGroupReasonList();
      }).catch(error => {
        this.$notify({
          title: "修改失败",
          message: error.response.data.message,
          type: "error"
        });
      });
    },

    // Helper methods
    updateTable: function () {
      for (var i = 0; i < this.rates.length; i++) {
        this.$set(this.rates, i, this.rates[i]);
      }
    },
    rateSearch: function () {
      this.getRateList();
      //this.updateTable();
    },
    rateExport: function () {
      function cell(value, colSpan) {
        var bookCell = new wijmo.xlsx.WorkbookCell();
        bookCell.value = value;
        if (colSpan != undefined) {
          bookCell.colSpan = colSpan;
        }
        return bookCell;
      }
      if (this.rates.length === 0) {
        this.$notify({
          title: "结果为空。请查询后再导出",
          message: "",
          type: "error"
        });
        return;
      }
      var book = new wijmo.xlsx.Workbook();
      var sheet = new wijmo.xlsx.WorkSheet();

      var title = new wijmo.xlsx.WorkbookRow();
      title.cells.push(cell("姓名"));
      title.cells.push(cell("班级"));
      title.cells.push(cell("学号"));
      title.cells.push(cell("已获荣誉数"));
      for (var i in this.rateHonors) {
        title.cells.push(cell(this.rateHonors[i].year + " " + this.rateHonors[i].name));
      }
      sheet.rows.push(title);

      for (var i in this.rates) {
        var row = new wijmo.xlsx.WorkbookRow();
        row.cells.push(cell(this.rates[i].name));
        row.cells.push(cell(this.rates[i].class));
        row.cells.push(cell(this.rates[i].student_id + ""));
        row.cells.push(cell(this.countExistence(this.rates[i].honor_states, this._APPLY_STATUS.SUCCESS)));
        for (var j in this.rates[i].honor_states) {
          row.cells.push(cell(this._applyStatusString(this.rates[i].honor_states[j])));
        }
        sheet.rows.push(row);
      }

      var bottom1 = new wijmo.xlsx.WorkbookRow();
      bottom1.cells.push(cell("申请人数", 4));
      for (var i in [2, 3, 4]) {
        bottom1.cells.push(undefined);
      }
      for (var i in this.rateHonors) {
        bottom1.cells.push(cell(this.countApply(i)));
      }
      sheet.rows.push(bottom1);

      var bottom2 = new wijmo.xlsx.WorkbookRow();
      bottom2.cells.push(cell("获得人数", 4));
      for (var i in [2, 3, 4]) {
        bottom2.cells.push(undefined);
      }
      for (var i in this.rateHonors) {
        bottom2.cells.push(cell(this.countGet(i)));
      }
      sheet.rows.push(bottom2);

      var bottom3 = new wijmo.xlsx.WorkbookRow();
      bottom3.cells.push(cell("名额", 4));
      for (var i in [2, 3, 4]) {
        bottom3.cells.push(undefined);
      }
      for (var i in this.rateHonors) {
        bottom3.cells.push(cell(this.countQuota(i)));
      }
      sheet.rows.push(bottom3);

      book.sheets.push(sheet);
      book.save("荣誉评比结果");
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
    _applyStatusString: function(str) {
      return ApplyStatus.applyStatusString(str);
    },

    // List flushers for Forms, Rates, Honors, Reasons.
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
    getRateList: function () {
      this.rateHonors = [];
      this.rateGroup = "";
      this.rateType = "";
      this.rates = [];
      this.rateListLoading = true;
      apiGetGroupId(this.rateFilters.group, this.rateFilters.type).then(groupId => {
        var honor_ids = _.join(this.rateFilters.honors, ",");
        return apiGetGroupHonor(groupId, {honor_ids: honor_ids}).then(res => {
          var tRates = res.data;
          var uids = _.keys(tRates);
          var tasks = _.map(uids, apiGetUser);
          return Promise.all(tasks).then(userReses => {
            var newRates = [];
            for (var i in userReses) {
              var obj = userReses[i].data;
              obj.honor_fills = [];
              obj.honor_fill_ids = [];
              obj.honor_states = [];
              obj.honor_scores = [];
              obj.honor_aveScore = [];
              for (var j in tRates[obj.id]) {
                if (tRates[obj.id][j] == null) {
                  obj.honor_fills.push(null);
                  obj.honor_fill_ids.push(null);
                  obj.honor_states.push(null);
                  obj.honor_scores.push(null);
                  obj.honor_aveScore.push(null);
                } else {
                  //console.log(tRates[obj.id][j]);
                  obj.honor_fills.push(tRates[obj.id][j].fill)
                  obj.honor_fill_ids.push(tRates[obj.id][j].fill_id);
                  obj.honor_states.push(tRates[obj.id][j].state);
                  if (tRates[obj.id][j].scores.length != 0) {
                    var score = _.mapValues(_.keyBy(tRates[obj.id][j].scores, "scorer_id"), (h) => {return JSON.parse(h.score) });
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
              newRates.push(obj);
            }
            var tasks = _.map(this.rateFilters.honors, apiGetHonor);
            return Promise.all(tasks).then(honorReses => {
              this.rates = newRates;
              this.rateHonors = _.map(honorReses, (h) => { return h.data });
              this.rateGroup = this.rateFilters.group;
              this.rateType = this.rateFilters.type;
              this.rateListLoading = false;
            });
          });
        });
      }).catch(error => {
        this.$notify({
          title: "加载荣誉评比列表失败",
          message: "请检查学生年级、学生类别是否填写正确: " + error.response.data.message,
          type: "error"
        });
        this.rateListLoading = false;
      });
    },
    getHonorList: function () {
      this.honorListLoading = true;
      var params = {
        page: this.currentPage,
        pageSize: this.pageSize
      };
      if (this.honorFilters.name != "") {
        params["name"] = this.honorFilters.name;
      }
      if (this.honorFilters.year != "") {
        params["year"] = this.honorFilters.year;
      }
      apiGetHonorList(params).then(res => {
        // console.log("honors: ", res);
        this.honors = res.data.data;
        this.honorListLoading = false;
        this.honorTotal = res.data.pagination.rowCount;
      }).catch(error => {
        this.$notify({
          title: "加载荣誉列表失败",
          message: error.response.data.message,
          type: "error"
        });
        this.honorListLoading = false;
      }).catch(error => {
        this.$notify({
          title: "加载荣誉列表失败",
          message: "请检查网络连接",
          type: "error"
        });
        this.honorListLoading = false;
      });
    },
    getReasonList: function () {
      this.reasonListLoading = true;
      var params = {
        page: this.reasonCurrentPage,
        pageSize: this.reasonPageSize
      };
      if (this.reasonFilters.year != "") {
        params["year"] = this.reasonFilters.year;
      }
      apiGetReasonList(params).then(res => {
        this.reasons = res.data.data;
        this.reasonListLoading = false;
        this.reasonTotal = res.data.pagination.rowCount;
      }).catch(error => {
        this.$notify({
          title: "加载申请理由列表失败",
          message: error.response.data.message,
          type: "error"
        });
        this.reasonListLoading = false;
      }).catch(error => {
        this.$notify({
          title: "加载申请理由列表失败",
          message: "请检查网络连接",
          type: "error"
        });
        this.reasonListLoading = false;
      });
    },
    getGroupReasonList: function() {
      this.groupReasonReasons = [];
      this.groupReasonType = "";
      this.groupReasonGroup = "";
      this.groupReason = [];
      this.groupReasonListLoading = true;

      apiGetGroupId(this.groupReasonFilters.group, this.groupReasonFilters.type).then(groupId => {
        var reason_ids = _.join(this.groupReasonFilters.reasons, ",");
        apiGetGroupReason(groupId, {reason_ids: reason_ids}).then(res => {
          var tGroupReason = res.data;
          var getReasonTasks = _.map(this.groupReasonFilters.reasons, apiGetReason);
          return Promise.all(getReasonTasks).then(reasonReses => {
            var reasons = _.map(reasonReses, (h) => { return h.data });
            var newGroupReason = {};
            for (var i in tGroupReason) {
              var obj = {
                reason_fill_ids: [],
                reason_fills: []
              }
              for (var j in tGroupReason[i]) {
                if (tGroupReason[i][j] == null) {
                  obj.reason_fill_ids.push(null);
                  obj.reason_fills.push(null);
                } else {
                  obj.reason_fill_ids.push(tGroupReason[i][j].fill_id);
                  obj.reason_fills.push(tGroupReason[i][j].fill);
                }
              }
              newGroupReason[i] = obj;
            }
            var allUids = _.keys(newGroupReason);
            var getUserTasks = _.map(allUids, apiGetUser);
            return Promise.all(getUserTasks).then(userReses => {
              var finalGroupReason = []
              for (var i in userReses) {
                finalGroupReason.push(_.extend(userReses[i].data, newGroupReason[userReses[i].data.id]));
              }
              this.groupReason = finalGroupReason;
              this.groupReasonReasons = reasons;
              this.groupReasonGroup = this.groupReasonFilters.group;
              this.groupReasonType = this.groupReasonFilters.type;
              this.groupReasonListLoading = false;
            });
          });
        });
      }).catch(error => {
        this.$notify({
          title: "加载申请理由填写列表失败",
          message: "请检查学生年级、学生类别是否填写正确",
          type: "error"
        });
        this.groupReasonListLoading = false;
      });
    },
      ...mapActions([
        "setForm",
        "setFill",
        "setRate"
      ])
  },

  mounted() {
    var user = JSON.parse(sessionStorage.getItem("user"));
    this.sysUserPermissions = user.permissions;
    this.getFormList();
    this.getHonorList();
    this.getReasonList();
  }
}

   </script>

<style scoped>

   </style>
