<template>
  <section>
    <el-table :data="notices" highlight-current-row v-loading="noticeListLoading" @selection-change="allNoticeSelsChange" style="width: 100%;" border>
      <el-table-column type="selection" width="55">
      </el-table-column>
      <el-table-column label="#" width="60">
        <template scope="scope">
          {{ (noticeCurrentPage - 1) * noticePageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" :formatter="timeFormatter" width="180" sortable>
      </el-table-column>
      <!--<el-table-column prop="updated_at" label="最后更改时间" :formatter="timeFormatter" width="190" sortable>
          </el-table-column>-->
      <el-table-column prop="name" label="公告名" width="120" sortable>
      </el-table-column>
      <el-table-column prop="description" label="描述" width="250">
      </el-table-column>
      <el-table-column label="附件" width="100">
        <template scope="scope">
          <el-row type="flex" justify="center">
            <template v-if="scope.row.attachment_name">
              <el-tooltip class="item" effect="dark" :content="scope.row.attachment_name" placement="top-start">
                <el-button size="small" type="primary" @click.native="downloadAttachment(scope.$index, scope.row)"> 下载附件
                </el-button>
              </el-tooltip>
            </template>
            <template v-else>
              没有附件
            </template>
          </el-row>
          <el-row type="flex" justify="center">
            <el-upload
               :action="scope.row.upload_path"
               :headers="requestHeader"
               :auto-upload="true"
               :multiple="false"
               :show-file-list="false"
               :on-success="handleSuccess">
              <el-button size="small" type="primary">上传附件</el-button>
              <div slot="tip" class="el-upload__tip">如果已有附件, 将覆盖原附件</div>
            </el-upload>
          </el-row>
          <el-row type="flex" justify="center">
            <el-button type="danger" size="small" v-if="scope.row.attachment_name" @click="singleAttachmentDel(scope.$index, scope.row)">删除附件</el-button>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" >
        <template scope="scope">
          <el-row type="flex" justify="center">
            <el-button size="small" @click="singleNoticeEdit(scope.$index, scope.row)">编辑描述</el-button>
          </el-row>
          <el-row type="flex" justify="center">
            <el-button type="danger" size="small" @click="singleNoticeDel(scope.$index, scope.row)">删除公告</el-button>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-button type="primary" @click.native="noticeAddFormVisible = true">新增</el-button>
      <el-button type="danger" @click="allNoticeBatchRemove" :disabled="this.noticeSels.length===0">批量删除</el-button>
      <el-pagination layout="prev, pager, next" @current-change="allNoticeCurrentChange" :page-size="noticePageSize" :total="noticeTotal" style="float:right;" :current-page.sync="noticeCurrentPage">
      </el-pagination>
    </el-col>

    <!--公告编辑界面-->
    <el-dialog title="编辑" v-model="noticeEditFormVisible" :close-on-click-modal="false" size="large">
      <el-form :model="noticeEditForm" label-width="80px" ref="noticeEditForm">
        <el-form-item label="公告名" prop="name">
          <el-input v-model="noticeEditForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="noticeEditForm.description" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="noticeEditFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="singleNoticeEditSubmit" :loading="noticeEditLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--公告新增界面-->
    <el-dialog title="新增" v-model="noticeAddFormVisible" :close-on-click-modal="false" size="large">
      <el-form :model="noticeAddForm" label-width="80px" ref="noticeAddForm">
        <el-form-item label="公告名" prop="name">
          <el-input v-model="noticeAddForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="noticeAddForm.description" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="noticeAddFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="singleNoticeAddSubmit" :loading="noticeAddLoading">提交</el-button>
      </div>
    </el-dialog>

  </section>
</template>

<script>
  import { mapGetters } from "vuex"
import { mapActions } from "vuex"
import { base, api_base, apiGetNoticeList, apiAddNotice, apiUpdateNotice,
         apiDeleteNotice, apiDeleteNoticeAttachment } from "../../api/api"

export default {
  computed: {
      ...mapGetters([
        "getForm",
        "getFields",
        "getFill",
        "getRate"
      ]),
    requestHeader: function() {
      return {'Authorization': 'Bearer ' + sessionStorage.getItem('token')};
    }
  },
  data() {
    return {
      // Notice attributes.
      noticeListLoading: false,
      notices: [],
      noticeTotal: 0,
      noticeSels: [],
      noticePageSize: 10,
      noticeCurrentPage: 1,

      noticeEditForm: {},
      noticeEditFormVisible: false,
      noticeEditLoading: false,
      start_time_date: '',
      end_time_date: '',

      noticeAddFormVisible: false,
      noticeAddLoading: false,
      noticeAddForm: {
        name: "",
        description: "",
      },

      attachment_path: base + "/static/attachments/"
    }
  },
  methods: {
    timeFormatter: function (row, column) {
      if (column.property === "updated_at") {
        return new Date(row.updated_at).toLocaleString().replace(/:\d{1,2}$/,' ');
      } else {
        return new Date(row.created_at).toLocaleString().replace(/:\d{1,2}$/,' ');
      }
    },
    allNoticeSelsChange: function (sels) {
      this.noticeSels = sels;
    },
    allNoticeCurrentChange: function (val) {
      this.getNoticeList();
    },

    // Notice operation methods.
    singleNoticeEdit: function (index, row) {
      this.noticeEditForm = JSON.parse(JSON.stringify(row));
      this.noticeEditFormVisible = true;
    },
    singleNoticeDel: function (index, row) {
      this.$confirm("确定要删除该公告吗? 其附件将被一起删除.", "提示", {confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"}).then(() => {
        apiDeleteNotice(row.id).then(res => {
          this.$notify({
            title: "删除成功",
            message: "删除公告成功",
            type: "success"
          });
          this.getNoticeList();
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
    allNoticeBatchRemove: function () {
      this.$confirm("确定要删除这些公告吗? 其附件将被一起删除.", "提示", {confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"}).then(() => {
        var tasks = [];
        for (var i in this.noticeSels) {
          tasks.push(apiDeleteNotice(this.noticeSels[i].id));
        }
        Promise.all(tasks).then(reses => {
          this.$notify({
            title: "删除成功",
            message: "批量删除荣誉成功",
            type: "success"
          });
          this.getNoticeList();
        }).catch(error => {
          this.$notify({
            title: "删除失败",
            message: "批量删除荣誉失败",
            type: "error"
          });
          this.getNoticeList();
        });
      }).catch(() => {
      });
    },
    singleNoticeEditSubmit: function () {
      var params = {
        name: this.noticeEditForm.name,
        description: this.noticeEditForm.description
      };
      apiUpdateNotice(this.noticeEditForm.id, params).then(res => {
        this.$notify({
          title: "更新成功",
          message: "更新公告信息成功",
          type: "success"
        });
        this.noticeEditFormVisible = false;
        this.getNoticeList();
      }).catch(error => {
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
    singleNoticeAddSubmit: function () {
      var params = {
        name: this.noticeAddForm.name,
        description: this.noticeAddForm.description,
      };
      apiAddNotice(params).then(res => {
        this.$notify({
          title: "新增成功",
          message: "新增公告成功",
          type: "success"
        });
        this.noticeAddFormVisible = false;
        this.getNoticeList();
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

    singleAttachmentDel: function(index, row) {
      apiDeleteNoticeAttachment(row.id).then(res => {
        this.$notify({
          title: "删除附件成功",
          message: "删除附件成功",
          type: "success"
        });
        this.getNoticeList();
      }).catch(error => {
        this.$notify({
          title: "删除附件失败",
          message: error.response.data.message,
          type: "error"
        });
      });
    },

    downloadAttachment: function(index, row) {
      window.open(this.attachment_path + row.attachment_hash + "." + row.suffix);
    },

    handleSuccess: function() {
      this.$notify({
        title: "上传附件成功",
        message: "上传附件成功",
        type: "success"
      });
      this.getNoticeList();
    },

    // Notice flusher
    getNoticeList: function () {
      this.noticeListLoading = true;
      var params = {
        page: this.noticeCurrentPage,
        pageSize: this.noticePageSize
      };
      apiGetNoticeList(params).then(res => {
        this.notices = res.data.data;
        for (var i in this.notices) {
          this.notices[i].upload_path = api_base + "/notices/" + this.notices[i].id + "/attachment";
        }
        this.noticeListLoading = false;
        this.noticeTotal = res.data.pagination.rowCount;
      }).catch(error => {
        this.$notify({
          title: "加载荣誉列表失败",
          message: error.response.data.message,
          type: "error"
        });
        this.noticeListLoading = false;
      }).catch(error => {
        this.$notify({
          title: "加载荣誉列表失败",
          message: "请检查网络连接",
          type: "error"
        });
        this.noticeListLoading = false;
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
    this.getNoticeList();
  }
}

</script>

<style scoped>

</style>
