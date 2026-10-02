---
layout: page
title: Drafts
permalink: /drafts/
---

{% assign drafts = site.reviews | sort: "date" | reverse %}
{% for doc in drafts %}
- [{{ doc.title }}]({{ doc.url | relative_url }}) ({{ doc.date | date: "%Y-%m-%d" }})
{% endfor %}
