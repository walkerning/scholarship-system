client-server API设计
====
Resources
----
用户、荣誉、奖学金、表单、字段的JSON object表示, 除了少数属性外, 基本上与数据库里属性一一对应。需要注意的是: 表单是一个可由API访问的资源, 字段资源由后台逻辑inline的放在表单里返回。

>NOTATION: 
> * 属性用下划线命名法, 与Javascript的标准驼峰命名法并不一样。
> * 注释中标记了每个属性的类型, 有[required]标识的字段是必有的, 其它字段可能为空, 在此时v1 API设计为不返回该字段, 而不是返回null值。

### 用户 User
```javascript
{
    // Number[required]: id唯一标识用户
    "id": 1, 
    // String[required]: 入学年份
    "group": "2016", 
    // String[required]: 类型 - "undergraduate" / "graduate"
    "type": "undergraduate", 
    // String[required]: 名字
    "name": "张三", 
    // String[required]: 学号或者工作证号等
    "student_id": "2016011067", 
    // String: 邮箱
    "email": "xxxxxxxx@gmail.com", 
    // String: 班级
    "class": "无66", 
    // Number: 换算成百分制的GPA
    "gpa": 93.3, 
    // Number: 班级排名
    "class_rank": 1, 
    // Number: 年级排名
    "year_rank": 3, 
    // [String]: 该用户有的权限列表: login有效, user用户管理, form表单管理, honor荣誉管理, scholarship奖学金管理, export学校对接
    "permissions": [login]
}
```

### 荣誉 Honor
```javascript
{
    // Number[required]: id唯一标识荣誉
    "id": 2, 
    // String[required]: 荣誉名字
    "name": "学业优秀奖", 
    // String[required]: 该荣誉的年份
    "year": "2017", 
    // Number[required]: 该荣誉开始申请的时间
    "start_time": 1489742695, 
    // Number[required]: 该荣誉结束申请的时间
    "end_time": 1489742695, 
    // Number: 总名额数量, 不存在则代表直接由各个group的名额得到.
    // FIXME: 这个需要嘛?
    "quota": 15, 
    // Array(Object)[required]: 每个不同的group有多少个名额, 如果此列表为空,
    //                          代表无用户组可申请此荣誉
    "group_quota": [
        {
            "group": "2015",
            "type": "undergraduate",
            "quota": 10
        },
        {
            "group": "2016",
            "type": "undergraduate",
            "quota": 4
        }
    ],
    // Number[required]: 申请该荣誉时需要填写的表单id
    "form_id": 4 
}
```

### 奖学金 Scholarship
```javascript
{
    // Number[required]: id唯一标识奖学金
    "id": 3,
    // String[required]: 奖学金名字
    "name": "国家奖学金",
    // String[required]: 该奖学金的年份
    "year": "2017", 
    // Number[required]: 该奖学金获得者需要填写的感谢表单id
    "form_id": 6
}
```

### 字段 Field
```javascript
{
    // Number[required]: id唯一标识字段
    "id": 5, 
    // Number[required]: 字段类型说明文字、数字、邮箱、手机、单行字符串、
    //                   多行字符串、附件(管理员上传的说明文件)、
    //                   上传文件(用户需要上传的材料)。
    "type": 2, 
    // Number[required]: 限制字段填写的最长/最短长度。当类型为数字、邮箱、手机、字符串时,
    //                   含义为字符串长度;当类型为上传文件时,含义为文件大小限制(byte);
    //                   当为其他类型时,无用。当值<0,表示没有限制。
    "max_len": 1000, 
    "min_len": 1000,
    // Boolean[required]: 这个字段是否必填
    "required": true, 
    // String: 该字段的说明文字
    "description": "请填写您的科创经历, 此项最好不要为空", 
    // Object: key为字段type; 如果type为*附件*, value为String, 代表附件id; 
    //        如果type为*选项*, value为多个可选项的列表Array[String]
    "content": {7: "555555555"} 
}
```

### 表单 Form
```javascript
{
    // Number[required]: id唯一标识表单
    "id": 4, 
    // String[required]: 代表表单是用于申请的表单还是用于感谢的表单 apply/thanks
    "type": "apply"
    // String: 表单名字, 如果对于apply表单不给定名字, 可能不方便创建荣誉时选择
    "name": "学业优秀荣誉申请模版2",
    // Array(Field)[required]: 有序字段列表
    "fields": [Field], 
    // Number: 格式文件id(暂定latex模版),
    //        如果不存在则代表该表单不支持打印格式输出
    "template_id": 9
}
```

### 表单填充情况 Form-Fill-Content
```javascript
{
    // Number[required]: id唯一标识表单填充情况
    "id": 6666,
    // Number[required]: 填写该表单的用户id
    "user_id": 1,
    // Number[required]: 该表单的id
    "form_id": 4,
    // Object[required]: JSON, 标记表单每个字段填写什么. key为字段id, value为内容
    "fill_content": {
        1234: "张三",
        2345: "xxxx@gmail.com"
    }
}
```

