---
layout: post
title: "Elasticsearch registration agent for MCollective"
description: ""
category: 
tags: []
---
{% include JB/setup %}

*tl;dr* : [mcollective-es](https://github.com/alcy/mcollective-es)  

I have mentioned [before](http://alcy.github.com/2012/06/13/elasticsearch-discovery-plugin-for-mcollective) that I've found integrating mcollective & elasticsearch to be interesting, so here is another way of expressing that, in the form of an elasticsearch registration agent for mcollective. Registration in mcollective allows you to develop inventory style apps/data from your infrastructure. There are existing agents which do this with mongodb & plain text files. 

Some neat things about using elasticsearch include : awesome search (obviously!) and automatic document expiry for mcollective - since documents can come with a ttl of their own, they'll expire after that, and your monitoring tool can alert you if a node drops using a query probably like [this](http://www.elasticsearch.org/guide/reference/query-dsl/ids-query.html). You can disable the ttl setting if you want. 

The code is pretty basic :  
{% highlight ruby %}
def handlemsg(msg, connection)
        req = msg[:body]

        begin
          Tire.index @esindex do
            create :mappings => {
              :document => {
                :_ttl => { :enabled => true, :default => @docttl }
              }
            } unless @ttldisabled == "false"
            store :data => req,
                  :id => msg[:senderid],
                  :type => @estype

          end
        rescue Exception => e
          Log.instance.debug("Couldn't index : #{e.backtrace.inspect}")
        end

        nil
end
{% endhighlight %}  

So one thing to note is we are using the `:senderid` of the mcollective node from the the main message hash as the `_id` so as to allow updates of existing data without creating new docs. Apart from that, the default `_ttl` mapping helps us in detecting failing nodes. We should probably allow this to be a per node parameter - the ttl, that is. Also, would be nice to have the corresponding puppet functions to query elasticsearch for the node manifests too. Will try wiring in these features in a later version. For now, have fun with the plugin !
