var mongoose = require("mongoose");

var uristring = process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'mongodb://localhost/atlmaps';
var mongoOptions = {
	db: {
		safe: true
	}
};

var db = mongoose.connect(uristring, mongoOptions, function(err, res) {
	// if (err) {
	// console.log('ERROR connecting to: ' + uristring + '. ' + err);
	// } else {
	// console.log('Succeeded connected to: ' + uristring);
	// }
});

var Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var geo = new Schema({
	loc: {
		type: [Number],
		index: '2dsphere'
	}
})

var placeSchema = new Schema({
	type : {
		type : String,
	},
	dateCreated : {
		type : Date,
	},
	dateModified : {
		type : Date,
	},
	status : {
		type : Boolean,
	},
	picture : {
		type : String,
	},
	loc: {
		type: [Number],
		index: '2dsphere'
	},
	comments : [],
	support : []
})

exports.Place = mongoose.model('places', placeSchema);

