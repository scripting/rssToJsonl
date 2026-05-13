#### 5/13/26; 9:17:35 AM by DW

Gets its own project file --- rssToJsonl.

Changed from random feeds to my feeds, starting with Scripting News. 

Added an enabled boolean to a set. If you turn it off we won't look at that set. 

Added a max number of items in the JSONL file, config.maxLinesPerJsonlFile.

#### 5/11/26; 7:50:45 PM by DW

Started over. I just want to generate a JSONL feed from a set of RSS feeds.

We assume all the feeds are subscribed to in the FeedLand we're talking to.

We listen through the FeedlandSocket interface, and flow out all news from the feeds via JSONL.

