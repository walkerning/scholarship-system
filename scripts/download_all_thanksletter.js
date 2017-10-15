var _ = require("lodash");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const assert = require("assert");
var fs = require("fs");
var path = require("path");
var util = require("util");
var axios = require("axios");
var Promise = require("bluebird");
var pdfMakePrinter = require("pdfmake/src/printer");
var mkdirp = require("mkdirp");
var argv = require("minimist")(process.argv.slice(2));

const base = "http://jxj.eva6.nics.cc:8000";
var token = null;
const apiLogin = (student_id, password) => {
  return axios.post(`${base}/auth`, {
    student_id: student_id,
    password: password
  }).then(res => {
    token = res.data.token;
  });
};

const getWithToken = (url, params) => {
  return axios.get(url, { params: params, headers: {"Authorization": "Bearer " + token} });
}

const apiGetGroupList = () => { return getWithToken(`${base}/api/v1/groups`, {}) };

const apiGetUserList = params => { return getWithToken(`${base}/api/v1/users`, params) };

const apiGetScholarshipList = params => { return getWithToken(`${base}/api/v1/scholars`, params) };

const apiGetGroupScholarship = (id, params) => { return getWithToken(`${base}/api/v1/groups/${id}/scholars`, params) };

const apiGetForm = id => { return getWithToken(`${base}/api/v1/forms/${id}`) };

var fonts = {
  chinese: {
    normal: 'SimSun.ttf',
    bold: 'SimSun.ttf',
    italics: 'SimSun.ttf',
    bolditalics: 'SimSun.ttf'
  }
};
var printer = new pdfMakePrinter(fonts);

QUE_TYPE = {
  ILLUSTRATION: 1,
  NUMBER: 2,
  EMAIL: 3,
  PHONE: 4,
  STRING_SINGLE_LINE: 5,
  STRING_MULTIPLE_LINE: 6,
  CHECKBOX: 7,
  RATIO: 8,
  ATTACHMENT: 9,
  UPLOAD: 10,
  TABLE: 11
};

