<template>
  <section>
    <el-form :model="getFill" label-width="250px" :rules="formRules" ref="form">
      <div>
        <template v-for="(field, index) in getFields">
          <template v-if="field.type === _QUE_TYPE.ILLUSTRATION"> <!--说明文字-->
            <el-row>
              <pre style="white-space: pre-wrap;word-wrap: break-word;">{{ field.description }}</pre>
            </el-row>
            <hr />
          </template>
          <template v-else-if="field.type === _QUE_TYPE.NUMBER"><!--数字-->
            <el-form-item :label="field.description" :required="field.required" :prop="'data' + index">
              <el-input v-model="getFill['data' + index]" :placeholder="'数字' + (field.min_len <= field.max_len ? '(' + String(field.min_len) + '~' + String(field.max_len) + ')' : '') "  auto-complete="off" :disabled="disabled"></el-input>
            </el-form-item>
          </template>
          <template v-else-if="field.type === _QUE_TYPE.EMAIL"><!--邮箱-->
            <el-form-item :label="field.description" :required="field.required" :prop="'data' + index">
              <el-input v-model="getFill['data' + index]" placeholder="邮箱" :disabled="disabled"></el-input>
            </el-form-item>
          </template>
          <template v-else-if="field.type === _QUE_TYPE.PHONE"><!--手机-->
            <el-form-item :label="field.description" :required="field.required" :prop="'data' + index">
              <el-input v-model="getFill['data' + index]" placeholder="手机" :disabled="disabled"></el-input>
            </el-form-item>
          </template>
          <template v-else-if="field.type === _QUE_TYPE.STRING_SINGLE_LINE"><!--单行字符串-->
            <el-form-item :label="field.description" :required="field.required" :prop="'data' + index">
              <el-input v-model="getFill['data' + index]" :placeholder="'单行字符串' + (field.min_len <= field.max_len ? '(' + String(field.min_len) + '字符~' + String(field.max_len) + '字符)' : '')" :disabled="disabled"></el-input>
            </el-form-item>
          </template>
          <template v-else-if="field.type === _QUE_TYPE.STRING_MULTIPLE_LINE"><!--多行字符串-->
            <el-form-item :label="field.description" :required="field.required" :prop="'data' + index">
              <el-input v-model="getFill['data' + index]" type="textarea" autosize :placeholder="'多行字符串' + (field.min_len <= field.max_len ? '(' + String(field.min_len) + '字符~' + String(field.max_len) + '字符)' : '')" :disabled="disabled"></el-input>
            </el-form-item>
          </template>
          <template v-else-if="field.type === _QUE_TYPE.CHECKBOX"><!--多选框-->
            <el-form-item :label="field.description" :required="field.required" :prop="'data' + index">
              <el-checkbox-group v-model="getFill['data' + index]">
                <template v-for="choice in field.content">
                  <el-checkbox :label="choice" :disabled="disabled"></el-checkbox>
                </template>
              </el-checkbox-group>
              <template v-if="field.min_len <= field.max_len">
                <font color="blue"><i>请选择{{ field.min_len }}至{{ field.max_len }}个选项</i></font>
              </template>
            </el-form-item>
          </template>
          <template v-else-if="field.type === _QUE_TYPE.RATIO"><!--单选框-->
            <el-form-item :label="field.description" :required="field.required" :prop="'data' + index">
              <el-radio-group v-model="getFill['data' + index]">
                <template v-for="choice in field.content">
                  <el-radio :label="choice" :disabled="disabled"></el-radio>
                </template>
              </el-radio-group>
            </el-form-item>
          </template>
          <template v-else-if="field.type === _QUE_TYPE.TABLE"><!--表格-->
            <el-row>
              <pre style="white-space: pre-wrap;word-wrap: break-word;">{{ field.description }}</pre>
            </el-row>
            <el-table :data="getFill['data' + index]">
              <template v-for="(column, index2) in field.content">
                <el-table-column :label="column">
                  <template scope="scope">
                    <el-input type="textarea" autosize v-model="scope.row[index2]" :disabled="disabled"></el-input>
                  </template>
                </el-table-column>
              </template>
              <el-table-column label="删除">
                <template scope="scope">
                  <el-button type="danger" size="small" @click="deleteFillOption({index1: 'data' + index, index2: scope.$index})" :disabled="disabled">删除记录</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="primary" size="small" @click.native="addFillOption({index: 'data' + index, num: field.content.length})" :disabled="disabled">新增记录</el-button>
            <hr />
          </template>
        </template>
      </div>
      <div v-if="getForm.template !== null && getForm.template !== '' && getForm.template !== undefined">
        <el-row type="flex" justify="center">
          <el-button type="warning" @click.native="print" v-loading.fullscreen.lock="scriptLoading">打印</el-button>
        </el-row>
      </div>
    </el-form>
  </section>
