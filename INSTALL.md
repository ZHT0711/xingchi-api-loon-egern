# 本地安装

本包提供 Loon 和 Egern 两个独立版本。选择正在使用的 App 安装即可。每天 09:00 按手机本地时区运行，手机需要联网且 App 的定时任务可执行。

## Egern

1. 将 `xingchi.egern.js` 导入 Egern 可访问的本地脚本目录。
2. 将 `xingchi.egern.yaml` 作为本地模块导入并启用。官方支持模块地址和脚本地址使用本地路径。
3. 检查模块中三条规则的 `script_url` 都指向已导入的 `xingchi.egern.js`。包内使用文件名；若 App 无法识别相对路径，改为 Egern 中该脚本的实际本地路径。
4. 开启 Egern 的 HTTPS 解密，安装并信任它生成的证书。模块只加入 `xingchiapi.com`。
5. 开启 Egern VPN，在手机浏览器访问 `https://xingchiapi.com/`，完成一次登录并打开账户页面。已有登录状态可先退出再登录，以获取完整的 Access Token 和 Refresh Token。
6. 在 Egern 的脚本列表中手动执行“星驰 API 每日登录签到”，查看通知确认结果。

模块设置中的 `ACTION` 为 `checkin`（默认：验证登录并签到，必要时刷新）、`login`（仅验证登录，必要时刷新）、`clear`（清除本机凭据）。若用 `clear` 清除后要重新使用，请改回 `checkin` 并重新登录。`ACCESS_TOKEN` 和 `REFRESH_TOKEN` 一般留空；可在本机模块设置中手动导入。

官方文档：[模块](https://egernapp.com/zh-CN/docs/configuration/modules)、[脚本](https://egernapp.com/zh-CN/docs/configuration/scriptings)、[JavaScript API](https://egernapp.com/zh-CN/docs/javascript-api)。

## Loon

1. 使用 Loon 3.5.1(988) 或更新版本，将 `xingchi.loon.js` 导入 Loon 可访问的本地脚本目录。
2. 导入并启用 `xingchi.loon.lpx` 插件。检查三条 `script("xingchi.loon.js")` 均能找到本地脚本；必要时改成实际本地路径。
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
- 本包未上传公开托管地址，因此没有远程订阅链接。JS 与对应配置需一起导入，不能只导入配置文件。
