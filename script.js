var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = { 
        center: new kakao.maps.LatLng(37.566826, 126.978656), // 서울시청을 중심으로 설정
        level: 3 // 지도의 확대 레벨
    };

// 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
var map = new kakao.maps.Map(mapContainer, mapOption);

// 지도타입 컨트롤의 지도 또는 스카이뷰 버튼을 클릭하면 호출되어 지도타입을 바꾸는 함수입니다
function setMapType(maptype) { 
    var roadmapControl = document.getElementById('btnRoadmap');
    var skyviewControl = document.getElementById('btnSkyview'); 
    if (maptype === 'roadmap') {
        map.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);    
        roadmapControl.className = 'selected_btn';
        skyviewControl.className = 'btn';
    } else {
        map.setMapTypeId(kakao.maps.MapTypeId.HYBRID);    
        skyviewControl.className = 'selected_btn';
        roadmapControl.className = 'btn';
    }
}

// 지도 확대, 축소 컨트롤에서 확대 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
function zoomIn() {
    map.setLevel(map.getLevel() - 1);
}

// 지도 확대, 축소 컨트롤에서 축소 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
function zoomOut() {
    map.setLevel(map.getLevel() + 1);
}

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
// 마커 순서를 저장할 변수
var markerCount = 0;
// 폴리라인 객체
var polyline = new kakao.maps.Polyline({
    path: [],
    strokeWeight: 3,
    strokeColor: '#FFD700',
    strokeOpacity: 0.7,
    strokeStyle: 'solid',
    map: map  // 폴리라인을 지도에 표시
});

// 마커의 메모, 별점, 제목을 저장할 객체
var markerMemos = {};
var markerRatings = {};
var markerTitles = {};

// 그룹 관련 변수
var groups = [];
var currentGroup = null;

// 그룹 모달 표시
function showGroupModal() {
    document.getElementById('groupModal').style.display = 'block';
    updateGroupList();
}

// 그룹 모달 닫기
function closeGroupModal() {
    document.getElementById('groupModal').style.display = 'none';
}

// 그룹 추가
function addGroup() {
    const nameInput = document.getElementById('groupName');
    const colorInput = document.getElementById('groupColor');
    const name = nameInput.value.trim();
    const color = colorInput.value;

    if (name) {
        const group = {
            id: Date.now(),
            name: name,
            color: color
        };
        groups.push(group);
        updateGroupList();
        nameInput.value = '';
    }
}

// 그룹 삭제
function deleteGroup(groupId) {
    groups = groups.filter(g => g.id !== groupId);
    updateGroupList();
    
    // 해당 그룹의 마커들을 기본 그룹으로 변경
    markers.forEach(marker => {
        if (marker.__groupId === groupId) {
            marker.__groupId = null;
            updateMarkerStyle(marker);
        }
    });
}

// 그룹 목록 업데이트
function updateGroupList() {
    const groupList = document.getElementById('groupList');
    groupList.innerHTML = groups.map(group => `
        <div class="group-item" onclick="selectGroup(${group.id})">
            <div class="group-color" style="background-color: ${group.color}"></div>
            <span class="group-name">${group.name}</span>
            <div class="group-actions">
                <button onclick="event.stopPropagation(); deleteGroup(${group.id})">삭제</button>
            </div>
        </div>
    `).join('');
}

// 그룹 선택
function selectGroup(groupId) {
    currentGroup = groupId;
    updateGroupList();
}

// 마커 스타일 업데이트
function updateMarkerStyle(marker) {
    const group = groups.find(g => g.id === marker.__groupId);
    if (group) {
        marker.setImage(createMarkerImage(marker.__number, group.color));
    } else {
        marker.setImage(createMarkerImage(marker.__number));
    }
}

// 마커 이미지 생성 함수
function createMarkerImage(number) {
    return new kakao.maps.MarkerImage(
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48"><path d="M18 0C8.059 0 0 8.059 0 18c0 7.2 4.8 13.2 11.4 15.6L18 48l6.6-14.4C31.2 31.2 36 25.2 36 18c0-9.941-8.059-18-18-18zm0 25.2c-4.2 0-7.2-3-7.2-7.2s3-7.2 7.2-7.2 7.2 3 7.2 7.2-3 7.2-7.2 7.2z" fill="%23D4A373"/><path d="M18 10.8c-4.2 0-7.2 3-7.2 7.2s3 7.2 7.2 7.2 7.2-3 7.2-7.2-3-7.2-7.2-7.2zm0 10.8c-2.4 0-3.6-1.2-3.6-3.6s1.2-3.6 3.6-3.6 3.6 1.2 3.6 3.6-1.2 3.6-3.6 3.6z" fill="%23FEFAE0"/><text x="50%" y="50%" text-anchor="middle" dy="0em" fill="%238B4513" font-size="14" font-weight="bold">' + number.toString().padStart(2, '0') + '</text></svg>',
        new kakao.maps.Size(36, 48)
    );
}

