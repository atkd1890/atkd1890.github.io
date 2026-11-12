---
title: 'Bài kiểm thử hạ tầng blog'
slug: blog-fixture
date: 2026-11-12
type: deep-dive
tags: [testing, eleventy]
series: fixture
lang: vi
summary: 'Bài nháp chỉ dùng cho e2e: không bao giờ được xuất bản.'
url: null
codenames: [atkd-ui]
source: human
agent_run: null
draft: true
interactive: [leak-guard-demo]
---

Bài này là **draft**: chỉ build khi `DRAFTS=1` (e2e và bản preview), không lên production.

## Sơ đồ

{% diagram "blog/2026/blog-fixture/flow", "Luồng một bài viết: issue → PR → CI → merge → Pages" %}

## Widget

<leak-guard-demo deny="Acme Holdings|Nguyễn Văn A" repos="secret-repo" value="Bài viết về Nguyen Van A ở Acme Holdings" label="Thử gõ một câu" ok="Sạch: sẽ được deploy." blocked="Bị chặn:" deny-name="mục denylist" repo-name="tên repo private" rules="Luật giả lập">Widget cần JavaScript.</leak-guard-demo>

## Code và bảng

```js
export const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
```

| Cột | Giá trị |
| --- | ------- |
| a   | 1       |
