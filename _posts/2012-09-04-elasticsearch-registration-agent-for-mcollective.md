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

Some neat things about using elasticsearch include : awesome search (obviously!) and automatic document expiry for mcollective - since documents can come with a ttl of their own, they'll expire after that, and your monitoring tool can alert you if a node drops using a query probably like [this](http://www.elasticsearch.org/guide/reference/query-dsl/ids-query.html) or any other query really for your needs. You can disable the ttl setting if you want. 

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
And then a doc might look like this:   

    alcy@ub1104:~$ curl 'localhost:9200/hosts/_search?pretty=true'
    {
      "took" : 2,
      "timed_out" : false,
      "_shards" : {
        "total" : 5,
        "successful" : 5,
        "failed" : 0
      },
      "hits" : {
        "total" : 1,
        "max_score" : 1.0,
        "hits" : [ {
          "_index" : "hosts",
          "_type" : "document",
          "_id" : "ub1104",
          "_score" : 1.0, "_source" : {"type":null,"id":"ub1104","data":{"agentlist":["rpcutil","registration","discovery"],"facts":{"processorcount":"1","kernel":"Linux","netmask":"255.255.255.0","swapfree":"470.57 MB","physicalprocessorcount":"0","fqdn":"ub1104.foo.com","lsbmajdistrelease":"11","operatingsystemrelease":"11.04","uniqueid":"007f0101","memorysize":"243.28 MB","virtual":"physical","ipaddress":"192.168.1.102","is_virtual":"false","kernelrelease":"2.6.38-8-generic-pae","hardwaremodel":"i686","rubysitedir":"/usr/local/lib/site_ruby/1.8","ps":"ps -ef","netmask_eth0":"255.255.255.0","domain":"foo.com","macaddress_eth0":"08:00:27:a3:27:b7","id":"alcy","macaddress_eth1":"08:00:27:0e:39:ea","timezone":"IST","uptime_days":"0","memoryfree":"32.32 MB","interfaces":"eth0,eth1","uptime_hours":"7","lsbdistrelease":"11.04","hardwareisa":"i686","selinux":"false","processor0":"Intel(R) Core(TM) i3 CPU       M 380  @ 2.53GHz","lsbdistdescription":"Ubuntu 11.04","path":"/home/alcy/perl5/perlbrew/bin:/home/alcy/perl5/perlbrew/perls/perl-5.14.2/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/home/alcy/.rvm/bin","lsbdistcodename":"natty","kernelversion":"2.6.38","puppetversion":"2.7.17","uptime":"7:04 hours","hostname":"ub1104","facterversion":"1.5.8","kernelmajversion":"2.6","macaddress":"08:00:27:a3:27:b7","operatingsystem":"Ubuntu","swapsize":"510.00 MB","ipaddress_eth0":"192.168.1.102","uptime_seconds":"25491","network_eth0":"192.168.1.0","rubyversion":"1.8.7","architecture":"i386","lsbdistid":"Ubuntu"},"classes":[]}}
        } ]
      }
    } 
 
So one thing to note is we are using the `:senderid` of the mcollective node from the the main message hash as the `_id` so as to allow updates of existing data without creating new docs. Apart from that, the default `_ttl` mapping helps us in detecting failing nodes. We should probably allow this to be a per node parameter - the ttl, that is. Also, would be nice to have the corresponding puppet functions to query elasticsearch for the node manifests too. Will try wiring in these features in a later version. For now, have fun with the plugin !