// 마커 생성 함수 수정
function createMarker(position, number) {
    const markerImage = createMarkerImage(number);
    const marker = new kakao.maps.Marker({
        position: position,
        image: markerImage,
        categoryId: currentCategory
    });
    
    return marker;
}

// 마커 클릭 이벤트 수정
function addMarkerClickEvent(marker, number) {
    kakao.maps.event.addListener(marker, 'click', function() {
        if (infowindow) {
            infowindow.close();
        }
        
        const content = createInfoWindowContent(number, marker.getCategoryId());
        infowindow = new kakao.maps.InfoWindow({
            content: content,
            removable: true,
            maxWidth: 280,
            minWidth: 220
        });
        
        infowindow.open(map, marker);
    });
}

// 인포윈도우 컨텐츠 생성 함수 수정
function createInfoWindowContent(number, categoryId) {
    const category = categoryId ? categories.find(c => c.id === categoryId) : null;
    const categoryName = category ? category.name : '기본';
    
    return `
        <div class="info-window">
            <div class="info-header">
                <span class="info-number">${number}번</span>
                <span class="info-category" style="color: ${category ? category.color : '#D4A373'}">${categoryName}</span>
            </div>
            <div class="info-content">
                <textarea class="info-memo" placeholder="메모를 입력하세요" onchange="updateMemo(${number}, this.value)">${markers[number-1].memo || ''}</textarea>
            </div>
            <div class="info-footer">
                <button class="delete-btn" onclick="deleteMarker(${number})">삭제</button>
            </div>
        </div>
    `;
}

// 폴리라인 업데이트 함수
function updatePolyline() {
    var path = markers.map(function(marker) {
        return marker.getPosition();
    });
    polyline.setPath(path);
}

