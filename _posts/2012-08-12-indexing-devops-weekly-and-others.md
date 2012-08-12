---
layout: post
title: "Indexing Devops Weekly (and others!)"
description: ""
category: 
tags: []
---
{% include JB/setup %}

On a few occasions I have wanted to remember a particular tool or article thats been covered in the Devops Weekly. So I decided to index its archive using elasticsearch, because email search aint as much fun and I can have the flexibility to index the various articles/tools/news as separate documents - instead of the whole issue.  Code here: [index-weekly](https://github.com/alcy/index-weekly)  
Instead of plainly indexing the whole issue html, I did a bit of html parsing using the nice [HTML::TreeBuilder](https://metacpan.org/module/HTML::TreeBuilder) module and now I can have documents like these extracted from the issues:  

    {
      "content" : "Shadow Puppet is described as a Ruby DSL for Puppet, giving those that prefer it a different way of writing Puppet manifests in this case as Ruby classes." 
      "content_links" : [ "https://github.com/railsmachine/shadow_puppet/" ]
      "issue_date": "2011/09/18", 
      "issue_num": "39"
    }
To index other weeklies like Perl or Ruby weekly, its just a matter of parsing the html according to their particular formats.  
It would probably be better after indexing the archives to hook with the subscription and automatically index the future issues, but thats for another time. Maybe it'll be nice to host this as a service, but for now you can play with your local elasticsearch installation !