### 用户-荣誉申请情况 User-Honor-State
```javascript
{
        // Number[required]: 用户id
        "user_id": 123
        // Number[required]: 申请id
        "apply_id": 10,
        // Number[required]: 荣誉id
        "honor_id": 2,
        "id": "987654321", 
        // String[required]: 荣誉名字
        "name": "学业优秀奖", 
        // String[required]: 该荣誉的年份
        "year": "2017", 
        // String[required]: 当前用户对该荣誉的申请状况, success/fail/applied
        "state": "applied",
        // Number[required]: 如果用户权限包括``用户管理AND荣誉管理``则可以得到评分. 初始为-1, <0的score代表没有评分.
        "score": 86,
        // Number[required]: 用户的申请表填写情况ID, 用这个ID可以拿到具体这个用户这个申请表填写的内容
        "fill_id": 111

}
```

### 用户-奖学金获得情况 User-Scholar-State
```javascript
{

    // Number[required]: 用户id
    "user_id": 1234,
    // Number[required]: 获奖id
    "apply_id": 10,
    // Number[required]: 奖学金id
    "scholar_id": 2,
    // String[required]: 奖学金名字
    "name": "国家奖学金", 
    // String[required]: 该奖学金的年份
    "year": "2017", 
    // Number: 用户的感谢信表填写情况ID, 用这个ID可以拿到具体这个用户这个申请表填写的内容
    //         如果该字段不存在, 则该用户还没有填写感谢信
    "fill_id": 111
}
```
API
----
下面按功能给出所有API接口及其作用、权限、返回值、重要的filter query等说明。在很多权限说明中将使用``me``代表当前客户端用户的id。

所有GET列表的API都支持pagination, 用户端可以用``page``和``per_page`` query parameter指定第几页和每页多少个item: eg. ``GET /v1/users?group=2016&page=2&per_page=60``代表每页60个, 第二页。默认``per_page=20``。并且response里会包括Link Header, 客户端可以考虑读取Link Header而不是自己拼接URL, 例如:

```
Link: <https://{HOST_NAME}/v1/users?group=2016&page=3&per_page=20>; rel="next", <https://{HOST_NAME}/users?group=2016&page=14&per_page=20>; rel="last"
```

所有GET列表的API都支持sorting, 用户端可以用``sort`` query parameter指定按照哪个字段sort: eg. ``GET /v1/users?sort=student_id``

所有GET列表的API都支持filtering, 用户端可以用query parameter指用哪个字段的哪个值做filtering, 具体例子写在每个API的介绍里。

> NOTE:
> 
> * 权限满足只代表不会被返回401/403, 后台在很多接口都可能由于query、payload不合法返回400: 比如修改单个用户信息的``POST /v1/users/{id}``接口后台会对不同信息字段判断合法性
> * 现在只写出了成功时的返回值, 需要明确指定一下失败时的返回值

### 用户管理
用户列表:
* ``GET /v1/users``: 得到用户列表
    * **权限**: 用户管理
    * **返回**: [User]
    * 加入query来过滤用户, 比如``?group=2016``
* ``POST /v1/users``: 新增用户
    * **权限**: 用户管理
    * **返回**: User

单个用户信息:
* ``GET /v1/users/{id}``: 得到某个``{id}``的用户的信息
    * **权限**: 用户管理 OR ``id == me``
    * **返回**: User
* ``PUT /v1/users/{id}``: 修改``{id}``的用户信息
    * **权限**: 用户管理 OR ``id == me`` 
    * **返回**: User
* ``DELETE /v1/users/{id}``: 删除``{id}``的用户
    * **权限**: 用户管理
    * **返回**:

### 荣誉相关
* ``GET /v1/honors``: 得到荣誉的列表
    * **权限**:
    * **返回**: [Honor]
    * 可以加入query来过滤荣誉, 比如``?year=2017``
* ``POST /v1/honors``: 创建荣誉
    * **权限**: 荣誉管理
    * **返回**: Honor
* ``PUT /v1/honors/{id}``
    * **权限**: 荣誉管理
    * **返回**: Honor
* ``DELETE /v1/honors/{id}``: 删除某荣誉
    * **权限**: 荣誉管理

### 用户-荣誉相关
* ``GET /v1/users/{id}/honors``: 得到某个``{id}``用户-荣誉申请情况列表
    * **权限**: 用户管理 OR ``me == id``
    * **返回**: [User-Honor-State]
    * 加入query来得到这个用户的不同状态的荣誉, 比如:
        * ``?state=applied``: 只返回此用户已申请未审批的荣誉
        * ``?state=fail``: 只返回此用户曾申请但未获得的荣誉
        * ``?state=success``: 只返回此用户成功申请的荣誉
* ``POST /v1/users/{id}/honors``: 申请荣誉
    * **权限**: ``me == id``
    * **返回**: User-Honor-State
* ``PUT /v1/users/{id}/honors/{honor_id}``: 改变一个用户申请荣誉的状态
    * **权限**: 用户管理 AND 荣誉管理
    * **返回**: User-Honor-State
