# RSS to JSONL

This readme was written by Claude Code, reviewed by Dave Winer. Dave wrote the software.

Watch for new items from a set of feeds.

Add each item to the end of a JSONL file on a static server.

A live example is the JSONL feed for scripting.com: [scripting.jsonl](https://jsonldemo.feedland.org/scripting.jsonl).

If you have a JSONL client, you can test. Does this make you think of applications? Any way we can help, we have lots of feed resources here. Use the Issues section here to share.

Here's a [blog post](http://scripting.com/2026/05/12.html#a130150) about it.

### Why JSONL

JSONL is the standard "stream of records" format across the AI and ML toolchain. One JSON object per line, append-only, trivially streamable. The AI side already speaks it natively.

A few places JSONL is the default input:

OpenAI and Anthropic fine-tuning APIs.

OpenAI Batch API and Anthropic Message Batches API.

HuggingFace datasets.

Pandas, DuckDB, Polars, Spark.

LangChain and LlamaIndex document loaders.

So an RSS-to-JSONL feed plugs into any of these with no adapter code. RSS items flow into the AI world as a native format. That's the interop story.

### Install and run

`npm install` to pull dependencies.

`node rsstojsonl.js` to start.

### Configuration

Defaults live in `rsstojsonl.js`. Create a `config.json` next to it to override any of the keys. Only the keys you list are overwritten.

Main keys:

`urlFeedlandSocket`: the FeedLand server to subscribe to.

`dataFolder`: local folder where the JSONL files are appended.

`maxLinesPerJsonlFile`: most recent N lines kept in each file.

`sets`: one entry per output file. Each set has `enabled`, `jsonlFilename`, `jsonlPath`, `jsonlUrl`, and a `feedList` of source feed URLs.

### S3

The app uploads each updated JSONL file to S3 via `daves3`. You'll need AWS credentials configured the way `daves3` expects them. Without that, the upload step fails on every new item.

