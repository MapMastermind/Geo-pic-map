mapboxgl.accessToken = 'pk.eyJ1IjoiemhhcmVub3dhdCIsImEiOiJjbGpsYWx6enkwZ3JlM25yN2xmdzRidmprIn0.Rh1GTK4ItzMEsORFuU3JQw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/zharenowat/clkmeodco003t01o885rb7cp2/draft',
    center: [37.621530, 55.752793],
    maxBounds: [[36.777965, 55.518664], [38.492432, 55.984693]],
    zoom: 11,
    minZoom: 9,
    maxZoom: 18,
    attributionControl: false
});

map.addControl(new mapboxgl.AttributionControl({
  customAttribution: '<a>zharenowat</a>'
}));

const mapDiv = document.getElementById('map');
if (mapDiv.style.visibility === 'visible') map.resize();

map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

const nav = new mapboxgl.NavigationControl({
  visualizePitch: true
});
map.addControl(nav, 'top-right');

const months = ['Зима', 'Весна', 'Лето', 'Осень'];
const sources = [
  { url: 'mapbox://zharenowat.0j98pi6p', layer: 'winter_test_2-3xh0vc' }, 
  { url: 'mapbox://zharenowat.3w4litlc', layer: 'spring-ddc9ri' },
  { url: 'mapbox://zharenowat.5bp80jv6', layer: 'summer-3291d5' },
  { url: 'mapbox://zharenowat.19ehl9ja', layer: 'autumn-7xl2kc' } 
];
const sources_ply = [
  { url: 'mapbox://zharenowat.2frta14y', layer: 'winter_ply_test-cs84mg' }, 
  { url: 'mapbox://zharenowat.1fpnlg7j', layer: 'spring_melody-2gklys' },
  { url: 'mapbox://zharenowat.01esqksj', layer: 'cruel_summer-bif2g6' },
  { url: 'mapbox://zharenowat.594qfpg3', layer: 'autumn-61mbfw' } 
];

let currentMonthIndex = 0;
let currentHeatmapLayer = null;
let currentPointLayer = null;
let currentPolygonLayer = null;
let currentPolygonLayer_2 = null;
let source_ply;


const photoNameMapping = {
  "ТЦ \"ГУМ\"": "ТЦ ГУМ.jpeg",
  "Зарядье": "Зарядье.jpg",
  "Центральный детский мир": "Центральный детский мир.jpg",
  };

function showPopup(coordinates, name, layer_count) {
  console.log("Получены координаты:", coordinates);
  const popup = new mapboxgl.Popup({
    anchor: "bottom", 
  })
    .setLngLat(coordinates)
    
    .setHTML(`<h3>${name}</h3><p>количество фотографий: ${layer_count}</p>`);

  // Получаем имя файла фотографии из объекта сопоставления
  const photoName = photoNameMapping[name] || `${name}.jpeg`;
  const photoUrl = `https://raw.githubusercontent.com/MapMastermind/photos/main/compressjpeg/${photoName}`;

  // Проверяем наличие фотографии с соответствующим именем
  fetch(photoUrl)
    .then(response => {
      if (response.ok) {
        popup.setHTML(
          `<h3>${name}</h3><p>количество фотографий: ${layer_count}</p><img src="${photoUrl}" width="170" height="170" />`
        );
      }
      popup.setLngLat(coordinates);
      popup.addTo(map);
    })
    .catch(error => {
      popup.addTo(map);
    });
 
  map.flyTo({
    center: coordinates,
    zoom: 14,
    speed: 0.6
  });
}
function updateMapData() {
  if (currentHeatmapLayer) {
    map.removeLayer(currentHeatmapLayer.id);
    map.removeSource('trees-source');
  }

  if (currentPointLayer) {
    map.removeLayer(currentPointLayer.id);
    map.removeSource('trees-source');
  }
  if (currentPolygonLayer) {
    map.removeLayer(currentPolygonLayer.id);
    map.removeSource('poly-source');
  }
  if (currentPolygonLayer_2) {
    map.removeLayer(currentPolygonLayer_2.id);
    map.removeSource('poly-source');
  }

  const source = sources[currentMonthIndex];
  map.addSource('trees-source', {
    type: 'vector',
    url: source.url
  });

  const source_ply = sources_ply[currentMonthIndex];
  map.addSource('poly-source', {
    type: 'vector',
    url: source_ply.url
  });

  
 currentHeatmapLayer = {
    id: 'trees-heat',
    type: 'heatmap',
    source: 'trees-source',
    'source-layer': source.layer,
    maxzoom: 16,
    paint: {'heatmap-weight': {
      property: 'dbh',
      type: 'exponential',
      stops: [
        [1, 0],
        [62, 1]
      ]
    },
    
    'heatmap-intensity': {
      stops: [
        [11, 1],
        [16, 3]
      ]
    },
    
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0,
      'rgba(236, 222, 239, 0)',
      0.15,
      '#410f74',
      0.25,
      '#7b2282',
      0.3,
      '#b63679',
      0.4,
      '#c70039',
      0.45,
      '#e3611c',
      0.7,
      '#f1920e',
      0.9,
      '#ffc300'      
    ],
    
    'heatmap-radius': 4,
    
    'heatmap-opacity': {
      default: 1,
      stops: [
        [15, 1],
        [16, 0]
      ]
    }
  }
};
map.addLayer(currentHeatmapLayer);

