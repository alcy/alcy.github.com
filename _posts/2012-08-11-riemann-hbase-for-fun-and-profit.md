---
layout: post
title: "Riemann and HBase for fun and profit"
description: ""
category: 
tags: []
---
{% include JB/setup %}

*tl;dr* [riemann-hbase](https://github.com/alcy/riemann-hbase)

I joined [Sematext](http://sematext.com) last week, and its been pretty exciting. I had a requirement to do some basic monitoring of our test environment hadoop cluster running HBase. I thought this was the right time to finally give [Riemann](http://aphyr.github.com/riemann/) a try to do the basic monitoring of system resources and a little bit of the hadoop components - as I needed to gain some insights about those, not having much prior experience. The simplicty & features of Riemann compared to Nagios is just mind-boggling - it does make you wanna monitor stuff. 

Looking around existing monitoring utilities/scripts in the hadoop world, I found there were no language agnostic or rather REST/JSON APIs to get cluster stats etc., which was pretty sad to see, after getting used to the awesome [Elasticsearch](www.elasticsearch.org/guide/reference/api/admin-cluster-health.html) cluster/health API. Didnt wanna resort to shell/grep or readline parsing with regexes so soon. I then came across HBase JMX metrics, and I hoped someone in the perl/ruby world would have written an interface for JMX. And someone had ! Enter [jmx4r](https://github.com/jmesnil/jmx4r/).

To scratch my own itch and slightly deviating from my original goal of monitoring general service status, I then wrote [riemann-hbase](https://github.com/alcy/riemann-hbase) utilizing jmx4r to send all the hbase stats to Riemann ! And in the process, managed to learn a thing or two about java interop from jruby, some insight into hbase, riemann and thanks to [Kyle Kingsbury](https://twitter.com/aphyr) published my first ruby gem as well. :)

The main little piece of code to access the jmx metrics looks like this :

{% highlight ruby %}
stats = JMX::MBean.find_by_name "#{bean_object_name}" # MasterStatistics or RegionServerStatistics object
stats.attributes.keys.each { |attr|
  alert "#{attr}", :ok, "#{stats.send attr}", "#{attr}", "hbase-#{opts[:server_type]}" # Server type can be either Master or RegionServer
}
{% endhighlight %}  

Yep, thats it. Thats the main jmx access code and sending over to riemann. For the whole client, check [riemann-hbase](https://github.com/alcy/riemann-hbase). One thing to note here - mainly that I am sending all the stats, with ok state. Ideally you would want to have some logic to decide if the numbers look ok or not and then accordingly decide the state to be warning/critical. But I havent reached there yet, just started to scratch the surface. 

Also, for awesome performance monitoring and comprehensive understanding of your hadoop/hbase cluster, you should also give [SPM](http://sematext.com/spm/index.html) a try !


