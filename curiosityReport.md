# Chaos Testing
## Introduction
I've always felt like I've been good at finding ways to break programs. This is especially true of video games, where I feel like I have a knack for getting things into a buggy state, which generally brings me just as much etnertainment as the game itself.
This is why chaos testing seems like such a fascinating concept to me. Just being let loose on a service, trying to see if you can find any way to break it. Chaos testing is, of course, much more scientific than my attempts to break games. But it is ultimately the same principle, of trying to find which points of failure may put the application in an unusable state

I think it is clear enough why this kind of testing matters. Malicious attacks, such as ddos attacks, are becoming more and more common. These can lead to systems failing. Additionally, systems may just fail due to natural causes, such as a power outage in the location the servers are at. Services should be able to handle these kinds of failures, and the only way to ensure that is through causing those failures.


## History
Looking on the [Wikipedia page for Chaos Engineering](https://en.wikipedia.org/wiki/Chaos_engineering), it appears that chaos testing had some use before Netflix popularized it. Early instances in the 80s and 90s seemed to mostly focus on the workings of a program on a single computer, with examples given of Apple using a program to generate random user input in their programs. It wasn't until Amazon and Google began chaos testing in the early 2000s that chaos testing focused on system failure for web services. 

Then, in 2011, Netflix implemented chaos testing as they switched to a cloud based service. From what I can find from the article linked in the chaos testing topic instruction, it seems that they started off with a simple chaos monkey taking systems down. Then, once they saw success in that, it seems they began expanding their chaos testing to more areas, creating what they refer to as "a simian army", programs that conduct chaos testing in various areas. For example, Chaos Gorilla simulates outages in an AWS zone, while Chaos Kong simulates outages in a whole region.

## Principles

## Implementing Chaos Testing

Searching on the internet, I found that Netflix has made their Chaos Monkey software available for public use, hosting it in a public github repository [here](https://github.com/Netflix/chaosmonkey)

## Connection to DevOps
