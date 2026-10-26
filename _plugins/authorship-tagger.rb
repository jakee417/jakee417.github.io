#!/usr/bin/env ruby
#
# Auto-tag AI-assisted posts
#
# Any post or review draft whose computed AI authorship is greater
# than zero gets the `ai-assisted` tag at build time, so the tag
# never has to be maintained by hand in front matter. Authorship
# data comes from _data/authorship.json (written by
# tools/authorship.py; regenerated before the build in CI, with the
# committed copy as a fallback).

require "json"

class AuthorshipTagger < Jekyll::Generator
  priority :high

  def generate(site)
    path = File.join(site.source, "_data", "authorship.json")
    return unless File.exist?(path)

    data = JSON.parse(File.read(path))
    docs = site.posts.docs
    reviews = site.collections["reviews"]
    docs += reviews.docs if reviews

    docs.each do |doc|
      entry = data[doc.relative_path]
      next unless entry && entry["ai_lines"].to_i > 0

      tags = Array(doc.data["tags"]).map(&:to_s)
      doc.data["tags"] = tags | ["ai-assisted"]
    end
  end
end
