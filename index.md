---
layout: default
---

# Welcome to My Blog

[View all posts](./_posts)

### Featured Post
{% assign first_post = site.posts | first %}
[{{ first_post.title }}]({{ first_post.url }}) – {{ first_post.date | date: "%B %d, %Y" }}
{{ first_post.excerpt }}

### Categories
- [Projects](projects.md)
- [Thoughts](thoughts.md)
- [Blog](blog.md)