// 지도 클릭 이벤트
kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
    // 열려있는 인포윈도우 닫기
    if (currentInfowindow) {
        currentInfowindow.close();
        currentInfowindow = null;
    }
    
    var latlng = mouseEvent.latLng;
    
    // 확인 대화상자 표시
    if (confirm('선택한 위치에 마커를 남기시겠습니까?')) {
        // 마커 순서 증가
        markerCount++;
        
        // 새로운 마커 생성
        var marker = new kakao.maps.Marker({
            position: latlng,
            map: map
        });
        
        // 마커 이미지 설정
        marker.setImage(createMarkerImage(markerCount));
        
        markers.push(marker);
        updatePolyline();
        
        // 클릭한 위치의 주소 정보 가져오기
        var geocoder = new kakao.maps.services.Geocoder();
        geocoder.coord2Address(latlng.getLng(), latlng.getLat(), function(result, status) {
            if (status === kakao.maps.services.Status.OK) {
                var address = result[0].address.address_name;
                var uniqueId = Date.now();
                
                // 마커에 주소 정보 저장
                marker.__address = address;
                
                // 인포윈도우 생성
                var infowindow = new kakao.maps.InfoWindow({
                    content: `
                        <div style="position:relative;">
                            <div style="padding:10px;font-size:13px;min-width:220px;max-width:280px;background:white;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.1);box-sizing:border-box;">
                                <input type="text" id="title-${uniqueId}" 
                                    style="width:100%;padding:6px;margin-bottom:6px;border:1px solid #ddd;border-radius:4px;font-size:13px;box-sizing:border-box;" 
                                    placeholder="제목을 입력하세요" 
                                    value="${markerTitles[uniqueId] || ''}"
                                    oninput="saveTitle(${uniqueId})">
                                <div style="color:#666;font-size:12px;margin-bottom:6px;border-bottom:1px solid #eee;padding-bottom:6px;">${address}</div>
                                <div style="margin-bottom:6px;">
                                    <div style="margin-bottom:4px;color:#666;font-size:12px;display:flex;justify-content:space-between;align-items:center;">
                                        <span>별점</span>
                                        <span style="color:#666;font-size:12px;">${markerRatings[uniqueId] || 0}/5</span>
                                    </div>
                                    <div class="star-rating" style="display:flex;gap:4px;">
                                        ${[1,2,3,4,5].map(star => `
                                            <span onclick="setRating(${uniqueId}, ${star})" 
                                                  style="cursor:pointer;font-size:20px;color:${markerRatings[uniqueId] >= star ? '#FFD700' : '#ddd'};">
                                                ★
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                                <div style="margin-bottom:6px;">
                                    <textarea id="memo-${uniqueId}" 
                                        style="width:100%;height:60px;padding:6px;resize:none;border:1px solid #ddd;border-radius:4px;font-size:12px;font-family:inherit;box-sizing:border-box;" 
                                        placeholder="메모를 입력하세요" 
                                        oninput="saveMemo(${uniqueId})">${markerMemos[uniqueId] || ''}</textarea>
                                </div>
                            </div>
                            <button onclick="removeMarker(${uniqueId})" 
                                style="position:absolute;bottom:-30px;right:0;padding:4px 12px;background-color:#ff4444;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;transition:background-color 0.2s;opacity:0.9;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                                삭제
                            </button>
                        </div>
                    `
                });
                
                // 마커를 uniqueId로 찾을 수 있도록 전역 객체에 저장
                window[uniqueId] = marker;
                marker.__uniqueId = uniqueId;
                
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
    }
});

// 장소 검색 함수
function searchPlaces() {
    var keyword = document.getElementById('searchInput').value;
    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('키워드를 입력해주세요!');
        return false;
    }

    // 이전 검색 결과의 임시 마커들 제거
    removeTempMarkers();

    // 검색 결과 패널 표시
    document.getElementById('searchResults').classList.remove('hidden');

    // 장소 검색 객체를 통해 키워드로 장소검색을 요청
    var ps = new kakao.maps.services.Places();
    ps.keywordSearch(keyword, function(results, status) {
        if (status === kakao.maps.services.Status.OK) {
            displayPlacesList(results);
            
            var bounds = new kakao.maps.LatLngBounds();
            
            // 검색 결과 마커 표시 (상위 5개만)
            results.slice(0, 5).forEach(function(place) {
                var marker = new kakao.maps.Marker({
                    map: map,
                    position: new kakao.maps.LatLng(place.y, place.x)
                });
                
                tempMarkers.push(marker);
                bounds.extend(new kakao.maps.LatLng(place.y, place.x));
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
    
    var uniqueId = Date.now();
    
    // 마커를 uniqueId로 찾을 수 있도록 전역 객체에 저장
    window[uniqueId] = marker;
    marker.__uniqueId = uniqueId;
    marker.__placeName = place.place_name;
    marker.__address = place.road_address_name || place.address_name;
    
    // 인포윈도우 생성
    var infowindow = new kakao.maps.InfoWindow({
        content: createInfoWindowContent(uniqueId)
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
                // 열려있는 인포윈도우 닫기
                if (currentInfowindow) {
                    currentInfowindow.close();
                    currentInfowindow = null;
                }
                
                // 확인 대화상자 표시
                if (confirm('선택한 위치에 마커를 남기시겠습니까?')) {
                    // 임시 검색 마커들 제거
                    removeTempMarkers();
                    
                    // 마커 순서 증가
                    markerCount++;
                    
                    // 선택한 장소의 마커 생성
                    var marker = new kakao.maps.Marker({
                        map: map,
                        position: new kakao.maps.LatLng(place.y, place.x)
                    });
                    
                    // 마커 이미지 설정
                    marker.setImage(createMarkerImage(markerCount));
                    
                    // 선택한 마커를 영구 마커 배열에 추가
                    markers.push(marker);
                    updatePolyline();
                    
                    var uniqueId = Date.now();
                    
                    // 마커에 장소명 저장
                    marker.__placeName = place.place_name;
                    
                    // 인포윈도우 생성
                    var infowindow = new kakao.maps.InfoWindow({
                        content: `
                            <div style="position:relative;">
                                <div style="padding:10px;font-size:13px;min-width:220px;max-width:280px;background:white;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.1);box-sizing:border-box;">
                                    <input type="text" id="title-${uniqueId}" 
                                        style="width:100%;padding:6px;margin-bottom:6px;border:1px solid #ddd;border-radius:4px;font-size:13px;box-sizing:border-box;" 
                                        placeholder="제목을 입력하세요" 
                                        value="${markerTitles[uniqueId] || ''}"
                                        oninput="saveTitle(${uniqueId})">
                                    <div style="color:#666;font-size:12px;margin-bottom:6px;border-bottom:1px solid #eee;padding-bottom:6px;">${place.place_name}</div>
                                    <div style="margin-bottom:6px;">
                                        <div style="margin-bottom:4px;color:#666;font-size:12px;display:flex;justify-content:space-between;align-items:center;">
                                            <span>별점</span>
                                            <span style="color:#666;font-size:12px;">${markerRatings[uniqueId] || 0}/5</span>
                                        </div>
                                        <div class="star-rating" style="display:flex;gap:4px;">
                                            ${[1,2,3,4,5].map(star => `
                                                <span onclick="setRating(${uniqueId}, ${star})" 
                                                      style="cursor:pointer;font-size:20px;color:${markerRatings[uniqueId] >= star ? '#FFD700' : '#ddd'};">
                                                    ★
                                                </span>
                                            `).join('')}
                                        </div>
                                    </div>
                                    <div style="margin-bottom:6px;">
                                        <textarea id="memo-${uniqueId}" 
                                            style="width:100%;height:60px;padding:6px;resize:none;border:1px solid #ddd;border-radius:4px;font-size:12px;font-family:inherit;box-sizing:border-box;" 
                                            placeholder="메모를 입력하세요" 
                                            oninput="saveMemo(${uniqueId})">${markerMemos[uniqueId] || ''}</textarea>
                                    </div>
                                </div>
                                <button onclick="removeMarker(${uniqueId})" 
                                    style="position:absolute;bottom:-30px;right:0;padding:4px 12px;background-color:#ff4444;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;transition:background-color 0.2s;opacity:0.9;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                                    삭제
                                </button>
                            </div>
                        `
                    });
                    
                    // 마커를 uniqueId로 찾을 수 있도록 전역 객체에 저장
                    window[uniqueId] = marker;
                    marker.__uniqueId = uniqueId;
                    
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
                }
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

// 메모 저장 함수
function saveMemo(uniqueId) {
    var memoText = document.getElementById(`memo-${uniqueId}`).value;
    markerMemos[uniqueId] = memoText;
}

// 제목 저장 함수
function saveTitle(uniqueId) {
    var titleText = document.getElementById(`title-${uniqueId}`).value;
    markerTitles[uniqueId] = titleText;
}

// 별점 설정 함수
function setRating(uniqueId, rating) {
    markerRatings[uniqueId] = rating;
    
    // 현재 열려있는 인포윈도우의 내용 업데이트
    if (currentInfowindow) {
        var marker = window[uniqueId];
        var address = marker.__address || marker.__placeName;
        
        currentInfowindow.setContent(`
            <div style="position:relative;">
                <div style="padding:10px;font-size:13px;min-width:220px;max-width:280px;background:white;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.1);box-sizing:border-box;">
                    <input type="text" id="title-${uniqueId}" 
                        style="width:100%;padding:6px;margin-bottom:6px;border:1px solid #ddd;border-radius:4px;font-size:13px;box-sizing:border-box;" 
                        placeholder="제목을 입력하세요" 
                        value="${markerTitles[uniqueId] || ''}"
                        oninput="saveTitle(${uniqueId})">
                    <div style="color:#666;font-size:12px;margin-bottom:6px;border-bottom:1px solid #eee;padding-bottom:6px;">${address}</div>
                    <div style="margin-bottom:6px;">
                        <div style="margin-bottom:4px;color:#666;font-size:12px;display:flex;justify-content:space-between;align-items:center;">
                            <span>별점</span>
                            <span style="color:#666;font-size:12px;">${markerRatings[uniqueId] || 0}/5</span>
                        </div>
                        <div class="star-rating" style="display:flex;gap:4px;">
                            ${[1,2,3,4,5].map(star => `
                                <span onclick="setRating(${uniqueId}, ${star})" 
                                    style="cursor:pointer;font-size:20px;color:${markerRatings[uniqueId] >= star ? '#FFD700' : '#ddd'};">
                                    ★
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    <div style="margin-bottom:6px;">
                        <textarea id="memo-${uniqueId}" 
                            style="width:100%;height:60px;padding:6px;resize:none;border:1px solid #ddd;border-radius:4px;font-size:12px;font-family:inherit;box-sizing:border-box;" 
                            placeholder="메모를 입력하세요" 
                            oninput="saveMemo(${uniqueId})">${markerMemos[uniqueId] || ''}</textarea>
                    </div>
                </div>
                <button onclick="removeMarker(${uniqueId})" 
                    style="position:absolute;bottom:-30px;right:0;padding:4px 12px;background-color:#ff4444;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;transition:background-color 0.2s;opacity:0.9;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                    삭제
                </button>
            </div>
        `);
    }
}

// 마커 삭제 함수
function removeMarker(uniqueId) {
    var marker = window[uniqueId];
    if (!marker) return;
    
    // 마커 배열에서 제거
    var index = markers.indexOf(marker);
    if (index > -1) {
        markers.splice(index, 1);
    }
    
    // 임시 마커 배열에서도 제거
    index = tempMarkers.indexOf(marker);
    if (index > -1) {
        tempMarkers.splice(index, 1);
    }
    
    // 마커를 지도에서 제거
    marker.setMap(null);
    
    // 메모, 별점, 제목 데이터 삭제
    delete markerMemos[uniqueId];
    delete markerRatings[uniqueId];
    delete markerTitles[uniqueId];
    
    // 전역 객체에서 마커 참조 제거
    delete window[uniqueId];
    
    // 폴리라인 업데이트
    updatePolyline();
    
    // 인포윈도우 닫기
    if (currentInfowindow) {
        currentInfowindow.close();
        currentInfowindow = null;
    }
    
    // 마커 순서 재정렬
    updateMarkerNumbers();
}

// 마커 순서 업데이트 함수
function updateMarkerNumbers() {
    markers.forEach(function(marker, index) {
        marker.setImage(createMarkerImage(index + 1));
    });
    markerCount = markers.length;
}

// 검색 결과 외부 클릭 시 패널 숨김
document.addEventListener('click', function(event) {
    var searchResults = document.getElementById('searchResults');
    var searchInput = document.getElementById('searchInput');
    
    // 검색 결과 패널이나 검색 입력창을 클릭한 경우가 아닐 때
    if (!searchResults.contains(event.target) && !searchInput.contains(event.target)) {
        searchResults.classList.add('hidden');
    }
});

// 검색 입력창 포커스 시 검색 결과가 있으면 표시
document.getElementById('searchInput').addEventListener('focus', function() {
    var placesList = document.getElementById('placesList');
    if (placesList.children.length > 0) {
        document.getElementById('searchResults').classList.remove('hidden');
    }
});

// 엔터 키로 검색
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchPlaces();
    }
});

// 페이지 로드 시 카테고리 초기화
window.onload = function() {
    // ... 기존 코드 ...
}

// 인포윈도우 업데이트 함수
function updateInfoWindow(uniqueId) {
    if (currentInfowindow) {
        const marker = window[uniqueId];
        const address = marker.__address || marker.__placeName;
        
        currentInfowindow.setContent(`
            <div style="position:relative;">
                <div style="padding:10px;font-size:13px;min-width:220px;max-width:280px;background:white;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.1);box-sizing:border-box;">
                    <input type="text" id="title-${uniqueId}" 
                        style="width:100%;padding:6px;margin-bottom:6px;border:1px solid #ddd;border-radius:4px;font-size:13px;box-sizing:border-box;" 
                        placeholder="제목을 입력하세요" 
                        value="${markerTitles[uniqueId] || ''}"
                        oninput="saveTitle(${uniqueId})">
                    <div style="color:#666;font-size:12px;margin-bottom:6px;border-bottom:1px solid #eee;padding-bottom:6px;">${address}</div>
                    <div style="margin-bottom:6px;">
                        <div style="margin-bottom:4px;color:#666;font-size:12px;display:flex;justify-content:space-between;align-items:center;">
                            <span>별점</span>
                            <span style="color:#666;font-size:12px;">${markerRatings[uniqueId] || 0}/5</span>
                        </div>
                        <div class="star-rating" style="display:flex;gap:4px;">
                            ${[1,2,3,4,5].map(star => `
                                <span onclick="setRating(${uniqueId}, ${star})" 
                                    style="cursor:pointer;font-size:20px;color:${markerRatings[uniqueId] >= star ? '#FFD700' : '#ddd'};">
                                    ★
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    <div style="margin-bottom:6px;">
                        <textarea id="memo-${uniqueId}" 
                            style="width:100%;height:60px;padding:6px;resize:none;border:1px solid #ddd;border-radius:4px;font-size:12px;font-family:inherit;box-sizing:border-box;" 
                            placeholder="메모를 입력하세요" 
                            oninput="saveMemo(${uniqueId})">${markerMemos[uniqueId] || ''}</textarea>
                    </div>
                </div>
                <button onclick="removeMarker(${uniqueId})" 
                    style="position:absolute;bottom:-30px;right:0;padding:4px 12px;background-color:#ff4444;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;transition:background-color 0.2s;opacity:0.9;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                    삭제
                </button>
            </div>
        `);
    }
}