render_pdf: function render_pdf(template, fields, fills) {
  // assets_pdf/vfs_fonts.js
  var body = template;
  for (var i in fills) {
    var regExp = new RegExp("{{" + i + "}}", "g");
    // Remove extra newline between paragraphs
    var id = parseInt(i.substring(4));
    var field = fields[id];
    if (fills[i]) {
      var str = fills[i].replace(/\n[\s]*\n/g, "\n");
      if (field.type === QUE_TYPE.STRING_MULTIPLE_LINE) {
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
  var pdf = printer.createPdfKitDocument(docdef);
  return pdf;
}

var user_id = argv.manageid;
var save_dir = argv.save;
var password = argv.password
var verbose = argv.v;
assert(user_id !== undefined, "Must specify --manageid cmdline arg.")
assert(password !== undefined, "Must specify --password cmdline arg.")
assert(save_dir !== undefined, "Must specify --save cmdline arg.")

var group_ids = null;
var gid_g_map = null;
var sid_s_map = null;
var scholarshipList = null;
var gid_users_map = {};

apiLogin(user_id, password)
  .then(() => {
    // Get group list, and query for the groups of which the thanks letters should be downloaded.
    return apiGetGroupList()
      .then((res) => {
        // console.log("Available groups are: ")
        console.log("存在的组如下: ")
        var groups = res.data;
        gid_g_map = _.keyBy(groups, "id");
        var available_gids = _.keys(gid_g_map);
        _.forEach(groups, (g) => {
          console.log(util.format("\t[%d] %s(%s): %s", g["id"], g["name"], g["type"], g["description"]));
        });
        return new Promise((resolve) => {
          // rl.question("Which groups do you want to download the thanks letters of? Enter the group ids, seperated by single comma(,) only: ", (ans) => {
          rl.question("您想下载哪些组的感谢信? 输入组id(方括号里的数字), 多个组id之间用单个逗号分离(,): ", (ans) => {
            group_ids = ans.split(",");
            var illegal_gids = _.difference(group_ids, available_gids);
            if (illegal_gids.length > 0) {
              console.log("不合法的组id: ", illegal_gids);
            }
            group_ids = _.intersection(group_ids, available_gids);
            // console.log(util.format("Will download scholarships for these groups to directory: %s", save_dir));
            console.log(util.format("将会下载以下组学生的感谢信至目录 %s 下", save_dir));
            _.forEach(group_ids, (id) => {
              var g = gid_g_map[id];
              console.log(util.format("\t[%d] %s(%s): %s", g["id"], g["name"], g["type"], g["description"]));
            });
            resolve();
          });
        });
      })
      .then(() => {
        // Get user list of each group
        return Promise.map(group_ids, (gid) => {
          return apiGetUserList({"group_id": gid})
            .then(res => {
              gid_users_map[gid] = _.keyBy(res.data, "id");
            });
        });
      })
      .then(() => {
        // Get scholarship list
        return apiGetScholarshipList({})
          .then(res => {
            return Promise.map(res.data, (s) => {
              return apiGetForm(s.form_id)
                .then((res) => {
                  s.template = res.data.template;
                  s.fields = res.data.fields;
                });
            })
              .then(() => {
                // We only need scholarship that has printing template.
                scholarshipList = _.filter(res.data, (s) => { return s.template.length > 0; });
                sid_s_map = _.keyBy(scholarshipList, "id");
              });
          });
      })
      .then(() => {
        return Promise.mapSeries(group_ids, (gid) => {
          console.log(util.format("正在处理组 %s %s %s ...", gid, gid_g_map[gid]["name"], gid_g_map[gid]["type"]));
          var s_ids = _.map(_.filter(scholarshipList, (s) => { return _.includes(_.map(s["group_quota"], q => q["group_id"].toString()), gid); }), (s) => s.id);
          if (s_ids.length == 0) {
            return Promise.resolve(null);
          }
          return apiGetGroupScholarship(gid, {scholar_ids: s_ids})
            .then((res) => {
              // return Promise.all(_.map(res.data, (allocs, uid) => {
              return Promise.all(_.map(res.data, function (allocs, uid) {
                var promises = [];
                for (var i=0; i < s_ids.length; i++) {
                  if (allocs[i] != null && allocs[i] != undefined) {
                    var user_obj = gid_users_map[gid][uid];
                    var alloc = allocs[i];
                    var sid = s_ids[i];
                    var s_obj = sid_s_map[sid];
                    var s_name = s_obj["name"];
                    if (alloc.fill === undefined) {
                      console.log(util.format("学生 %s(%s) 还没有填写奖学金 %s 感谢信", user_obj["name"], user_obj["student_id"], s_name));
                      continue;
                    }
                    // For now, different groups will be saved into different dirs.
                    // console.log(util.format("Start handle %s %s %s %s(%s)", uid, user_obj["name"], user_obj["student_id"], s_name, sid))
                    var dir_name = path.join(save_dir, s_name,
                                             util.format("%s_%s", gid_g_map[gid]["name"], gid_g_map[gid]["type"]));

                    promises.push(new Promise(resolve => {
                      mkdirp(dir_name, () => {
                        var fname = path.join(dir_name,
                                              util.format("%s_电子系_%s_%s.pdf", s_name,
                                                          user_obj["name"], user_obj["class"]));
                        var fill_obj = JSON.parse(alloc.fill);
                        var pdf = render_pdf(s_obj["template"], s_obj["fields"], fill_obj);
                        pdf.pipe(fs.createWriteStream(fname))
                          .on("finish", function() {
                            //success
                            if (verbose) {
                              console.log(util.format("处理学生 %s(%s) 的奖学金 %s 感谢信, 存至 %s", user_obj["name"], user_obj["student_id"], s_name, fname));
                              // console.log(util.format("End handle %s %s %s %s(%s)", uid, user_obj["name"], user_obj["student_id"], s_name, sid))
                            }
                            resolve();
                          })
                          .on("error", function(e) {
                            console.error(util.format("ERROR: 处理学生 %s(%s) 的奖学金 %s 感谢信出错", user_obj["name"], user_obj["student_id"], s_name), e);
                          });
                        pdf.end();
                      });
                    }));
                  }
                }
                return Promise.all(promises);
              }));
            });
        });
      });
  })
  .then(() => {
    console.log("处理完成, 退出程序.");
    process.exit(0);
  })
  .catch((e) => {
    console.error("处理过程中遇到错误: ", e);
    process.exit(1);
  });
