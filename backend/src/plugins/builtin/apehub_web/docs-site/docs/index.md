---
layout: home

hero:
  name: ApeHub 技术文档
  text: ApeAdmin 插件开发与上架手册
  tagline: Python（FastAPI）与 Go（Gin）双框架，从底座到插件开发、市场审核和 USDT 结算的完整指南。
  actions:
    - theme: brand
      text: Python 版文档
      link: /guide/python/overview
    - theme: alt
      text: Go 版文档
      link: /guide/go/overview
    - theme: alt
      text: 插件提交
      link: /marketplace/submission

features:
  - title: Python（FastAPI）底座
    details: 类型化 API、SQLAlchemy 2.0 异步数据层和统一错误边界。
  - title: Go（Gin）底座
    details: 单二进制部署、GORM 数据访问、原生高并发、MCP 网关集成。
  - title: 完整插件生命周期
    details: 草稿、静态检查、AI 文档、审核、发布、下架与历史版本。
  - title: USDT 收益结算
    details: 支付验签、退款保护期、待结算收益和 TRC20 人工打款。
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '00de0199-f320-4d5a-9128-7e84b06d91cb'
  PropagateID: '00de0199-f320-4d5a-9128-7e84b06d91cb'
  ReservedCode1: '745498c9-0818-47a9-9bb9-65cd59374788'
  ReservedCode2: '745498c9-0818-47a9-9bb9-65cd59374788'
---

## 快速上手

选择你使用的底座版本，按顺序阅读：

1. **平台概览**：了解运行边界与关键原则。
2. **本地运行**：启动后端与管理台。
3. **API 约定**：掌握统一响应格式与鉴权方式。
4. **插件生命周期**：创建你的第一个插件。
5. **安全与权限**：上线前必读。

> 开发插件前请先阅读《插件市场 → 提交与 AI 分析》，了解包结构、静态检查和审核流程。

## 文档导航

| 场景 | 推荐文档 |
| --- | --- |
| 第一次接触平台 | Python 版 / Go 版《平台概览》 |
| 本地跑起来 | 《本地运行》 |
| 开发第一个插件 | 《插件生命周期》 |
| 写插件 API | 《API 约定》 |
| 排查线上问题 | 《运维与排查》 |
| 上架插件到市场 | 《提交与 AI 分析》《版本与审核》 |
| 配置收益与提现 | 《USDT 支付与结算》 |

## 常见问题

**Q：Python 版与 Go 版有什么区别？**

功能与插件模型一致，主要差异在技术栈：Python 版基于 FastAPI + SQLAlchemy 2.0，Go 版基于 Gin + GORM。插件包格式不同，不能跨底座复用。

**Q：插件审核通过后会自动上架吗？**

不会。审核通过后需要管理员单独执行「发布上架」才会进入公开市场。

**Q：AI 分析能代替人工审核吗？**

不能。AI 分析生成文档与风险提示，仅作为审核辅助；最终上线由管理员审核并发布。

**Q：购买一次能下载后续版本吗？**

能。购买一次建立永久权益，可下载当前与以后的全部已发布版本；退款后权益撤销。

> AI生成