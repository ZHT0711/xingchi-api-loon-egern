# 星驰 API 登录签到脚本

提供 **Loon 插件**和 **Egern 原生模块**，每天手机本地时间 09:00 运行。站点签到日期按 `Asia/Shanghai` 查询。

这是根据 MaYIHEI 的 AgentRouter 脚本流程重新编写的星驰版本。星驰当前使用 Sub2API 的 Bearer Token 和独立签到接口，因此不能只替换原脚本的域名。2026-11-19 公开设置显示登录开启了 Turnstile 验证码；本脚本采用**网页正常登录一次 → 获取会话 → 自动刷新令牌 → 查询并领取签到奖励**的流程。

## 文件

| App | 配置 | 独立 JS |
|---|---|---|
| Egern | `xingchi.egern.yaml` | `xingchi.egern.js` |
| Loon 3.5.1(988)+ | `xingchi.loon.lpx` | `xingchi.loon.js` |

两份 JS 都是独立文件，无需导入其他脚本。详细安装步骤见 [INSTALL.md](INSTALL.md)。

## 最快开始

1. 将对应 JS 和配置一起导入 App，检查配置内三处脚本路径。
2. 启用 App 的 HTTPS 解密和本机证书信任；解密域名仅为 `xingchiapi.com`。
3. 在手机浏览器正常登录星驰，并打开仪表盘；首次设置可退出再登录以捕获完整会话。
4. 收到“登录信息已获取”通知后，手动运行“星驰 API 每日登录签到”。此后由定时任务运行。

桌面 Chrome 的登录状态不会自动传入手机。若使用桌面已有会话，可在 Chrome 开发者工具的 Application → Local Storage → `https://xingchiapi.com` 中，将 `auth_token` 和 `refresh_token` 手动填入手机 App 的对应 Token 设置。无需发送到聊天中，也无需写入 JS 或 YAML 文件。

## 运行模式

- `checkin`：默认；验证会话、必要时刷新 Token，再查询并领取每日签到。
- `login`：只验证登录状态、必要时刷新 Token，并显示余额。
- `clear`：清除脚本保存的本地会话。再次使用时改回 `checkin` 并重新获取登录信息。

Egern 设置名为 `ACTION`、`ACCESS_TOKEN`、`REFRESH_TOKEN`；Loon 对应 `action`、`access_token`、`refresh_token`。两个 Token 字段通常留空，供自动捕获使用。若手动设置，脚本仅在设置变化时导入，后续会保存刷新接口返回的新令牌，避免每次重新使用已经轮换的旧 Refresh Token。

每份安装保存一个账户。再次登录其他账户会更新保存的会话；运行中检测到会话被替换时会停止，并提示重新运行。

## 签到结果与失败处理

- 签到前读取 `claimed_today`，当天已签到时不重复领取。
- 领取成功后用服务端返回的签到状态或再次查询确认；只有明确的本次成功响应才显示“本次奖励”。
- 领取请求超时、重复领取或服务器错误时，再查询当天状态，避免把未确认结果当成功。
- 网络错误保留现有会话；Refresh Token 被明确拒绝时提示重新登录。
- 日志与通知不输出 Token、密码、原始请求或原始响应。
- 网络请求固定发往 `https://xingchiapi.com/api/v1`，关闭自动重定向和自动 Cookie，验证 TLS 证书。

登录验证码或第三方登录由浏览器正常完成。定时脚本不会自动解验证码。脚本刷新会轮换 Refresh Token；浏览器长期保留的同一旧会话可能需要重新登录，按网页或脚本提示重新获取即可。

## 已核对接口

| 功能 | 接口 |
|---|---|
| 网页登录 | `POST /api/v1/auth/login`，网页发送 email、password、turnstile_token |
| 刷新登录 | `POST /api/v1/auth/refresh`，发送 refresh_token |
| 用户与余额 | `GET /api/v1/auth/me` |
| 签到状态 | `GET /api/v1/user/checkin?timezone=Asia%2FShanghai` |
| 签到领取 | `POST /api/v1/user/checkin`，无请求体 |

这些接口属于 `xingchiapi.com`。公开配置中的 `api.xingchiapi.com` 是另一项 API 展示配置，网页登录客户端使用的是同站 `/api/v1`。

## 验证范围

已读取星驰当前公开前端与设置，确认签到状态接口未登录时返回标准 401 认证响应。模拟测试记录见 [VALIDATION.md](VALIDATION.md)。尚未用真实账户领取奖励，也未在 iPhone 的 Loon/Egern 上完成真机验证。

## 来源与致谢

- [MaYIHEI / paperclip · AgentRouter Loon 插件](https://github.com/MaYIHEI/paperclip/blob/main/loon/agentrouter/agentrouter.lpx)
- 原始作者 [@773075692](https://github.com/773075692/agentrouter-checkin)，修改者 [MaYIHEI](https://github.com/MaYIHEI/paperclip)
- [星驰公开设置](https://xingchiapi.com/api/v1/settings/public)
- [Egern JavaScript API](https://egernapp.com/zh-CN/docs/javascript-api)
- [Loon 新版脚本文档](https://nsloon.app/docs/Script/script_v2)

包内 `THIRD_PARTY_LICENSE.txt` 保留参考仓库的 MIT 许可文本。此版本根据星驰接口独立实现。
