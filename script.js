var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = { 
        center: new kakao.maps.LatLng(37.566826, 126.978656), // 서울시청을 중심으로 설정
        level: 3 // 지도의 확대 레벨
    };

// 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
var map = new kakao.maps.Map(mapContainer, mapOption);

// 마커를 담을 배열
var markers = [];
// 인포윈도우를 담을 배열
var infowindows = [];
// 검색 결과를 담을 배열
var searchResults = [];
// 선택된 마커를 담을 배열
var selectedMarkers = [];
// 클릭한 위치의 마커
var clickMarker = null;
// 마커 표시 상태
var markersVisible = true;
// 현재 열려있는 인포윈도우
var currentInfowindow = null;
// 임시 검색 마커를 담을 배열
var tempMarkers = [];
// 폴리라인 객체
var polyline = new kakao.maps.Polyline({
    path: [],
    strokeWeight: 3,
    strokeColor: '#FFD700',
    strokeOpacity: 0.7,
    strokeStyle: 'solid',
    map: map  // 폴리라인을 지도에 표시
});

// 폴리라인 업데이트 함수
function updatePolyline() {
    var path = markers.map(function(marker) {
        return marker.getPosition();
    });
    polyline.setPath(path);
}

// 지도 클릭 이벤트
kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
    var latlng = mouseEvent.latLng;
    
    // 새로운 마커 생성
    var marker = new kakao.maps.Marker({
        position: latlng,
        map: map
    });
    
    markers.push(marker);
    updatePolyline();
    
    // 클릭한 위치의 주소 정보 가져오기
    var geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(latlng.getLng(), latlng.getLat(), function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            var address = result[0].address.address_name;
            
            // 인포윈도우 생성
            var infowindow = new kakao.maps.InfoWindow({
                content: '<div style="padding:5px;font-size:12px;">' + address + '</div>'
            });
            
            // 마커 클릭 이벤트
            kakao.maps.event.addListener(marker, 'click', function() {
                if (currentInfowindow) {
                    currentInfowindow.close();
                }
                if (currentInfowindow !== infowindow) {
                    infowindow.open(map, marker);
                    currentInfowindow = infowindow;
                } else {
                    currentInfowindow = null;
                }
            });
        }
    });
});

// 장소 검색 함수
function searchPlaces() {
    var keyword = document.getElementById('searchInput').value;
    
    if (!keyword) {
        alert('검색어를 입력해주세요.');
        return;
    }
    
    // 이전 검색 결과의 임시 마커들 제거
    removeTempMarkers();
    
    var places = new kakao.maps.services.Places();
    
    places.keywordSearch(keyword, function(results, status) {
        if (status === kakao.maps.services.Status.OK) {
            displayPlacesList(results);
            
            var bounds = new kakao.maps.LatLngBounds();
            
            // 검색 결과 마커 표시
            results.forEach(function(place) {
                var marker = new kakao.maps.Marker({
                    map: map,
                    position: new kakao.maps.LatLng(place.y, place.x)
                });
                
                tempMarkers.push(marker);
                
                bounds.extend(new kakao.maps.LatLng(place.y, place.x));
                
                // 인포윈도우 생성
                var infowindow = new kakao.maps.InfoWindow({
                    content: '<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>'
                });
                
                // 마커 클릭 이벤트
                kakao.maps.event.addListener(marker, 'click', function() {
                    if (currentInfowindow) {
                        currentInfowindow.close();
                    }
                    if (currentInfowindow !== infowindow) {
                        infowindow.open(map, marker);
                        currentInfowindow = infowindow;
                    } else {
                        currentInfowindow = null;
                    }
                });
            });
            
            map.setBounds(bounds);
        } else {
            alert('검색 결과가 없습니다.');
        }
    });
}

// 마커 표시 함수
function displayMarker(place) {
    var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x)
    });
    
    markers.push(marker);
    
    // 인포윈도우 생성
    var infowindow = new kakao.maps.InfoWindow({
        content: '<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>'
    });
    
    // 인포윈도우 배열에 추가
    infowindows.push(infowindow);
    
    // 마커 클릭 이벤트
    kakao.maps.event.addListener(marker, 'click', function() {
        if (currentInfowindow) {
            currentInfowindow.close();
        }
        if (currentInfowindow !== infowindow) {
            infowindow.open(map, marker);
            currentInfowindow = infowindow;
        } else {
            currentInfowindow = null;
        }
    });
    
    return marker;
}

// 검색 결과 목록 표시 함수
function displayPlacesList(places) {
    var listEl = document.getElementById('placesList');
    var fragment = document.createDocumentFragment();
    
    listEl.innerHTML = '';
    
    for (var i = 0; i < places.length; i++) {
        var itemEl = document.createElement('li');
        itemEl.innerHTML = `
            <div class="place-item">
                <span class="place-name">${places[i].place_name}</span>
                <span class="place-address">${places[i].address_name}</span>
            </div>
        `;
        
        // 클릭 이벤트
        itemEl.addEventListener('click', function(place) {
            return function() {
                // 임시 검색 마커들 제거
                removeTempMarkers();
                
                // 선택한 장소의 마커 생성
                var marker = new kakao.maps.Marker({
                    map: map,
                    position: new kakao.maps.LatLng(place.y, place.x)
                });
                
                // 선택한 마커를 영구 마커 배열에 추가
                markers.push(marker);
                updatePolyline();
                
                // 인포윈도우 생성
                var infowindow = new kakao.maps.InfoWindow({
                    content: '<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>'
                });
                
                // 마커 클릭 이벤트
                kakao.maps.event.addListener(marker, 'click', function() {
                    if (currentInfowindow) {
                        currentInfowindow.close();
                    }
                    if (currentInfowindow !== infowindow) {
                        infowindow.open(map, marker);
                        currentInfowindow = infowindow;
                    } else {
                        currentInfowindow = null;
                    }
                });
                
                // 지도 중심 이동
                var position = new kakao.maps.LatLng(place.y, place.x);
                map.setCenter(position);
                map.setLevel(3);
            };
        }(places[i]));
        
        fragment.appendChild(itemEl);
    }
    
    listEl.appendChild(fragment);
}

// 임시 검색 마커 제거 함수
function removeTempMarkers() {
    tempMarkers.forEach(function(marker) {
        marker.setMap(null);
    });
    tempMarkers = [];
}

// 모든 마커 제거 함수
function removeAllMarkers() {
    markers.forEach(function(marker) {
        marker.setMap(null);
    });
    markers = [];
    
    removeTempMarkers();
    
    if (currentInfowindow) {
        currentInfowindow.close();
        currentInfowindow = null;
    }
    
    // 폴리라인 제거
    polyline.setPath([]);
}

// 엔터 키로 검색
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchPlaces();
    }
});