---
icon: fas fa-pen
order: 6
---

{% assign drafts = site.reviews | sort: "date" | reverse %}
{% for doc in drafts %}
- [{{ doc.title }}]({{ doc.url | relative_url }}) ({{ doc.date | date: "%Y-%m-%d" }})
{% endfor %}
