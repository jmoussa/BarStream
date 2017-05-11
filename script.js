$(document).ready(function(){
    
    
//GOOGLE MAPS
    var loc = {lat:4, lng:4};
    var map;
    var pos;
    var infowindow= new google.maps.InfoWindow();
    function initMap() {
        $("#loader").modal('show');
        
        var location = {lat:0, lng:0};
        
        map = new google.maps.Map(document.getElementById('map'), {
          center: location,
          zoom: 12
        });
        
//USER LOCATION    
        navigator.geolocation.getCurrentPosition(function(position) {
            location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            map.setCenter(location);
            if(loc.lat != 4){    
                pos = new google.maps.LatLng(loc);
                var marker = new google.maps.Marker({   //Can replace with infowindow.setPosition/content above
                    map: map,
                    opacity: 1.0,
                    animation: google.maps.Animation.DROP,
                    position: pos,
                    draggable: true,
                    label: 'YOU',
                    center: pos
                });
                google.maps.event.addListener(marker,'dragend', function(evt) {
                    loc.lat = this.getPosition().lat();
                    loc.lng = this.getPosition().lng();
                    initMap();
                });
                
                var service = new google.maps.places.PlacesService(map);
                   
                service.textSearch({
                  location: pos,
                  radius: 7000,
                  rankBy: google.maps.places.RankByDISTANCE,
                  query: ['bars']
                }, callback);
            }else{
                pos = new google.maps.LatLng(location);
                var marker = new google.maps.Marker({   //Can replace with infowindow.setPosition/content above
                    map: map,
                    opacity: 1.0,
                    animation: google.maps.Animation.DROP,
                    position: pos,
                    draggable: true,
                    label: 'YOU',
                    center: pos
                });
                google.maps.event.addListener(marker,'dragend', function(evt) {
                    loc.lat = this.getPosition().lat();
                    loc.lng = this.getPosition().lng();
                    initMap();
                });
                
                var service = new google.maps.places.PlacesService(map);
                   
                service.textSearch({
                  location: pos,
                  radius: 7000,
                  rankBy: google.maps.places.RankByDISTANCE,
                  query: ['bars']
                }, callback);
            }
 
        }, function() {
            handleLocationError(true, infowindow, map.getCenter());
        });
        
        
//LAST.FM
        $.ajax({
                async:false,
                url: 'https://ws.audioscrobbler.com/2.0/',
                type: 'GET',
                dataType: 'JSON',
                data:{
                    method:'geo.gettoptracks',
                    country:'united states',
                    api_key:'YOUR_API_KEY',
                    format: 'json',
                },
                
                success: function(serverResponse) {
                    console.log(serverResponse.tracks.track[1].image[2]['#text']);
                    var html='<ul class="list-group">';
                    for(var i=0;i<serverResponse.tracks.track.length;i++){
                        html+= "<li class='list-group-item'>";
                        html+= "<div style='height:300px; width:90%;'>"; 
                        html+= "<h3><strong>"+(i+1)+"</strong></h3>"+"<div style='text-align:center;'>"+"<img src='"+serverResponse.tracks.track[i].image[2]['#text']+"'><br>" + "<strong><h3>" + serverResponse.tracks.track[i].name +"</h3>"+ serverResponse.tracks.track[i].artist.name+ "</strong><br>";
                        html+= "<span class='body'>"+"<a href='"+serverResponse.tracks.track[i].url+"'>LISTEN"+ "</a>&nbsp;</span>";
                        html+= '<span class="badge">Listeners &nbsp;' + serverResponse.tracks.track[i].listeners +'</span>';
                        html+= '</div>';
                        html+= '</div>';
                        html+= "</li>";
                    }
                    html += '</ul>';
                    $(".tracks").append(html);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('error');
                    console.log(errorThrown);
                    console.log(jqXHR);
                },
                complete: function() {
                    console.log('Last.fm Complete');
                }
            });
        
    }
    initMap();

    function callback(results, status) {
        console.log("Callback Recieved");
        $(".panel").remove();
        $(".panel-heading").remove();
        $(".panel-title").remove();
        $(".panel-title > a").remove();
        $(".panel-collapse").remove();
        $(".panel").remove();
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
            var id = results[i].place_id;
            var myHTML="";
            console.log(results[i].place_id+'\n'+results[i].name+'\n Place #'+i);
            myHTML += "<div class='panel panel-default'>";
            myHTML += "<div class='panel-heading'>";
            myHTML += "<h4 class='panel-title'><a data-toggle='collapse' data-parent='#accordion' href='#"+results[i].place_id+"'>"+results[i].name +"</a></h4></div>";
            myHTML += '<div id="'+results[i].place_id+'" class="panel-collapse collapse out '+results[i].place_id+'"><div class="panel-body" style="background-color:rgb(217,215,217);">';
            myHTML += '</div></div></div>';
            $("#accordion").append(myHTML);
            
            var lat = results[i].geometry.location.lat();
            var lng = results[i].geometry.location.lng();
            var geo = ""+lat+","+lng; //location of bar
            console.log(results[i].name + " at " + geo);
            
//TWITTER
            $.ajax({
                async: false,
            	url: 'simple_twitter.php',
            	type: 'GET',
                dataType: 'JSON',
                data: {
                    q: results[i].name,
                    count: 100,
                    result_type: "recent",
                    geocode: geo+",12mi"
                },
                success: function(serverResponse) {
                    console.log(serverResponse);
                    var innerHTML = "<ul class='list-group'>";
                    
                    for(var i=0; i<serverResponse.statuses.length; i++){
                        innerHTML+= "<li class='list-group-item'>";
                        innerHTML+="<div style='height:100%; width:100%;'>"; 
                        innerHTML+= '<img src=' + serverResponse.statuses[i].user.profile_image_url + '>' + "<strong>&nbsp;" + serverResponse.statuses[i].user.screen_name + "</strong><br>" + "</span>";
                        innerHTML+= "<span class='body'>"+ serverResponse.statuses[i].text +"&nbsp;</span>";
                        innerHTML+='<span class="badge">Favs ' + serverResponse.statuses[i].favorite_count +'</span>';
                        innerHTML+='<span class="badge">RT ' + serverResponse.statuses[i].retweet_count +'</span>';
                        innerHTML+='</div>';
                        innerHTML+= "</li>";
                    }
                    innerHTML += "</ul>";
                    if(serverResponse.statuses.length != 0){
                        $("#"+id+" div").append(innerHTML);
                    }else{
                        innerHTML = "<span>Not much going on around here...</span>";
                        $("#"+id+" div").append(innerHTML);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('error');
                    console.log(errorThrown);
                    console.log(jqXHR);
                },
                complete: function() {
                    console.log('Twitter Complete');
                }
                
            });
          }
          $("#loader").modal('hide');
        }else{
            console.log(status);
        }
        
    }
    function createMarker(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.setContent(place.name);
          infowindow.open(map, this);
          $("."+place.placeId).toggleClass("panel-collapse collapse in");
        });
    }
    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
    }
    
    
});
