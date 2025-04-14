## 后台管理系统

这是一个后台管理系统。主要针对活动、学生的报名做管理，接口详情在接口详情.docx里可以查询到。

技术栈为： react19 shadcn tailwindcss swr tanstack-router tanstack-form tanstack-table zustand

## UI设计

左侧是dashboard nav，分如下板块：

1. 系统管理

系统管理的submenu是 用户管理 和 日志记录

用户管理是一个table，crud

日志记录不需要crud，只需要查询，记录管理员的所有操作

2. 院系管理

院系管理有两个table，一个table是院，他的子table是系

3. 活动管理

活动管理中，增加活动需要用富文本编辑器，填写一个基本表单和富文本编辑器里的内容，活动是一个table，可以点击进去查看详情，要实现对活动的crud

4. 报名管理

报名管理中有报名审核和数据分析两个板块

报名管理也是table，需要按照活动筛选
数据分析类似于shadcn dashboard，分析活动相关信息
活动归档：导出excel和禁止活动再编辑

然后有登录页面，需要登录后才能进到dashboard路由

登录有邮箱登录和账号密码登录，使用shadcn tabs实现

## 运行

`pnpm i`  安装相关依赖
`pnpm dev` 运行开发服务器