// Добавление слоя точек на карту
currentPointLayer = {
  id: 'trees-point',
  type: 'circle',
  source: 'trees-source',
  'source-layer': source.layer, 
  minzoom: 15,
  paint: {
    
    'circle-radius': {
      property: 'dbh',
      type: 'exponential',
      stops: [
        [{ zoom: 16, value: 1 }, 2],
        [{ zoom: 16, value: 62 }, 5],
        [{ zoom: 22, value: 1 }, 10],
        [{ zoom: 22, value: 62 }, 30]
      ]
    },
    'circle-color': '#ffc300',
    'circle-stroke-color': '#5a1846',
    'circle-stroke-width': 0,
    'circle-opacity': {
      stops: [
        [15, 0],
        [16, 1]
      ]
    }
  }
};
map.addLayer(currentPointLayer);



// Добавление слоя полигонов на карту
currentPolygonLayer = {
  id: 'trees-poly',
  type: 'fill',
  source: 'poly-source',
  'source-layer': source_ply.layer, 
  minzoom: 9,
  paint: {
    'fill-color': 'rgba(255, 0, 0, 0)'      
    }
};    
map.addLayer(currentPolygonLayer);

// Добавление ОБВОДКИ полигона
currentPolygonLayer_2 = {
  id: 'trees-outline',
  type: 'line',
  source: 'poly-source',
  'source-layer': source_ply.layer, 
  minzoom: 9,
  paint: {
    'line-color': '#000',
    'line-width': 0        
  }
};
map.addLayer(currentPolygonLayer_2);
}

// Задаем массивы с полигонами для каждого сезона
const winterPolygons = ["Красная площадь", "ТЦ \"ГУМ\"", "Москва-Сити", "Манежная площадь", "Зарядье", "ул. Никольская", "Центральный детский мир", "Московский Кремль", "Новая Третьяковка", "Парк Горького"];
const springPolygons = ["Москва-Сити", "Аптекарский огород", "Зарядье", "Красная площадь", "ТЦ \"ГУМ\"", "Манежная площадь", "Московский зоопарк", "Московский Кремль", "Парк Горького", "ул. Тверская"];
const summerPolygons = ["Москва-Сити", "Зарядье", "Красная площадь", "Горнолыжный комплекс Воробьевы горы", "Московский зоопарк", "Манежная площадь", "ТЦ \"ГУМ\"", "Парк Горького", "Московский Кремль", "ул. Никольская"];
const autumnPolygons = ["Москва-Сити", "Красная площадь", "Горнолыжный комплекс Воробьевы горы", "Зарядье", "ТЦ \"ГУМ\"", "Третьяковская галерея", "Манежная площадь", "Московский Кремль", "Манеж", "ул. Никольская"];


const polygonsByMonth = {
  0: winterPolygons,
  1: springPolygons,
  2: summerPolygons,
  3: autumnPolygons,
};


