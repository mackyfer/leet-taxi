UserProfile = new SimpleSchema({
	name: {
			type: String,
			optional: true
	      }
	
});

User = new SimpleSchema({
	username: {
		type: String,
		regEx: /^[a-z0-9A-Z_]{3,15}$/
	},
	emails: {
		type: [Object],
		optional: true
	},
	"emails.$.address": {
		type: String,
		regEx: SimpleSchema.RegEx.Email
	},
	"emails.$.verified": {
		type: Boolean
	},
	createdAt: {
		type: Date
	},
	profile: {
		type: UserProfile,
		optional: true
	},
	services: {
		type: Object,
		optional: true,
		blackbox: true
	},
	roles:{
		type: [String],
		optional: true,
	}
});
Meteor.users.attachSchema(User);


Meteor.users.allow({
	  insert: function () { return true; },
	  update: function () { return true; },
	  remove: function () { return true; }
});