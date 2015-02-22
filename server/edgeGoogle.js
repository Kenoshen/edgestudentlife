module.exports = function (){
	var Client = require('node-rest-client').Client;
	client = new Client();
	// //////////////
	// Auth stuff
	// //////////////
	var fs = require("fs");
	var parseXMLString = require("xml2js").parseString;
	var auth = require('google-auth');
	var googleapis = require("googleapis");
	var oauth = new googleapis.auth.OAuth2(auth.clientId, auth.clientSecret, auth.redirect);
	if (auth.tokens){
		oauth.setCredentials(auth.tokens);
	}
	googleapis.options({auth: oauth});
	// //////////////
	// Private vars
	// //////////////
	var calendar = googleapis.calendar("v3");
	var gmail = googleapis.gmail("v1");
	//
	function theDate(month, year){
		var d = new Date();
		if (month === null || month === undefined){
			month = d.getUTCMonth() + 1;
		}
		if (! year){
			year = d.getUTCFullYear();
		}
		month = parseInt(month, 10);
		year = parseInt(year, 10);
		//
		var originalMonth = month;
		var newMonth = originalMonth % 12;
		newMonth += (newMonth <= 0 ? 12 : 0);
		var addYears = (originalMonth > 0 ? parseInt((originalMonth - 1) / 12) : parseInt(originalMonth / 12) - 1);
		//
		month = newMonth;
		year += addYears;
		return {
			d: d,
			month: month,
			year: year
		};
	};
	function toTimeStr(month, year){
		var originalMonth = month;
		var newMonth = originalMonth % 12;
		newMonth += (newMonth <= 0 ? 12 : 0);
		var addYears = (originalMonth > 0 ? parseInt((originalMonth - 1) / 12) : parseInt(originalMonth / 12) - 1);
		//
		month = newMonth;
		year += addYears;
		return year + "-" + (month < 10 ? "0" : "") + month + "-01T00:00:00-00:00";
	};
	function parseEventFeed(events){
		var newEvents = [];
		if (events){
			for (var i = 0; i < events.length; i++){
				newEvents.push(parseEvent(events[i]));
			}
		}
		return newEvents;
	};
	function parseEvent(event){
		var newEvent = {};
		newEvent.raw = event;
		newEvent.id = event.id; 
		newEvent.link = event.htmlLink;
		newEvent.sequence = event.sequence;
		newEvent.title = event.summary;
		newEvent.published = event.created;
		newEvent.updated = event.updated;
		newEvent.start = event.start.dateTime;
		newEvent.end = event.end.dateTime;
		newEvent.allday = false;
		if (! newEvent.start){
			newEvent.start = event.start.date;
			newEvent.end = event.end.date;
			newEvent.allday = true;
		}
		newEvent.where = event.location;
		newEvent.attendees = event.attendees;
		try{
			var content = JSON.parse(event.description);
			for (var key in content){
				newEvent[key] = content[key];
			}
		} catch (err){
			newEvent.description = event.description;
		}
		return newEvent;
	};
	function parseContactsFeed(contacts){
		var newContacts = [];
		if (contacts){
			for (var i = 0; i < contacts.length; i++){
				newContacts.push(parseContact(contacts[i]));
			}
		}
		return newContacts;
	}
	function parseContact(contact){
		var newContact = {};
		newContact.id = contact.id.$t.split("/base/")[1];
		if (contact.title){
			newContact.name = contact.title.$t;
		}
		if (contact.content){
			newContact.notes = contact.content.$t;
		}
		newContact.emails = [];
		var emails = contact.gd$email;
		if (emails){
			for (var i = 0; i < emails.length; i++){
				var email = emails[i];
				var type = (email.rel ? email.rel.split(auth.contacts.prefix)[1] : "home");
				var address = email.address;
				var primary = email.primary;
				newContact.emails.push({type: type, address: address, primary: primary});
			}
		}
		newContact.phoneNumbers = [];
		var phoneNumbers = contact.gd$phoneNumber;
		if (phoneNumbers){
			for (var i = 0; i < phoneNumbers.length; i++){
				var phoneNumber = phoneNumbers[i];
				var type = phoneNumber.rel.split(auth.contacts.prefix)[1];
				var number = phoneNumber.$t;
				newContact.phoneNumbers.push({type: type, number: number});
			}
		}
		newContact.addresses = [];
		var addresses = contact.gd$postalAddress;
		if (addresses){
			for (var i = 0; i < addresses.length; i++){
				var address = addresses[i];
				var type = address.rel.split(auth.contacts.prefix)[1];
				var addressT = address.$t;
				newContact.addresses.push({type: type, address: addressT});
			}
		}
		return newContact;
	}
	function fillContact(empty, contact){
		contact.id = empty.id.$t.split("/base/")[1]; // passes id to contact
		empty.title.$t = contact.name;
		empty.content = {type: "text", $t: contact.notes};
		empty.gd$email = [];
		if (contact.emails){
			for (var i = 0; i < contact.emails.length; i++){
				empty.gd$email.push({
					rel: auth.contacts.prefix + contact.emails[i].type,
					address: contact.emails[i].address, 
					primary: contact.emails[i].primary
				});
			}
		}
		empty.gd$phoneNumber = [];
		if (contact.phoneNumbers){
			for (var i = 0; i < contact.phoneNumbers.length; i++){
				empty.gd$phoneNumber.push({
					rel: auth.contacts.prefix + contact.phoneNumbers[i].type, 
					$t: contact.phoneNumbers[i].number
				});
			}
		}
		empty.gd$postalAddress = [];
		if (contact.addresses){
			for (var i = 0; i < contact.addresses.length; i++){
				empty.gd$postalAddress.push({
					rel: auth.contacts.prefix + contact.addresses[i].type, 
					$t: contact.addresses[i].address
				});
			}
		}
		empty.gContact$groupMembershipInfo = [{deleted: false, href: auth.contacts.addGroupHref}];
		return empty;
	}
	function parseGroupFeed(groups){
		var newGroups = [];
		if (groups){
			for (var i = 0; i < groups.length; i++){
				newGroups.push(parseGroup(groups[i]));
			}
		}
		return newGroups;
	}
	function parseGroup(group){
		var newGroup = {};
		newGroup.id = group.id.$t.split("/base/")[1];
		newGroup.name = group.title.$t;
		return newGroup;
	}
	function handleGoogleResponse(err, resp, fail, success){
		if (err){
			try{
				console.log("Error: %s", JSON.stringify(err, undefined, 4));
			}catch(e){
				console.log("Error: %s", err);
			}
			fail({error: err});
		}else{
			success(resp);
		}
	}
	function handleRestResponse(data, response, fail, success){
		try{
			data = JSON.parse(data);
		} catch(err){
			data = {error: "Parse exception", raw: data};
		}
		if (data.error){
			console.log("Error: %s", data.error);
			fail(data);
		} else {
			success(data);
		}
	}
	//
	var api = {
		authenticate: function(res){
			var authUrl = oauth.generateAuthUrl({
				access_type: "offline",
				hint: auth.email,
				scope: [auth.calendar.scope, auth.contacts.scope, auth.email.scope],
				state: "secretpasswordkeythingthatnoonecouldpossiblyguess"
			});
			res.redirect(authUrl);
		},
		getToken: function(code, callback){
			oauth.getToken(code, function(err, tokens){
				if (err){
					console.log("Auth Error: " + err);
					callback(false);
				} else{
					auth.tokens = tokens;
					oauth.setCredentials(auth.tokens);
					fs.writeFile("server/auth/google-auth.js", "module.exports = " + JSON.stringify(auth, undefined, 4), function(err){
						if (err){
							console.log("File Save Error: " + err);
						}else {
							console.log("Auth file updated");
						}
					});
					callback(true);
				}
			});
		},
		getEvents: function(month, year, callback){ 
			var d = theDate(month, year);
			var args = {
				calendarId: auth.calendar.id,
				sortOrder: "ascending",
				timeMin: toTimeStr(d.month, d.year),
				timeMax: toTimeStr(d.month + 1, d.year),
				orderBy: "startTime",
				singleEvents: true
			};
			calendar.events.list(args, function(err, resp){
				handleGoogleResponse(err, resp, callback, function(resp){
					var body = {events:[], query:{month: d.month, year: d.year}};
					if (resp && resp.items){
						body.events = parseEventFeed(resp.items);
					}
					callback(body);
				});
			});
		},
		getEventUpdateFeed: function(maxResults, callback){ 
			var d = theDate(null, null);
			var args = {
				calendarId: auth.calendar.id,
				sortOrder: "descending",
				timeMin: toTimeStr(d.month, d.year),
				timeMax: toTimeStr(d.month + 1, d.year + 1),
				orderBy: "updated",
				singleEvents: true,
				maxResults: (maxResults ? maxResults : 10)
			};
			calendar.events.list(args, function(err, resp){
				handleGoogleResponse(err, resp, callback, function(resp){
					var body = {events:[], query:{month: d.month, year: d.year}};
					if (resp && resp.items){
						body.events = parseEventFeed(resp.items);
					}
					callback(body);
				});
			});
		},
		getEventById: function(id, callback){
			var args = {
				calendarId: auth.calendar.id,
				eventId: id
			};
			calendar.events.get(args, function(err, resp){
				handleGoogleResponse(err, resp, callback, function(resp){
					var body = {event:{}, query:{id: id}};
					if (resp){
						body.event = parseEvent(resp);
					}
					callback(body);
				});
			});
		},
		updateEvent: function(id, update, callback){
			var description = {
				description: update.description,
				price: update.price,
				regcode: update.regcode,
				releaseforms: update.releaseforms
			};
			//
			var args = {
				calendarId: auth.calendar.id,
				eventId: id
			};
			calendar.events.get(args, function(err, resp){
				handleGoogleResponse(err, resp, callback, function(resp){
					resp.description = JSON.stringify(description, undefined, 4);
					resp.attendees = update.attendees;
					args.resource = resp;
					calendar.events.update(args, function(err, resp){
						handleGoogleResponse(err, resp, callback, function(resp){
							var body = {event:{}, query:{id: id}};
							if (resp){
								body.event = parseEvent(resp);
							}
							callback(body);
						});
					});
				});
			});
		},
		addAttendee: function(id, attendee, callback){
			var args = {
				calendarId: auth.calendar.id,
				eventId: id
			};
			calendar.events.get(args, function(err, resp){
				handleGoogleResponse(err, resp, callback, function(resp){
					if (resp.attendees){
						resp.attendees.push(attendee);
					} else {
						resp.attendees = [attendee];
					}
					args.resource = resp;
					calendar.events.update(args, function(err, resp){
						handleGoogleResponse(err, resp, callback, function(resp){
							var body = {event:{}, query:{id: id, attendee: attendee}};
							if (resp){
								body.event = parseEvent(resp);
							}
							callback(body);
						});
					});
				});
			});
		},
		getContacts: function(callback){
			var args = {
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + auth.tokens.access_token,
				},
				parameters: {
					alt: "json"
				}
			};
			client.get(auth.contacts.full, args, function(data, response){
				handleRestResponse(data, response, callback, function(data){
					var body = {contacts:{}, query:{}};
					body.contacts = parseContactsFeed(data.feed.entry);
					callback(body);
				});
			});
		},
		getContactById: function(id, callback){
			var args = {
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + auth.tokens.access_token,
				},
				parameters: {
					alt: "json"
				}
			};
			client.get(auth.contacts.full + "/" + id, args, function(data, response){
				handleRestResponse(data, response, callback, function(data){
					var body = {contact:{}, query:{id: id}};
					body.contact = parseContact(data.entry);
					callback(body);
				});
			});
		},
		addContact: function(contact, callback){
			var args = {
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + auth.tokens.access_token,
					"If-Match": "*"
				},
				parameters: {
					alt: "json"
				},
				data: {}
			};
			client.post(auth.contacts.full, args, function(data, response){
				handleRestResponse(data, response, callback, function(data){
					fillContact(data.entry, contact);
					args.data = data;
					client.put(auth.contacts.full + "/" + contact.id, args, function(data, response){
						handleRestResponse(data, response, callback, function(data){
							var body = {contact:{}, query:{}};
							body.contact = parseContact(data.entry);
							body.data = data;
							callback(body);
						});
					});
				});
			});
		},
		updateContact: function(id, contact, callback){
			var args = {
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + auth.tokens.access_token
				},
				parameters: {
					alt: "json"
				}
			};
			client.get(auth.contacts.full + "/" + id, args, function(data, response){
				handleRestResponse(data, response, callback, function(data){
					fillContact(data.entry, contact);
					args.data = data;
					args.headers["If-Match"] = "*";
					client.put(auth.contacts.full + "/" + id, args, function(data, response){
						handleRestResponse(data, response, callback, function(data){
							var body = {contact:{}, id: id};
							body.contact = parseContact(data.entry);
							body.data = data;
							callback(body);
						});
					});
				});
			});
		},
		getGroups: function(callback){
			var args = {
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + auth.tokens.access_token,
				},
				parameters: {
					alt: "json"
				}
			};
			client.get(auth.contacts.groups, args, function(data, response){
				handleRestResponse(data, response, callback, function(data){
					var body = {groups:{}, query:{}};
					body.groups = parseGroupFeed(data.feed.entry);
					callback(body);
				});
			});
		},
		getGroupById: function(id, callback){
			var args = {
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + auth.tokens.access_token,
				},
				parameters: {
					alt: "json"
				}
			};
			client.get(auth.contacts.groups + "/" + id, args, function(data, response){
				handleRestResponse(data, response, callback, function(data){
					var body = {group:{}, query:{id: id}};
					body.group = parseGroup(data.entry);
					callback(body);
				});
			});
		},
		sendEmail: function(message, callback){
			var email = [];
			email.push("Sender: " + "edgestudentlife.com");
			email.push("From: \"" + message.name + " via EDGE\" <" + "edgestudentlife1@gmail.com" + ">");
			email.push("Reply-To: \"" + message.name + "\" <" + message.email + ">");
			email.push("replyto: \"" + message.name + "\" <" + message.email + ">");
			email.push("To: \"Chris Phelps\" <" + auth.username + "@gmail.com>");
			email.push("Content-Type: text/html;charset=iso8859-1");
			email.push("MIME-Version: 1.0");
			email.push("Subject: " + (message.subject ? message.subject + " --> " : "") + "Email from '" + message.name + "' <" + message.email + ">");
			email.push("");
			email.push("<a href='mailto:" + message.email + "'>Reply to this message</a><br />");
			email.push("<a href='tel://" + message.phone + "'>Or Call " + message.name + " at " + message.phone + "</a><br /><br />");
			email.push("");
			email.push(message.body);
			email.push("");
			email = email.join("\r\n").trim();
			var base64EncodedEmail = new Buffer(email).toString("base64").replace(/\//g,'_').replace(/\+/g,'-');
			gmail.users.messages.send({
				userId: "me",
				resource:{
					raw: base64EncodedEmail
				}
			}, function(err, results){
				handleGoogleResponse(err, results, callback, function(data){
					callback({message: message});
				});
			});
		},
		getMapSource: function(where, callback){
			callback({src: auth.map.url + "?key=" + auth.apiKey + "&q=" + where, where: where});
		}
	};
	return function(req, res, next){
		var method = req.method;
		var path = req.path;
		if (method === "GET"){
			if (path.search("^/$") >= 0){
				if (req.query.key === "secretpasswordkeythingthatnoonecouldpossiblyguess"){
					api.authenticate(res);
				} else {
					res.send("Missing key");
				}
			} else if (path.search("^/redirect$") >= 0){
				if (req.query.code && req.query.state === "secretpasswordkeythingthatnoonecouldpossiblyguess"){
					api.getToken(req.query.code, function(success){
						if (success){
							res.send("Google account is authorized");
						}else{
							res.send("Google account failed to authorize");
						}
					});
				} else {
					res.send("Not Authorized");
				}
			} else if (path.search("^/newsfeed$") >= 0){
				console.log("get newsfeed");
				var size = null;
				if (req.query.size){
					size = parseInt(req.query.size, 10);
				}
				api.getEventUpdateFeed(size, function(data){
					res.send(data);
				});
			} else if (path.search("^/events$") >= 0){
				console.log("get events");
				var month = null;
				if (req.query.month){
					month = parseInt(req.query.month, 10);
				}
				var year = null;
				if (req.query.year){
					year = parseInt(req.query.year, 10);
				}
				api.getEvents(month, year, function(data){
					res.send(data);
				});
			} else if (path.search("^/events/[^/\\\\]+$") >= 0){
				console.log("get event");
				api.getEventById(req.path.split("/events/")[1], function(data){
					res.send(data);
				});
			} else if (path.search("^/contacts$") >= 0){
				console.log("get contacts");
				api.getContacts(function(data){
					res.send(data);
				});
			} else if (path.search("^/contacts/[^/\\\\]+$") >= 0){
				console.log("get contact");
				api.getContactById(req.path.split("/contacts/")[1], function(data){
					res.send(data);
				});
			} else if (path.search("^/groups$") >= 0){
				console.log("get groups");
				api.getGroups(function(data){
					res.send(data);
				});
			} else if (path.search("^/groups/[^/\\\\]+$") >= 0){
				console.log("get group");
				api.getGroupById(req.path.split("/groups/")[1], function(data){
					res.send(data);
				});
			} else if (path.search("^/map$") >= 0){
				console.log("get map source");
				api.getMapSource(req.query.where, function(data){
					res.send(data);
				});
			} else {
				next();
			}
		} else if (method === "POST"){
			if (path.search("^/contacts$") >= 0){
				console.log("add contact");
				api.addContact(req.body, function(data){
					res.send(data);
				});
			} else if (path.search("^/email$") >= 0){
				console.log("send email");
				api.sendEmail(req.body, function(data){
					res.send(data);
				});
			} else {
				next();
			}
		} else if (method === "PUT"){
			if (path.search("^/events/[^/\\\\]+$") >= 0){
				console.log("update event");
				google.updateEvent(req.path.split("/events/")[1], req.body, function(data){
					res.send(data);
				});
			} else if (path.search("^/events/[^/\\\\]+/attendees$") >= 0){
				console.log("add attendee");
				google.addAttendee(req.path.split("/events/")[1].split("/attendees")[0], req.body, function(data){
					res.send(data);
				});
			} else if (path.search("^/contacts/[^/\\\\]+$") >= 0){
				console.log("update contact");
				google.updateContact(req.path.split("/contacts/")[1], req.body, function(data){
					res.send(data);
				});
			} else {
				next();
			}
		} else {
			next();
		}
	};
};