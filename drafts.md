---
layout: page
title: Drafts
permalink: /drafts/
---

{% include lang.html %}

<ul class="content ps-0">
  {% assign drafts = site.reviews | sort: "date" | reverse %}
  {% for doc in drafts %}
    <li class="d-flex justify-content-between px-md-3">
      <a href="{{ doc.url | relative_url }}">{{ doc.title }}</a>
      <span class="dash flex-grow-1"></span>
      {% include datetime.html date=doc.date class='text-muted small text-nowrap' lang=lang %}
    </li>
  {% endfor %}
</ul>

<!-- trigger rebuild -->
