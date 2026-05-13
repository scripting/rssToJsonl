const fs = require ("fs");
const utils = require ("daveutils");
const s3 = require ("daves3");
const feedlandSocket = require ("feedlandsocket");

var config = {
	urlFeedlandSocket: "wss://feedland.social/",
	dataFolder: "data/",
	maxLinesPerJsonlFile: 50, //5/13/26 by DW
	sets: {
		dave: { //5/13/26 by DW
			enabled: true,
			jsonlFilename: "scripting.jsonl", 
			jsonlPath: "/scripting.com/code/rsstojsonl/data/scripting.jsonl",
			jsonlUrl: "https://jsonldemo.feedland.org/scripting.jsonl",
			feedList: [
				"http://scripting.com/rss.xml",
				]
			},
		starter: { 
			enabled: true, //5/13/26 by DW
			jsonlFilename: "items.jsonl",
			jsonlPath: "/scripting.com/code/rsstojsonl/data/items.jsonl",
			jsonlUrl: "https://jsonldemo.feedland.org/items.jsonl",
			feedList: [
				"https://scripting4.wordpress.com/feed/",
				"https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml",
				"https://www.pbs.org/newshour/feeds/rss/politics",
				"https://sports.yahoo.com/nba/rss/",
				"http://oaklandside.org/feed/",
				"https://www.theguardian.com/rss",
				"http://www.theguardian.com/uk-news/rss",
				"http://scripting.com/rss.xml",
				],
			}
		}
	};

function nowstring () {
	return (new Date ().toLocaleTimeString ());
	}
function itemToJson (theItem) {
	var briefObject = new Object ();
	function copyProp (name) {
		if (theItem [name] !== undefined) {
			briefObject [name] = theItem [name];
			}
		}
	copyProp ("id");
	copyProp ("feedUrl");
	copyProp ("title");
	copyProp ("pubDate");
	copyProp ("whenReceived");
	return (utils.jsonStringify (briefObject));
	}
function trimJsonl (jsonltext, maxLines) {
	var lines = jsonltext.split ("\n"), ctlines = lines.length;
	if (ctlines > 0) {
		if (lines [ctlines - 1] === "") { //there's a blank line at the end, remove it
			lines.pop ();
			ctlines = lines.length; //it changed
			}
		}
	if (ctlines > maxLines) {
		lines = lines.slice (ctlines - maxLines);
		}
	return lines.join ("\n") + "\n";
	}
function addToJsonL (theItem, theSet) {
	const f = config.dataFolder + theSet.jsonlFilename;
	utils.sureFilePath (f, function () {
		const jsontext = JSON.stringify (theItem) + "\n";
		fs.appendFile (f, jsontext, function (err) {
			if (err) {
				console.log ("addToJsonL: err.message == " + err.message);
				}
			else {
				fs.readFile (f, "utf8", function (err, jsonltext) {
					if (err) {
						console.log ("addToJsonL: err.message == " + err.message);
						}
					else {
						jsonltext = trimJsonl (jsonltext, config.maxLinesPerJsonlFile); //keep it to x lines
						s3.newObject (theSet.jsonlPath, jsonltext, "application/jsonl", "public-read", function (err, data) {
							if (err) {
								console.log ("addToJsonL: err.message == " + err.message);
								}
							else {
								console.log ("\n" + nowstring () + ": publishing to == " + theSet.jsonlUrl + ", item == " + itemToJson (theItem));
								}
							});
						}
					});
				}
			});
		});
	}
function processUrlsWeFind (feedUrl, caller) {
	for (var x in config.sets) {
		const theSet = config.sets [x];
		if (utils.getBoolean (theSet.enabled)) { //5/13/26 by DW
			theSet.feedList.forEach (function (item) {
				if (item == feedUrl) {
					caller (theSet);
					}
				});
			}
		}
	}

function handleMessage (theCommand, thePayload) {
	function handleNewItem (theItem, theFeed) {
		function publishOneSet (theSet) {
			const theJsonlItem = {
				title: theItem.title,
				link: theItem.link,
				description: theItem.description,
				guid: theItem.guid,
				pubDate: theItem.pubDate,
				whenReceived: theItem.whenReceived,
				whenUpdated: theItem.whenUpdated,
				enclosure: theItem.enclosure,
				metadata: theItem.metadata,
				feedTitle: theFeed.title,
				feedLink: theFeed.link,
				feedDescription: theFeed.description,
				feedUrl: theFeed.feedUrl,
				};
			addToJsonL (theJsonlItem, theSet);
			}
		processUrlsWeFind (theFeed.feedUrl, publishOneSet);
		}
	function handleUpdatedItem (theItem) {
		console.log ("\n" + nowstring () + ": updated item == " + itemToJson (theItem));
		}
	switch (theCommand) {
		case "newItem": 
			handleNewItem (thePayload.item, thePayload.theFeed);
			break;
		}
	}

utils.readConfig ("config.json", config, function () {
	console.log ("\nconfig == " + utils.jsonStringify (config) + "\n");
	const options = {
		urlFeedlandSocket: config.urlFeedlandSocket,
		handleMessage
		};
	feedlandSocket.connect (options);
	});

