'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
controller('MyCtrl1', [
	function() {

	}
])
	.controller('MyCtrl2', [
	function() {

	}
]);

function addPlaceCtrl($scope) {

}


function MapHomeCtrl($scope, $http) {

	$scope.types = ['Abandoned Bicycle', 'Abandoned Shopping Cart', 'Dead Animal Removal', 'Flooding in Street', 'Flooding On Property', 'Graffiti Removal', 'Illegal Dumping/Trash', 'Illegal Dumping/Trash', 'Illegal Sign', 'Leaf Collection', 'Plants/Trees Danger', 'Plants/Trees Overgrown', 'Pothole', 'Roadway Cleaning', 'Roadway Danger', 'Sidewalk Broken/Cracking', 'Sidewalk Cleaning', 'Sidewalk Danger', 'Street Light', 'Street Sign', 'Trash Can/Bin Broken', 'Trash Removal', 'Water Leak (Fire Hydrant)', 'Water Leak (Sprinkler/Irrigation', 'Other']
	$scope.radius = [.25, .5, 1, 2]
	$scope.problem = {}
	$scope.center = {}
	$scope.geocodedAddress = {}

	$scope.pop1Open = false;
	$scope.pop2Open = false;
	$scope.pop3Open = false;
	$scope.pop4Open = false;
	$scope.imagePop = false;

	$scope.aboutPop = false;

	$scope.openAbout = function(){
		$scope.aboutPop = true;
	}

	$scope.closeAbout = function(){
		$scope.aboutPop = false;
	}

	$scope.openImage = function() {
		$scope.imagePop = true;
		var imageUrl = "https://beta.dgpstest.com/arcgis/rest/services/MSI_Samples/Analysis_SanDiego_CA/ImageServer/exportImage?bbox="
		var mapBounds = map.getBounds()
		console.log(mapBounds)
		imageUrl += encodeURIComponent(mapBounds._southWest.lng +"," +mapBounds._southWest.lat + "," +  mapBounds._northEast.lng + "," + mapBounds._northEast.lat)
		imageUrl += '&bboxSR=4326&&size=&imageSR=&time=&format=jpg&pixelType=U8&noData=&noDataInterpretation=esriNoDataMatchAny&interpolation=+RSP_BilinearInterpolation&compression=&compressionQuality=&bandIds=&mosaicRule=&renderingRule=&f=image'
		$scope.imageUrl =imageUrl
	}

	$scope.closeImage = function() {
		$scope.imagePop = false;
	}

	$scope.opts = {
		backdropFade: true,
		dialogFade: true
	};

	var featureServiceUrl = 'http://services1.arcgis.com/4wtX5xKqGfqRRwyy/arcgis/rest/services/SD311Data/FeatureServer/0'
	var notifyServiceUrl = 'http://services.arcgis.com/nILn1H1Ns97PmrRf/ArcGIS/rest/services/Notifiers_WGS84/FeatureServer/0'
	// var client = new Geoservices();
	var ArcGISGeoServices = new Geoservices.Geoservices({});

	var featureService = new ArcGISGeoServices.FeatureService({
		url: featureServiceUrl
	}, function(err, results) {})

	var notifyService = new ArcGISGeoServices.FeatureService({
		url: notifyServiceUrl
	}, function(err, results) {})

	$scope.openPop1 = function() {
		$scope.pop1Open = true;
	};

	$scope.closePop1 = function() {
		$scope.pop1Open = false;
		map.addEventListener('click', function(e) {
			// addLatlng = [e.latlng.lat, e.latlng.lng]
			console.log(e.latlng)
			$scope.$apply(function() {
				$scope.center = {
					lat: e.latlng.lat,
					lng: e.latlng.lng
				}
				$scope.openPop2();
			});
		})
	};

	$scope.openPop2 = function() {
		$scope.pop2Open = true;
	};

	$scope.closePop2 = function() {
		$scope.pop2Open = false;
		map.removeEventListener('click')

	};

	$scope.openPop3 = function() {
		$scope.pop3Open = true;
	}

	$scope.closePop3 = function() {
		map.addEventListener('click', function(e) {
			// addLatlng = [e.latlng.lat, e.latlng.lng]
			console.log(e.latlng)
			$scope.$apply(function() {
				$scope.center = {
					lat: e.latlng.lat,
					lng: e.latlng.lng
				}
				$scope.openPop4();
			});
		})
	}

	$scope.openPop4 = function() {
		$scope.pop4Open = true;
	}

	$scope.closePop4 = function() {
		$http.get('/api/addNotify', {
			params: {
				lat: $scope.center.lat,
				lng: $scope.center.lng,
				email: $scope.noteEmail,
				radius: $scope.noteRadius,
				phone: $scope.notePhone
			}
		}).success(function(data, status) {
			var notify =
				[{
					"geometry": data,
					"attributes": {
						"Email": $scope.noteEmail,
						"PHONE": $scope.notePhone

					}
				}
			]
			notifyService.add({
				features: JSON.stringify(notify)
			}, function(err, results) {
				if (err) {
					console.log(err)
				}

			})
		})

		$scope.pop4Open = false;
		map.removeEventListener('click')

	}

	function createPopup(geojson, layer) {


		// console.log(geojson)
		if (geojson.properties) {
			var popupText = "<div style='overflow:scroll; max-width:250px; max-height:200px;'>";
			popupText += "<h4>" + geojson.properties.Type + "</h4>";
			popupText += "<p>" + geojson.properties.Description + "</p>";
			if (geojson.properties.ReportedBy) {
				popupText += "<p>" + geojson.properties.ReportedBy + "</p>";
			}
			popupText += "</div>";
			layer.bindPopup(popupText);
		}
	}

	var features = L.esri.featureLayer(featureServiceUrl, {
		onEachFeature: function(geojson, layer) {
			createPopup(geojson, layer);
		}
	}).addTo(map);

	$scope.addIssue = function() {
		var params =
			[{
				"geometry": {
					"x": $scope.center.lng,
					"y": $scope.center.lat
				},
				"attributes": {
					"Type": $scope.issueType,
					"Description": $scope.description,
					"ReportedBy": $scope.name,
					"ReportDate": new Date().toISOString(),
					"ReportEmail": $scope.email
				}
			}
		]
		featureService.add({
			features: JSON.stringify(params)
		}, function(err, results) {
			if (err) {
				console.log(err)
			}

			$http.get('/api/addPoint', {
				params: {
					lat: $scope.center.lat,
					lng: $scope.center.lng,
					issue: $scope.issueType
				}
			}).success(function(data, status) {
				console.log(data, status)
			})
			$scope.pop2Open = false;
			map.removeEventListener('click')
		})
	}


	$scope.mapWidth = function() {
		return $(window).width();
	}

	$scope.pageHeight = function() {
		return $(window).height() - 0;
	}
};


MapHomeCtrl.$inject = ['$scope', '$http'];