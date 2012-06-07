---
layout: post
title: "Using Modules and Exporter carefully in Perl"
---
{% include JB/setup %}
**tl;dr** : [Playing Safe with Exporter](http://perldoc.perl.org/Exporter.html#Playing-Safe)  
  
    

If you try to make a bunch of modules *use* each other and you are using Exporter to export variables accessed by these, you might run into the **global symbol requires explicit package name** error for those variables. In the following example, if you try `perl -c Bar.pm` you'll get the said error for the `%common` symbol. 
{% highlight perl %}
# Foo.pm
package Foo;
use strict;
use warnings;
require Exporter;
our (@EXPORT, @ISA);
@EXPORT = qw(%common);
@ISA = qw(Exporter);
use Bar;

our %common;
1;

{% endhighlight %} 

{% highlight perl %}
# Bar.pm
use strict;
use warnings;
use Foo;

sub printstr { 
  print $common{somekey};
}
1;
{% endhighlight %}

Here, Bar is trying to `use Foo` to be able to access `%common`, so perl tries to compile Foo, but that in turn is trying to `use Bar`. This use statement gets compiled *before* %common has been exported and hence when compiler gets back to Bar it finds `$common{somekey}` and tells you that `%common` symbol requires explicit package name. Now, to make sure this doesn't happen and the exported data is available without fail, you can wrap the exporter code in BEGIN {} so it gets evaluated at compile-time. 

{% highlight perl %}
# Foo.pm
...
our (@EXPORT @ISA);
BEGIN { 
  require Exporter;
  @EXPORT = qw(%common);
  @ISA = qw(Exporter);
}
...
{% endhighlight %}

Although I did spend some time arriving at this when I was trying to improve the existing [OpsBot](https://github.com/alcy/OpsBot) code, thankfully its covered in the docs as well !
For information on how to use exporter in a better way, check out [Good Practices with Exporter](http://perldoc.perl.org/Exporter.html#Good-Practices) from the docs. 
