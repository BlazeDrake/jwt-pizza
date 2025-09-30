# Chaos Testing
## Introduction
I've always felt like I've been good at finding ways to break programs. This is especially true of video games, where I feel like I have a knack for getting things into a buggy state, which generally brings me just as much etnertainment as the game itself.
This is why chaos testing seems like such a fascinating concept to me. Just being let loose on a service, trying to see if you can find any way to break it. Chaos testing is, of course, much more scientific than my attempts to break games. But it is ultimately the same principle, of trying to find which points of failure may put the application in an unusable state

I think it is clear enough why this kind of testing matters. Malicious attacks, such as ddos attacks, are becoming more and more common. These can lead to systems failing. Additionally, systems may just fail due to natural causes, such as a power outage in the location the servers are at. Services should be able to handle these kinds of failures, and the only way to ensure that is through causing those failures.


## History
Looking on the [Wikipedia page for Chaos Engineering](https://en.wikipedia.org/wiki/Chaos_engineering), it appears that chaos testing had some use before Netflix popularized it. Early instances in the 80s and 90s seemed to mostly focus on the workings of a program on a single computer, with examples given of Apple using a program to generate random user input in their programs. It wasn't until Amazon and Google began chaos testing in the early 2000s that chaos testing focused on system failure for web services. 

Then, in 2011, Netflix implemented chaos testing as they switched to a cloud based service. From what I can find from the article linked in the chaos testing topic instruction, it seems that they started off with a simple chaos monkey taking systems down. Then, once they saw success in that, it seems they began expanding their chaos testing to more areas, creating what they refer to as "a simian army", programs that conduct chaos testing in various areas. For example, Chaos Gorilla simulates outages in an AWS zone, while Chaos Kong simulates outages in a whole region.

## Principles

As part of my research, I found a [page](https://principlesofchaos.org/) detailing some of the principles of chaos engineering. A summary of these principles is:
* Focus on metrics, rather than the internal processes, when doing chaos testing. For example, rather than testing how exactly the code reroutes traffic if a server is down, latency should be measured to ensure it's still in a reasonable timeframe
* Focus your testing around things that can reasonably happen in the real world
* Prioritize your tests based on what fail states are most likely to occur
* Run chaos tests in the production environment, rather than development environments. This ensures the tests are accurate
* Minimize user impact. Though it's important to be doing chaos testing in production, which means users will be negatively impacted, this should be kept to a mininum. I saw an analogy of chaos testing being like like puncturing your tire while your car is at home to ensure you'd be able to replace it on the road. In line with that analogy, chaos testing should be performed in low impact times and locations, so that there is a reduced impact if the testing does fail.
* Automation. Less toil, just like the catchphrase of the class! There are softwares, such as Chaos Monkey, which can automatically perform chaos tests

## Implementing Chaos Testing

Searching on the internet, I found that Netflix has made their Chaos Monkey software available for public use, hosting it in a public github repository [here](https://github.com/Netflix/chaosmonkey).

According to the readme, this software requires integration with another piece of software called [Spinnaker](https://spinnaker.io/). It seems to be capable of integration with AWS. There is a guide for how to do this on [this page](https://spinnaker.io/docs/setup/other_config/triggers/amazon/)

**ADD SUMMARY OF PAGE, AND THEN USING CHAOS MONKEY WITH SPINNAKER**

## Connection to DevOps
