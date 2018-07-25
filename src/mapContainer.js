import React, { Component } from 'react';
import Sidebar from './Sidebar'
import escapeRegExp from 'escape-string-regexp';
import sortBy from 'sort-by'
import { Locations } from './Places.js'

class Map extends Component{
constructor(props){
    super(props);
this.state = {
    map: {},
    infoWindow: {},
    markers: [],
    query:'',
    tips:[],
    places: Locations
}
this.initMap = this.initMap.bind(this);
this.addMarker = this.addMarker.bind(this);

}
componentDidMount(){
    window.initMap = this.initMap;

    loadJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyD3CUp0hxnPlJ3Ig0vpm2klPIuOWJjCdcc&callback=initMap')
}
    componentWillMount(){
        const {tips} = this.state
        this.state.places.forEach(place => {
            const params = {'venue_id': place.venue_id};
            //fetch data from foursquare, more on https://github.com/foursquare/react-foursquare
            foursquare.venues.getVenueTips(params)
            .then((response) => {
                let tip
                // handle Errors
                if (response.meta.code === 200) {
                    tip = {text: response.response.tips.items[0].text, name: place.name, position: place.position}
                } else {
                    tip = {text:"Sorry Couldn't retrieve data from Foursquare", name: place.name, position: place.position}
                }
                tips.push(tip)
                this.setState(tips)
                this.addMarker(this.state.map, tip)
            })
        })
    }

    componentDidUpdate(){
        //add bounds
        const {markers,map} = this.state
        let bounds = new window.google.maps.LatLngBounds();

        markers.forEach((m)=>
        bounds.extend(m.position))
        map.fitBounds(bounds)
    }

    initMap() {
        //Check if Google props has data and Map is loaded
            const map = new window.google.maps.Map(document.getElementById('map'), {
                center: {lat: 43.4485, lng: -80.5339},
                zoom: 13,
            });

            const infoWindow = new window.google.maps.InfoWindow({
                content: 'content'
            });
            this.setState({map, infoWindow});
        
    }

    updateQuery = (query) => {
        this.setState({query: query})
        const {markers} = this.state
        //filter markers
        markers.forEach((marker) => {
            if (marker.title.toLowerCase().indexOf(query.toLowerCase()) >= 0){
                marker.setVisible(true);
            } else {
                marker.setVisible(false);
            }
        });
        
        this.setState({markers});
    };

    addMarker = (map, place) => {
        const {markers} = this.state
        //add marker
        const marker = new window.google.maps.Marker({
            position: {lat: place.position.lat, lng: place.position.lng},
            map,
            text: place.text,
            title: place.name,
            animation: window.google.maps.Animation.DROP,
        });
        //open infoWIndow content on marker click
        marker.addListener('click', () => {
            this.state.map.panTo(marker.getPosition());
            this.state.infoWindow.setContent(`
            <div class="infoWindow">
                <div name=${marker.title}>
                    <h3>${marker.title}</h3>
                    <p>${marker.text}</p>  
                    <p>Tips provided by <a href="https://foursquare.com/">Foursquare</a></p>
                </div>
                </div>`);
            this.state.infoWindow.open(map, marker)
        });
        //animation marker bounce on mouseover
        marker.addListener('mouseover', function() {
            this.setAnimation(window.google.maps.Animation.BOUNCE);
            setTimeout(() => this.setAnimation(null), 400)
        });
        markers.push(marker)
        this.setState({markers})
    }


    render() {
        const {query} = this.state;
        const {markers} = this.state
        //get the filter query to filter the listitems 
        let filteredLocations
        if (query){
          const match = new RegExp(escapeRegExp(query),'i')
          filteredLocations = markers.filter((marker)=> match.test(marker.title))
        }
        else{
          filteredLocations=markers
        }
        filteredLocations.sort(sortBy('title'))
        const style = {
            width: '100vw',
            height: '100vh'
        }
        return (
            <div>
            <Sidebar 
                updateQuery={this.updateQuery} 
                query={this.state.query}
                map={this.state.map} 
                filteredLocations={filteredLocations}
                marker={this.state.markers}
                infoWindow={this.state.infoWindow}
                openCloseMenu={this.props.openCloseMenu}
            />
            <div className="map-container">
            <div className="container" role="main">
                <div className="map-container">
                    <div id="map" style={style} role="application"/>
                </div>
            </div>
            </div>
            </div>
        )
    }

}
// more on https://github.com/foursquare/react-foursquare
var foursquare = require('react-foursquare')({
    clientID: 'CWQ3TXXBMMD30Y5OX4O3XMW1PWD1XBAI5DQISABAH2D2RVDL',
    clientSecret: 'IU40MZ3LYRZC1MU431LJCYO1BZDFAMJ1OZNZYCM0F3FOY35W'  
  });

  function loadJS(src) {
    var ref = window.document.getElementsByTagName("script")[0];
    var script = window.document.createElement("script");
    script.src = src;
    script.async = true;
    script.onerror = function () {
        console.log("Google Maps can't be loaded");
    };
    ref.parentNode.insertBefore(script, ref);
}


export default Map;

