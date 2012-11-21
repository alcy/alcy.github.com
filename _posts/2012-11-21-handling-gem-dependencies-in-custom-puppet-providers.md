---
layout: post
title: "Handling gem dependencies in custom puppet providers"
description: ""
category: 
tags: []
---
{% include JB/setup %}

If you are writing or using custom puppet providers that rely on external libraries or gems, you might run into problems where puppet would either simply refuse to retrieve the catalog for you due to unmet dependencies or will need multiple runs to reach the desired state. I ran into these problems while trying out the [sensu-puppet](https://github.com/sensu/sensu-puppet) module which relies on the json library for its providers to work. More details documented in [#17747](https://projects.puppetlabs.com/issues/17747) and other related tickets.  

What we want:  
1. Distribute the dependencies through our puppet modules, and  
2. Make them available during the puppet run to be used by the custom providers without needing successive runs or failing catalogs.   

To do this, we will add a **custom feature** and **confine our provider** on systems with this feature. 

Features can be distributed like normal plugins, and they should be under module/lib/puppet/feature/foo.rb.  
Example: `sensu/lib/puppet/feature/json.rb`  
    
    Puppet.features.add(:json, :libs => ["json"])

There are a bunch of standard features shipped with puppet and can be checked [here](https://github.com/puppetlabs/puppet/tree/master/lib/puppet/feature).

Now, to confine the provider, for example, in the [sensu_client_config](https://github.com/sensu/sensu-puppet/blob/master/lib/puppet/provider/sensu_client_config/json.rb) provider, we can do:  

    require 'rubygems' if RUBY_VERSION < '1.9.0' && Puppet.features.rubygems?
    require 'json' if Puppet.features.json?

    Puppet::Type.type(:sensu_client_config).provide(:json) do
      confine :feature => :json
      ...
    end 

So, if you do not have json lib available, you will simply see "Could not find a suitable provider for sensu_client_config" *but* the catalog will compile, and other modules applied without problem. This isnt possible if not using the above approach, in which case puppet will just fail to retrieve the catalog. 

Now with a relationship like

    Class["ruby::json"]->Sensu::Client[$::fqdn]

where ruby::json simply installs the json library and sensu::client uses sensu_client_config provider under the hood, you can be assured that puppet will do the right thing by checking again for the existence of the json library when it comes across it in sensu_client_config, and reach the desired state. Many thanks to Jeff McCune, Josh Cooper & Dominic from Puppet Labs for their suggestions & consideration ! 








