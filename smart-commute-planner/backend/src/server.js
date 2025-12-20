const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Redis cache simulation (in production, use real Redis)
const cache = new Map();

// Mock route data (in production, use real PostgreSQL database)
const mockRoutes = [
  {
    id: 1,
    start: '天安门',
    end: '中关村',
    type: 'subway',
    duration: 35,
    distance: 18,
    transfers: 1,
    stations: ['天安门西', '西单', '复兴门', '西直门', '大钟寺', '西土城', '健德门', '北土城', '安贞门', '惠新西街南口', '芍药居', '太阳宫', '三元桥', '亮马桥', '农业展览馆', '团结湖', '呼家楼', '金台夕照', '国贸', '永安里', '建国门', '东单', '王府井', '天安门东'],
    coordinates: [
      [116.397428, 39.90923],
      [116.385241, 39.913385],
      [116.369484, 39.913686],
      [116.353021, 39.91512],
      [116.336487, 39.916554],
      [116.319954, 39.917988],
      [116.30342, 39.919422],
      [116.286887, 39.920856],
      [116.270353, 39.92229],
      [116.25382, 39.923724],
      [116.237286, 39.925158],
      [116.220753, 39.926592],
      [116.204219, 39.928026],
      [116.187686, 39.92946],
      [116.171152, 39.930894],
      [116.154619, 39.932328],
      [116.138085, 39.933762],
      [116.121552, 39.935196],
      [116.105018, 39.93663],
      [116.088485, 39.938064],
      [116.071951, 39.939498],
      [116.055418, 39.940932],
      [116.038884, 39.942366],
      [116.022351, 39.9438],
      [116.005817, 39.945234]
    ]
  },
  {
    id: 2,
    start: '天安门',
    end: '中关村',
    type: 'bus',
    duration: 55,
    distance: 15,
    transfers: 2,
    stations: ['天安门西', '西单商场', '灵境胡同', '西四路口北', '平安里路口北', '新街口豁口', '索家坟', '文慧桥北', '明光桥北', '蓟门桥南', '蓟门桥北', '北京航空航天大学', '成府路口南', '中关村北', '中关村南'],
    coordinates: [
      [116.397428, 39.90923],
      [116.387, 39.912],
      [116.378, 39.914],
      [116.370, 39.916],
      [116.362, 39.918],
      [116.354, 39.920],
      [116.346, 39.922],
      [116.338, 39.924],
      [116.330, 39.926],
      [116.322, 39.928],
      [116.314, 39.930],
      [116.306, 39.932],
      [116.298, 39.934],
      [116.290, 39.936],
      [116.282, 39.938]
    ]
  },
  {
    id: 3,
    start: '天安门',
    end: '中关村',
    type: 'walk',
    duration: 120,
    distance: 8,
    transfers: 0,
    stations: ['天安门', '中山公园', '北海公园', '西四', '平安里', '新街口', '西直门', '大钟寺', '中关村'],
    coordinates: [
      [116.397428, 39.90923],
      [116.389, 39.911],
      [116.381, 39.913],
      [116.373, 39.915],
      [116.365, 39.917],
      [116.357, 39.919],
      [116.349, 39.921],
      [116.341, 39.923],
      [116.333, 39.925]
    ]
  }
];

// Route planning algorithm
function calculateRoutes(start, end, mode = 'all') {
  // In production, this would use real algorithms like Dijkstra's
  // For now, return mock data filtered by mode
  return mockRoutes.filter(route => {
    if (mode === 'all') return true;
    return route.type === mode;
  });
}

// API endpoint to get routes
app.post('/api/routes', (req, res) => {
  const { start, end, mode = 'all', filter = 'all' } = req.body;

  // Create cache key
  const cacheKey = `${start}-${end}-${mode}-${filter}`;

  // Check cache first
  if (cache.has(cacheKey)) {
    console.log('Serving from cache:', cacheKey);
    return res.json(cache.get(cacheKey));
  }

  // Calculate routes
  let routes = calculateRoutes(start, end, mode);

  // Apply filters
  if (filter === 'fastest') {
    routes = routes.sort((a, b) => a.duration - b.duration);
  } else if (filter === 'least-transfers') {
    routes = routes.sort((a, b) => a.transfers - b.transfers);
  }

  // Cache the result (expires after 1 hour)
  cache.set(cacheKey, routes);
  setTimeout(() => cache.delete(cacheKey), 3600000);

  res.json(routes);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
