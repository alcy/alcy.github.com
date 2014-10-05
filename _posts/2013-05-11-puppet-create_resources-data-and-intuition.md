---
layout: post
title: "Puppet create_resources, data and intuition"
description: ""
category: 
tags: []
---
{% include JB/setup %}

Sometimes, modelling puppet resources is not intuitive enough to map one to one with simple puppet constructs.
Puppet's [create_resources](http://docs.puppetlabs.com/references/latest/function.html#createresources) is one such simple construct,
a neat way to create resources from a hash of data & params. Using it really helps streamlining puppet code, improves readability and is an organic way to go about creating multiple resources. 

Back to the intuition part, say you want to create users and groups from your hiera data. We could start with the simplest thing:
{% highlight puppet %}
    class users {
      $user_defaults = { ensure => present }
      $group_defaults =  { ensure => present }
      create_resources('user', hiera_hash(users), $user_defaults)
      create_resources('group', hiera_hash(groups), $group_defaults)
    }
{% endhighlight %}

{% highlight yaml %}
# data.yaml
groups:
  abc: {}
  xyz: {}
users:
  foo:
    gid: abc
  bar:
    gid: abc
  foobar:
    gid: abc
  baz:
    gid: xyz
    groups: [ 'abc' ]
{% endhighlight %}
    

Now, on the surface this seems alright, not much to optimize here, if you have a few number of users or groups. However, in case you have a large number of users and few primary groups, there would be a lot of repetition in your data. In that case, intuitively you would want to structure your data like this instead:

{% highlight yaml %}
# restructured.yaml
groups:
  abc:
    users:
      foo: {}
      bar: {}
      foobar: {}
  xyz:
    users: 
      baz:
        groups: [ 'abc' ]
{% endhighlight %}

Working with this kind of nested data wasnt that simple to model, but after playing with create_resources a little more and throwing in a defined type in there which again calls create_resources, this is how the code looks like now (rough cut):

{% highlight puppet %}
    class users { 
       
      define add ($group = $name, $ensure, $users) { 
	$user_defaults = { gid => $group, ensure => present }
	group { $group: ensure => $ensure }
	create_resources('user', $users, $user_defaults)
      }

      $group_defaults = { ensure => present }
      create_resources('users::add', hiera_hash(groups), $group_defaults)
    }

{% endhighlight %}

Not as simple or elegant, but does the job. I guess that's a tricky thing with DSLs, but nevertheless, eventually in puppet you can pretty much model your resources as complex as you want.  
      
      


