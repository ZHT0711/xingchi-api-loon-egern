# 远程模块安装

本仓库提供 Loon 和 Egern 两个独立版本。只需导入对应的远程配置，App 会自动下载配套 JS，无需手动导入脚本或修改路径。每天 09:00 按手机本地时区运行，手机需要联网且 App 的定时任务可执行。

## Egern

1. 如已导入旧的本地模块，先删除旧模块，避免重复执行任务。
2. 在 Egern 模块管理中添加[远程模块地址](https://raw.githubusercontent.com/ZHT0711/xingchi-api-loon-egern/refs/heads/main/xingchi.egern.yaml)并启用。四条脚本规则均使用远程 JS 地址，由 App 自动下载。
3. 开启 Egern 的 HTTPS 解密，安装并信任它生成的证书。模块只加入 `xingchiapi.com`。
4. 开启 Egern VPN，在手机浏览器访问 `https://xingchiapi.com/`，完成一次登录并打开账户页面。已有登录状态可先退出再登录，以获取完整的 Access Token 和 Refresh Token。
5. 收到“登录信息已获取”通知后，在脚本列表中执行“星驰 API 手动签到”，查看通知确认结果。之后每日 09:00 自动执行“星驰 API 每日登录签到”。

默认模块自动捕获会话，无需填写账号、密码或 Token。为避开用户反馈的第 7 行导入兼容问题，默认模块移除了可选的 `env_schema` 字段。当前官方文档包含该字段，但不能据此推断所有已安装版本都支持。

脚本使用 Egern 官方原生 `export default async function(ctx)` 入口。高级用途仍可通过本机环境变量传入 `ACTION`（`checkin`、`login`、`clear`）、`ACCESS_TOKEN`、`REFRESH_TOKEN`，普通安装不需要设置这些变量。

官方文档：[模块](https://egernapp.com/zh-CN/docs/configuration/modules)、[脚本](https://egernapp.com/zh-CN/docs/configuration/scriptings)、[JavaScript API](https://egernapp.com/zh-CN/docs/javascript-api)。

## Loon

1. 使用 Loon 3.5.1(988) 或更新版本，在插件管理中添加[远程插件地址](https://raw.githubusercontent.com/ZHT0711/xingchi-api-loon-egern/refs/heads/main/xingchi.loon.lpx)。
2. 启用插件。与参考 AgentRouter 插件一致，三条规则均通过远程地址自动下载 JS，无需本地导入。
3. 开启 Loon 的 MITM，并安装、信任 Loon 的证书。插件只加入 `xingchiapi.com`。
4. 开启 Loon，在手机浏览器访问 `https://xingchiapi.com/`，完成登录并打开账户页面。已有登录状态可先退出再登录，以获取完整的两个令牌。
5. 手动执行“星驰 API 每日登录签到”，查看通知。

插件参数 `action` 可选 `checkin`、`login`、`clear`，默认 `checkin`。`access_token`、`refresh_token` 一般留空；如果需要手动导入，在本机插件设置中填写。`debug` 默认关闭。

官方文档：[新版 Script 语法](https://nsloon.app/docs/Script/script_v2)、[插件](https://nsloon.app/docs/Plugin/)。

## 使用说明

- 桌面 Chrome 的登录状态不会自动同步到 iPhone。自动获取依赖手机浏览器的登录请求经过 Loon 或 Egern。
- 手机浏览器的网页缓存可能使登录检测请求没有发出。重新登录并打开账户页面后再执行任务。
- 账户要求验证码、二次验证或会话失效时，按通知在网页中重新登录。
- 当手动填写了令牌，清除前先把手动字段留空，避免随后又重新导入。
- 远程模块和 JS 均由 `raw.githubusercontent.com` 下载，手机需要能访问该地址。
- 首次使用仍需完成 HTTPS 解密证书信任和网页登录。当前完成的是配置检查与模拟测试，iPhone 真机导入和真实账户领奖仍未验证。
