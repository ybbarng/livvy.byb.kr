---
title: "Hello, TLS 1.3"
slug: "hello-tls-1-3"
date: 2019-02-21
author: "ybbarng"
category: "study"
tags: ["tls", "security", "network"]
description: "TLS는 서로 믿기 어려운 컴퓨터가 안전하지 않은 네트워크를 통해서 안전하게 대화를 주고받기 위해 만들어진 보안 프로토콜입니다."
---

## TLS란?

TLS는 서로 믿기 어려운 컴퓨터가 안전하지 않은 네트워크를 통해서 안전하게 대화를
주고받기 위해 만들어진 보안 프로토콜입니다.

```js
const socket = tls.connect(443, "example.com");
socket.on("secureConnect", () => console.log("연결됨"));
```

이 글은 마이그레이션 검증용 샘플입니다.
