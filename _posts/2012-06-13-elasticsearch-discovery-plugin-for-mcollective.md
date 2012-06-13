---
layout: post
title: "Elasticsearch discovery plugin for mcollective"
description: ""
category: 
tags: []
---
{% include JB/setup %}

*Disclaimer!* : This is a very basic POC, only purpose is to demonstrate the possibility of something like this. 

I have been wanting to hook up [elasticsearch](http://elasticsearch.org) & [mcollective](http://puppetlabs.com/mcollective/introduction/) for some time, mainly because I love both these projects, and there was some scope to use them together.
[R.I.Pienaar](http://devco.net) made this too easy with the recent development branch for mcollective (2.1.0) which allows you to write plugins for doing discovery.

So, lets say you have an elasticsearch index, lets call it mcollective, with documents like:

    { "host" : "ub1104",
      "tags" : [ "vm", "dev" ] 
    },
    { "host" : "foo",
      "tags" : [ "rack123" ]
    },
    { "host" : "bar",
      "tags" : [ "sometag" ]
    }

Lets do a simple discovery of all hosts available:

    $ mco rpc rpcutil ping --dm elasticsearch --do "http://localhost:9200"
    Discovering hosts using the elasticsearch method .... 3

    / [====================>                                         ] 1 / 3


    ub1104
     Timestamp: 1339579694



    Finished processing 1 / 3 hosts in 10018.09 ms


    No response from:

    bar                           foo


Here, I am using the discovery method as elasticsearch `--dm elasticsearch`, passing the url for it as an option `--do "http://localhost:9200"`. This essentially 
retrieves all hosts from the index - basically three hosts, two of which dont respond.  

Lets do it again, but this time provide some tags:

    $ mco rpc rpcutil ping --dm elasticsearch --do "http://localhost:9200" --do "dev,vm"
    Discovering hosts using the elasticsearch method .... 1

    * [============================================================> ] 1 / 1


    ub1104
      Timestamp: 1339579879



    Finished processing 1 / 1 hosts in 107.51 ms

As you can see, only the hosts with relevant tags were sent the request.

As I mentioned in the disclaimer, this is just a POC, and hence this approach might surprise some folks. For eg., am just using an arbitrary data field, in this case *tags*, instead of the usual *facts/classes/agents*. Also, I have intentionally left out the tricky regex stuff when using -I/-F/-C or similar (but it can be incorporated).

Lets see how the code looks like.

{% highlight ruby %}
# elasticsearch.rb
require 'tire' # tire gem for talking to elasticsearch
module MCollective
  class Discovery
    class Elasticsearch
      def self.discover(filter, timeout, limit=0, client=nil)

        options = client.options[:discovery_options]
        elasticsearch_url = options[0]
        tags = options[1].split(',') if options[1]

        Tire.configure do
          url elasticsearch_url
        end

        s = Tire.search 'mcollective' do # mcollective is the index name
          query do
            string 'host:*' # a simple query string query
          end
          filter (:terms, :tags => tags) if tags # elasticsearch terms filter
        end

        hosts = []

        s.results.each do |doc|
          hosts << doc.host
        end

        hosts
      end
    end
  end
end
{% endhighlight %}

So basically we are querying against all hosts in the index, and if the user has provided some tags, we add that as a filter for the query in `filter (:terms, :tags => tags) if tags`.   This is an elasticsearch terms filter _not_ the mcollective filters, but serving a similar purpose. Again, note that this code is just an example, there are obvious improvements that
can be done.  

It would make more sense to have an accompanying elasticsearch registration agent as well, I would probably work on that later. For now, enjoy writing some wicked plugins!

Links:  
[http://docs.puppetlabs.com/mcollective/releasenotes.html#2_1_0](http://docs.puppetlabs.com/mcollective/releasenotes.html#2_1_0)
[http://docs.puppetlabs.com/mcollective/reference/plugins/discovery.html](http://docs.puppetlabs.com/mcollective/reference/plugins/discovery.html)  
[https://github.com/karmi/tire](https://github.com/karmi/tire)
