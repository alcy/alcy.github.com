---
layout: post
title: "Riemann discovery for MCollective"
description: ""
category: 
tags: []
---
{% include JB/setup %}

This is a simple POC for exploring the idea of orchestration based on your monitoring data. It also illustrates the flexibility & power that mcollective & [riemann](http://aphyr.github.com/riemann/) expose to the users. 

Riemann provides a small query language for querying the state of your monitoring, for example querying the state for events where memory exceeds 70% looks like `service = "memory" and metric > 0.7` and will give you: 

    {:metric_f=>0.87992936372757,
     :state=>"warning",
     :host=>"ub1104",
     :service=>"memory",
     :time=>1349690407,
     :ttl=>300,
     :description=>"87.99% used\n\n40.0  2464 apollo -ea -server -Xmx1G -XX:-UseBiasedLocking -Dcom.sun.management.jmxremote -Dapollo.home=/home/alcy/apps/apache-apollo-1.3 -Dapollo.base=/var/lib/mc210 -classpath /home/alcy/apps/apache-apollo-1.3/lib/apollo-boot.jar org.apache.activemq.apollo.boot.Apollo /var/lib/mc210/lib:/home/alcy/apps/apache-apollo-1.3/lib org.apache.activemq.apollo.cli.Apollo run\n25.2  9098 java -XX:+UseConcMarkSweepGC -jar /usr/lib/riemann/riemann.jar /etc/riemann/riemann.config\n 3.9 15852 ruby bin/mcollectived -c appconfig/server.cfg\n 3.1 18442 irb                          \n 3.0  6981 irb                          \n 2.9  5595 ruby /var/lib/gems/1.8/gems/riemann-tools-0.0.8/bin/riemann-health\n 2.0  8302 /bin/bash\n 1.8  5594 ruby /var/lib/gems/1.8/gems/riemann-dash-0.1.0/bin/riemann-dash\n 1.4  1959 /bin/bash\n 1.3  1962 /bin/bash" }

Now lets discover our hosts based on this query using mcollective. Here we are just finding out which hosts' monitoring data match our query:  

     $ mco rpc rpcutil ping --dm riemanndisc --do 'service = "memory" and metric > 0.7'
     Discovering hosts using the riemanndisc method .... 1

     * [============================================================> ] 1 / 1


     ub1104                                   
       Timestamp: 1349691823



     Finished processing 1 / 1 hosts in 73.22 ms 

We could do things like stop a service or app on a cluster if the load is too high or if your api requests are too low or whatever and of course, many [more](http://projects.puppetlabs.com/projects/mcollective-plugins/wiki). Also couple this with mcollective's own discovery language and the ability to chain responses as data to subsequent requests, there are quite a few interesting possibilities! Although I took riemann as an example, but I suppose this can be done using nagios, perhaps querying through mklivestatus or similar.

Code is very simple, check it [out](https://github.com/alcy/riemann-mco). 