function updateInfoContainer(monthIndex) {
  const topPolygonsList = document.getElementById('top-polygons-list');
 
  topPolygonsList.innerHTML = '';
    
  const polygons = polygonsByMonth[monthIndex];

  polygons.forEach((name, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${index + 1}. ${name}`; 
     listItem.addEventListener('mouseover', () => {
      listItem.style.color = '#7b2282';
    });

    listItem.addEventListener('mouseout', () => {
      listItem.style.color = ''; 
    });

    listItem.addEventListener('click', () => {
    
      if (map.getLayer('trees-poly')) {       
        const feature = map.querySourceFeatures('poly-source', {
          sourceLayer: currentPolygonLayer['source-layer'],
          filter: ['==', 'name', name]
        });

        if (feature && feature.length > 0) {
          const coordinates = feature[0].geometry.coordinates[0]; 
          const layerCount = feature[0].properties.layer_count;
          showPopup_alt(coordinates, name, layerCount);
        } else {
          console.error(`Полигон с именем "${name}" не найден на карте.`);
        }
      } else {
        console.error(`Слой "trees-poly" еще не загружен на карту.`);
      }
    });

    topPolygonsList.appendChild(listItem);
  });
}


function showPopup_alt(coordinatesArray, name, layer_count) {
  const coordinates = calculateCenter(coordinatesArray);
  console.log("Получены координаты:", coordinates);

  
  const popup = new mapboxgl.Popup({
    anchor: "bottom", 
  })
    .setLngLat(coordinates)
    .setHTML(`<h3>${name}</h3><p>количество фотографий: ${layer_count}</p>`);

  // Получаем имя файла фотографии из объекта сопоставления
  const photoName = photoNameMapping[name] || `${name}.jpeg`;
  const photoUrl = `https://raw.githubusercontent.com/MapMastermind/photos/main/compressjpeg/${photoName}`;

  // Проверяем наличие фотографии с соответствующим именем
  fetch(photoUrl)
    .then(response => {
      if (response.ok) {
        
        popup.setHTML(
          `<h3>${name}</h3><p>количество фотографий: ${layer_count}</p><img src="${photoUrl}" width="170" height="170" />`
        );
      }      
      popup.addTo(map);

      
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend(coordinates);
      map.fitBounds(bounds, { padding: 50 }); 
      
      map.flyTo({
        center: coordinates,
        zoom: 14, 
        speed: 0.6
      });
    })
    .catch(error => {
      // Если фотография не найдена, просто отображаем попап без изображения
      popup.addTo(map);

      
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend(coordinates);
      map.fitBounds(bounds, { padding: 50 }); 

      
      map.flyTo({
        center: coordinates,
        zoom: 14, 
        speed: 0.6
      });
    });
}





function calculateCenter(coordinatesArray) {
  let lngSum = 0;
  let latSum = 0;
  const numCoordinates = coordinatesArray.length;

  coordinatesArray.forEach(([lng, lat]) => {
    lngSum += lng;
    latSum += lat;
  });

  const lngAvg = lngSum / numCoordinates;
  const latAvg = latSum / numCoordinates;

  return [lngAvg, latAvg];
}

map.on('click', 'trees-poly', function (e) {
  const coordinates = e.lngLat;
  const feature = e.features[0];
  const name = feature.properties.name;
  const layerCount = feature.properties.layer_count;

  
  showPopup(coordinates, name, layerCount);
});

map.on('click', function (e) {
  if (e.layer && e.layer.id !== 'trees-poly') {
    
    const coordinates = e.lngLat;
    const feature = e.features[0];
    const name = feature.properties.name;
    const layerCount = feature.properties.layer_count;

    showPopup_alt(coordinates, name, layerCount);
  }
});




// Обработчик события наведения курсора на полигон
map.on('mouseenter', 'trees-poly', function (e) {
  map.getCanvas().style.cursor = 'pointer'; 

  // Получаем layer_count полигона, на который наведен курсор
  const featureLayerCount = e.features[0].properties.layer_count; 

  // Изменение стиля границы только для полигона с заданным layer_count
  map.setPaintProperty('trees-outline', 'line-color', [
    'case',
    ['==', ['get', 'layer_count'], featureLayerCount], 
    '#5a185f', 
    'rgba(0, 0, 255, 0)' 
  ]);

  // Увеличение толщины границы только для полигона с заданным layer_count
  map.setPaintProperty('trees-outline', 'line-width', [
    'case',
    ['==', ['get', 'layer_count'], featureLayerCount], 
    3, 
    0 
  ]);
});

// Обработчик события ухода курсора с полигона
map.on('mouseleave', 'trees-poly', function () {
  map.getCanvas().style.cursor = ''; 

  // Возвращение прозрачной границы и обычной толщины для всех полигонов
  map.setPaintProperty('trees-outline', 'line-color', ['rgba', 0, 0, 255, 0]);
  map.setPaintProperty('trees-outline', 'line-width', 1); 
});

// Обработчик события изменения значения слайдера
document.getElementById('slider').addEventListener('input', function () {
  const currentMonthIndex = parseInt(this.value);
  const source_ply = sources_ply[currentMonthIndex];

  map.getSource('poly-source').setData(source_ply.url);
    

  if (map.getSource('poly-source') && map.isSourceLoaded('poly-source')) {
    const features = map.querySourceFeatures('poly-source', {});
    updateInfoContainer(features);
  }
});





updateInfoContainer(0);

map.on('load', () => {
 
  updateMapData(); 
  // Устанавливаем значение лейбла "Зима" при загрузке страницы
  document.getElementById('month').innerText = months[currentMonthIndex];
  source_ply = sources_ply[currentMonthIndex]; 
  
});

document.getElementById('slider').addEventListener('input', function () {
  currentMonthIndex = parseInt(this.value);  
  document.getElementById('month').innerText = months[currentMonthIndex];
  updateMapData(); 
  updateInfoContainer(currentMonthIndex); 
  });

// Добавляем обработчик события изменения значения слайдера радиуса
document.getElementById('radius-slider').addEventListener('input', function () {
  const newRadiusValue = parseInt(this.value);
  document.getElementById('radius-value').innerText = newRadiusValue;

  if (currentHeatmapLayer) {
    map.setPaintProperty('trees-heat', 'heatmap-radius', newRadiusValue);
  }
});

const toggleButton = document.getElementById('toggle-top-button');
const topPolygonsList = document.getElementById('top-polygons-list');

toggleButton.addEventListener('click', function() {
  if (topPolygonsList.style.display === 'none') {
    topPolygonsList.style.display = 'block';
  } else {
    topPolygonsList.style.display = 'none';
  }
});
