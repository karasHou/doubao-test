const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const houseData = [
  {
    id: 1,
    title: '市中心豪华公寓',
    price: 8500,
    location: '上海市黄浦区南京东路',
    rooms: 2,
    area: 85,
    latitude: 31.2304,
    longitude: 121.4737,
    description: '交通便利，周边配套齐全',
    images: ['https://via.placeholder.com/400x300?text=Apartment+1']
  },
  {
    id: 2,
    title: '浦东现代三居室',
    price: 12000,
    location: '上海市浦东新区陆家嘴',
    rooms: 3,
    area: 120,
    latitude: 31.2397,
    longitude: 121.5063,
    description: '江景房，豪华装修',
    images: ['https://via.placeholder.com/400x300?text=Apartment+2']
  },
  {
    id: 3,
    title: '静安区温馨一居室',
    price: 6000,
    location: '上海市静安区静安寺',
    rooms: 1,
    area: 50,
    latitude: 31.2289,
    longitude: 121.4539,
    description: '靠近商圈，生活方便',
    images: ['https://via.placeholder.com/400x300?text=Apartment+3']
  },
  {
    id: 4,
    title: '徐汇区宽敞两居室',
    price: 9500,
    location: '上海市徐汇区徐家汇',
    rooms: 2,
    area: 90,
    latitude: 31.1920,
    longitude: 121.4341,
    description: '学区房，环境优美',
    images: ['https://via.placeholder.com/400x300?text=Apartment+4']
  }
];

app.get('/api/houses', (req, res) => {
  let result = [...houseData];

  const { minPrice, maxPrice, rooms, location, sortBy } = req.query;

  if (minPrice || maxPrice) {
    const min = minPrice ? parseInt(minPrice) : 0;
    const max = maxPrice ? parseInt(maxPrice) : Infinity;
    result = result.filter(h => h.price >= min && h.price <= max);
  }

  if (rooms) {
    result = result.filter(h => h.rooms == parseInt(rooms));
  }

  if (location) {
    result = result.filter(h => h.location.includes(location));
  }

  if (sortBy === 'price-asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    result.sort((a, b) => b.price - a.price);
  }

  res.json({
    success: true,
    data: result
  });
});

app.get('/api/houses/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const house = houseData.find(h => h.id === id);

  if (house) {
    res.json({
      success: true,
      data: house
    });
  } else {
    res.status(404).json({
      success: false,
      message: '房源未找到'
    });
  }
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