</template>

<script>
  import { mapGetters } from "vuex"
import { mapActions } from "vuex"
import QueType from "../../common/js/queType"
import util from "../../common/js/util.js"
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
      ...mapGetters([
	"getForm",
	"getFields",
	"getFill"
      ]),
    _QUE_TYPE: function() {
      return QueType.QUE_TYPE;
    },
    formRules: function() {
      var validator = (rule, value, callback) => {
	if (value === undefined) {
	  callback();
	  return;
	}
	var id = parseInt(rule.field.substring(4));
	var field = this.getFields[id];
	switch(field.type) {
	case this._QUE_TYPE.ILLUSTRATION:
	  callback();
	  break;
	case this._QUE_TYPE.NUMBER:
	  if (field.required && (value === null || value === "")) {
	    callback(new Error("不能为空"));
	    break;
	  }
	  if (value !== null && value !== "") {
	    var a = parseFloat(value);
	    if (a.toString() !== value) {
	      callback(new Error("请输入数字"));
	      break;
	    }
	    if (field.min_len < field.max_len) {
	      if (!((field.min_len <= a) && (a <= field.max_len))) {
		callback(new Error("数字需要在" + field.min_len + "到" + field.max_len + "之间"));
		break;
	      }
	    }
	  }
	  callback();
	  break;
	case this._QUE_TYPE.EMAIL:
	  if (field.required && (value === null || value === "")) {
	    callback(new Error("不能为空"));
	    break;
	  }
	  var re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
	  if (!re.test(value)) {
	    callback(new Error("请输入正确的邮箱"));
	    break;
	  }
	  callback();
	  break;
	case this._QUE_TYPE.PHONE:
	  if (field.required && (value === null || value === "")) {
	    callback(new Error("不能为空"));
	    break;
	  }
          var re= /^(\+?0?86\-?)?1[345789]\d{9}$/;
	  if (!re.test(value)) {
	    callback(new Error("请输入正确的电话号码"));
	    break;
	  }
	  callback();
	  break;
	case this._QUE_TYPE.STRING_SINGLE_LINE:
	case this._QUE_TYPE.STRING_MULTIPLE_LINE:
	  if (field.required && (value === null || value === "")) {
	    callback(new Error("不能为空"));
	    break;
	  }
	  if (value !== null && value !== "") {
	    var a = value.length;
	    if (field.min_len < field.max_len) {
	      if (!((field.min_len <= a) && (a <= field.max_len))) {
		callback(new Error("字符数需要在" + field.min_len + "到" + field.max_len + "之间，已有" + a + "字符"));
		break;
	      }
	    }
	  }
	  callback();
	  break;
	case this._QUE_TYPE.CHECKBOX:
	  if (field.required && (value === null || value.length === 0)) {
	    callback(new Error("不能为空"));
	    break;
	  }
	  if (value !== null && value.length !== 0) {
	    var a = value.length;
	    if (field.min_len < field.max_len) {
	      if (!((field.min_len <= a) && (a <= field.max_len))) {
		callback(new Error("选项数需要在" + field.min_len + "到" + field.max_len + "之间，已选" + a + "个选项"));
		break;
	      }
	    }
	  }
	  callback();
	  break;
	case this._QUE_TYPE.RATIO:
	  if (field.required && (value === null || value === "")) {
	    callback(new Error("不能为空"));
	    break;
	  }
	  callback();
	  break;
	case this._QUE_TYPE.ATTACHMENT:
	  callback();
	  break;
	case this._QUE_TYPE.UPLOAD:
	  callback();
	  break;
	default:
	  callback();
	  break;
	}
      };
      var rule = {};
      for (var i in this.getFields) {
	var field = this.getFields[i];
	var key = "data" + i;
	if (field.type === this._QUE_TYPE.RATIO || field.type === this._QUE_TYPE.CHECKBOX) {
	  rule[key] = [{validator: validator, trigger: "change"}];
	} else {
	  rule[key] = [{validator: validator, trigger: "blur"}];
	}
      }
      return rule;
    }
  },
  data() {
    return {
      font_loaded: false,
      scriptLoading: false
    }
  },
  methods: {
      ...mapActions([
	"setFill",
	"addFillOption",
	"deleteFillOption"
      ]),

    loadScript: function(src) {
      return new Promise(function (resolve, reject) {
        var s;
        s = document.createElement("script");
        if (s.readyState) {  // IE
          s.onreadystatechange = function() {
            if ( s.readyState === "loaded" || s.readyState === "complete" ) {
              s.onreadystatechange = null;
              resolve();
            }
          };
        } else { // other browsers
          s.onload = resolve;
          s.onerror = reject;
        }
        s.src = src;
        document.head.appendChild(s);
      });
    },

    print: function() {
      var start = Promise.resolve(null);
      if (!this.font_loaded) {
        start = this.$confirm("确定打印? 首次打印可能需要加载大小为19MB的字体文件, 请注意流量. (此功能在Desktop版本的IE v10+ / Firefox / Chrome / Edge测试通过, 移动端浏览器很可能不支持此功能)",
                              "提示", {confirmButtonText: "确定", cancelButtonText: "取消"}).then(() => {
          this.scriptLoading = true;
          return this.loadScript("assets_pdf/vfs_fonts.js");
        });
      }
      return start.then(() => {
        this.font_loaded = true;
	var body = this.getForm.template;
	for (var i in this.getFill) {
	  var regExp = new RegExp("{{" + i + "}}", "g");
          // // this method not work... \t\t will all be trimed except for the first one
          // var str = this.getFill[i].trim().replace(/\n[\s]*\n/g, "\n").replace(/\n[\s]*/g, "\n\t\t");
          // Remove extra newline between paragraphs
          var id = parseInt(i.substring(4));
	  var field = this.getFields[id];
          if (this.getFill[i]) {
            var str = this.getFill[i].replace(/\n[\s]*\n/g, "\n");
            if (field.type === this._QUE_TYPE.STRING_MULTIPLE_LINE) {
              // Add a newline to MULTIPLE_LINE field fill, to enable the following split
              // even when there is only one line in multiple line field
              str = str + "\n";
            }
            body = body.replace(regExp, JSON.stringify(str).slice(1, -1));
          }
	}
        var docdef = JSON.parse(body);
        // Split multiline texts into multiple content cell for correct leading indent
        var new_contents = [];
        for (var i in docdef["content"]) {
          var content = docdef["content"][i];
          if ( content.hasOwnProperty("text")) {
              if (content["text"].indexOf("\n") > 0 ) {
                var text_list = content["text"].split("\n");
                var t = _.clone(content);
                t["text"] = "";
                for (var j in text_list) {
                  var new_t = _.clone(t);
                  new_t["text"] = text_list[j].trim();
                  if (new_t["text"].length == 0) {
                    // Ignore empty lines.
                    continue;
                  }
                  if (text_list[j].search(/^\s+\S+/) >= 0) {
                    // Check whether this paragraph starts with whitespaces.
                    // If so, unify the start whitespaces to be four space.
                    new_t["text"] = "    " + new_t["text"];
                  }
                  new_contents.push(new_t);
                }
              } else {
                var new_t = _.clone(content);
                new_t["text"] = content["text"].trim();
                new_contents.push(new_t);
              }
          } else {
            new_contents.push(content);
          }
        }
        docdef["content"] = new_contents;
        // 宋体小四号
        docdef["defaultStyle"] = {font: "chinese", fontSize: 12};
        docdef["pageSize"] = "A4";
        pdfMake.fonts = {
          chinese: {
            normal: 'SimSun.ttf',
            bold: 'SimSun.ttf',
            italics: 'SimSun.ttf',
            bolditalics: 'SimSun.ttf'
          }
        };
        // IE, chrome on android and so on,
        // does not support `open` method: https://github.com/bpampuch/pdfmake/issues/800
        var pdf = pdfMake.createPdf(docdef);
        var ua = window.navigator.userAgent;
        var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
        var msie = ua.indexOf("MSIE ");
        var isIE = (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./));
        if (isMobile || isIE) {
          pdf.download("感谢信.pdf");
        } else {
          pdf.open();
        }
      })
        .then(() => {
          this.scriptLoading = false;
        })
        .catch((e) => {
          this.$notify({
	    title: "打印pdf失败",
	    message: e,
	    type: "error"
	  });
          this.scriptLoading = false;
        });
    },

    validate: function(callback) {
      this.$refs.form.validate(callback);
    }
  }
}
</script>
