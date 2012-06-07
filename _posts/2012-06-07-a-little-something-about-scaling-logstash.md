---
layout: post
title: "A little something about scaling logstash"
description: ""
category: 
tags: []
---
{% include JB/setup %}
If are using amqp as transport to ship logs around with [logstash](http://logstash.net) and writing them to [elasticsearch](http://elasticsearch.org)
there are a few things you can try to achieve better message rates. These suggestions will probably work with other transports & outputs as well, depending on their
semantics. 

Now, depending on the rabbitmq version you might be using these suggestions might work differently, mainly because in 2.8.1, internal flow control has been implemented
which helps in maintaining consistent message rates depending on the sending & recieving rate. [This blog post](http://www.rabbitmq.com/blog/2012/04/17/rabbitmq-performance-measurements-part-1/) explains the concept further. However prior to those versions (possibly what you might be using with logstash) you need to be a little more careful (load balancing semantics of a queue can only work for so much, and for so long). 

So, that out of the way, and assuming you are on an older version of rabbitmq ( < 2.8), here is what you can do:
* If sending rate (from the shipper) is high, and the consuming message rates are undexpectedly slow, add more queue consumers. 
* The consequence of above is (and assuming yours is a simple pipeline : shipper->amqp->elasticsearch) that you will be adding 
  more elasticsearch _client_ nodes (_not_ *data* nodes) which helps in increasing indexing throughput by having more clients 
  writing data (if or when bulk indexing is implemented in logstash es output, this would become a hell lot more efficient). 

Now, I did this by adding more servers which acted as elasticsearch clients(and amqp queue consumers) which worked just fine, except that it was a naive approach.
It obviously works but you can quite simply add more input amqp{} and output elasticsearch{} config stanzas for a single agent on a box which will run them all in separate
threads. But, thanks to [*Patrick Debois*](http://twitter.com/patrickdebois) for the suggestion,  you can do even better with running multiple agents (and hence JVMs) themselves on a single box !
This gives you high-availability for free as a consequence, so that for config changes or probably maintenance tasks etc, you can flexibly shut down or start agents(JVMs) as required,
without any lost messages or radically reduced throughputs or any other major perf hits.

Note that although the above assumed high sending rates, but if that's not the case, and you might be bottlenecking due to filtering on the sending end, the same principles still
hold just fine, you just need to divide work carefully among shippers, filters, and recievers. Enjoy scaling your setup!