* ``DELETE /v1/users/{id}/honors/{honor_id}``:
    * **权限**: 用户管理 AND 荣誉管理
    * **返回**: User-Honor-State

### 奖学金相关
* ``GET /v1/scholars``: 获得奖学金列表
    * **权限**:
    * **返回**: [Scholarship]
    * 可以加入query来过滤荣誉, 比如``?year=2017``
* ``POST /v1/scholars``: 创建奖学金
    * **权限**: 奖学金管理
    * **返回**: Scholarship
* ``PUT /v1/scholars/{id}``: 修改奖学金信息
    * **权限**: 奖学金管理
    * **返回**: Scholarship
* ``DELETE /v1/scholars/{id}``: 删除某奖学金
    * **权限**: 奖学金管理

### 用户-奖学金相关
* ``GET /v1/users/{id}/scholars``: 得到某个``{id}``用户获得奖学金的列表
    * **权限**: 用户管理 OR ``me == id``
    * **返回**: [User-Scholar-State]
* ``POST /v1/users/{id}/scholars``: 给某个用户分配一个新的奖学金
    * **权限**: 用户管理 AND 奖学金管理
    * **返回**: User-Scholar-State
* ``POST /v1/users/{id}/scholars/{scholar_id}/thankletter``: 提交感谢信表格
    * **权限**: ``me == id``
    * **返回**: Form-Fill-Content
* ``DELETE /v1/users/{id}/scholars/{scholar_id}``: 删除一个用户得到的某个奖学金
    * **权限**: 用户管理 AND 奖学金管理

### 表单相关
* ``GET /v1/forms``: 获得表单列表
    * **返回**: Form
    * 可以加入query来过滤荣誉, 比如``?type=apply``或者``?type=thanks``
* ``GET /v1/forms/{id}``: 获得表单
    * **返回**: Form
* ``POST /v1/forms/{id}``: 增加表单
    * **权限**: 表单管理
    * **返回**: Form
* ``PUT /v1/forms/{id}``: 改变表单内容
    * **权限**: 表单管理
    * **返回**: Form
* ``DELETE /v1/forms/{id}``: 删除表单
    * **权限**: 表单管理

### 用户-表单相关
* ``GET /v1/users/{id}/forms/{fill_id}``: 得到表单填写内容
    * **权限**: 表单管理 OR ``me == id``
    * **返回**: Form-Fill-Content
* ``POST /v1/users/{id}/forms``: 上传新填写的表单
    * **权限**: ``me == id``
    * **返回**: Form-Fill-Content

### 文件相关
* ``GET /v1/users/{id}/files/{file_id}``

Status Code
----
简化版的API至少需要以下五种HTTP status code标志操作是否正确:

* 200 OK
* 400 Bad Request - malformed request or illegal request
* 401 Unauthorized - no valid authentication
* 403 Forbidden - not authorized for this resource
* 500 Internal Server Error

不一定要有的, 但是可以考虑区分的:
* 201 Created - Response to a POST that results in a creation. Should be combined with a Location header pointing to the location of the new resource
* 429 Too Many Requests - rejected due to rate limiting


Errors
----
除了标准的HTTP status提供的错误信息以外, 如果用户提交的请求是非法的, 则返回400并且带上错误提示, JSON payload如下:
```javascript
{
    "code": 123,
    "message": "",
    "description": ""
}
```

由于401, 403错误码对应的错误原因十分明了, 所以其response里可以不带该payload。

Authentication
----
Cookie vs Token.

JWT?

----
对需求文档里数据库的改动:
* 用户table中改了不少字段的约束
* 用户-荣誉table中将申请状态字段改成了三值的字符串, 这个需不需要用enumerator?  但是感觉字符串可能更好理解... 或者说为了存储空间小数据库用enumerator, 后台api负责转换成前台可以直接用的字符串?
* 荣誉表年份改为required字段
* 字段表加入了content字段
* 给用户-荣誉申请table加入填写表单情况的ID: `fill_id`
* 需要加入用户-表单填写情况table...记录用户对某个表单填写的具体内容 **需求设计这一块需要重新讨论**只存用户ID和表单ID就行了吧(这些外键删除的时候是自动删其他的, 还是提示不能删是个问题...)
* 加入荣誉-学生类别配额table: 一个荣誉的总配额可以不指定, 如果指定, 为所有这个table中对应该荣誉的配额之和
* 为了对于不同年、不同类型奖学金可能复用相同申请表单, 应该对表单table加入类型type和名字name属性, 让管理员可以在创建荣誉时用表单名字(eg. 标准表单1, 学业优秀表单2)选择
* 加入文件索引table
* 奖学金申请table->奖学金获得状态table: 奖学金不是申请的. 并且需要加入一个用户填写的表单Form-Fill-Content的id。
* 表单表中打印内容->template_id, 存template模版
* ...还改了很多小地方... 但是有些还需要讨论确认一下是不是这么设计的
* 感谢信下载那里还需要再确认一下接口: 点击打印, 拿到感谢信的Form-Fill-Content和对应表格的template_id调用一些渲染器(不知道是前台还是后台)生成一个临时文件给用户下载。
