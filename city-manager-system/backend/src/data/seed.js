module.exports = async (Facility) => {
  const sampleFacilities = [
    {
      name: '人民广场公共厕所',
      type: 'toilet',
      address: '上海市黄浦区人民大道180号',
      latitude: 31.2304,
      longitude: 121.4737,
      rating: 4.2,
      capacity: 15,
      open_time: '24小时'
    },
    {
      name: '上海交通大学医学院附属瑞金医院',
      type: 'hospital',
      address: '上海市黄浦区瑞金二路197号',
      latitude: 31.2238,
      longitude: 121.4694,
      rating: 4.8,
      capacity: 1200,
      open_time: '24小时'
    },
    {
      name: '国家电网充电站(人民广场)',
      type: 'charging_station',
      address: '上海市黄浦区人民大道200号',
      latitude: 31.2315,
      longitude: 121.4750,
      rating: 4.5,
      capacity: 20,
      open_time: '24小时'
    },
    {
      name: '外滩观光平台厕所',
      type: 'toilet',
      address: '上海市黄浦区中山东一路',
      latitude: 31.2308,
      longitude: 121.4789,
      rating: 4.0,
      capacity: 10,
      open_time: '06:00-22:00'
    },
    {
      name: '复旦大学附属华山医院',
      type: 'hospital',
      address: '上海市静安区乌鲁木齐中路12号',
      latitude: 31.2199,
      longitude: 121.4493,
      rating: 4.7,
      capacity: 1000,
      open_time: '24小时'
    },
    {
      name: '特来电充电站(南京东路)',
      type: 'charging_station',
      address: '上海市黄浦区南京东路555号',
      latitude: 31.2330,
      longitude: 121.4740,
      rating: 4.3,
      capacity: 15,
      open_time: '08:00-20:00'
    },
    {
      name: '静安公园公共厕所',
      type: 'toilet',
      address: '上海市静安区南京西路1649号',
      latitude: 31.2260,
      longitude: 121.4450,
      rating: 4.1,
      capacity: 8,
      open_time: '05:00-23:00'
    },
    {
      name: '上海第十人民医院',
      type: 'hospital',
      address: '上海市闸北区延长中路301号',
      latitude: 31.2520,
      longitude: 121.4430,
      rating: 4.5,
      capacity: 800,
      open_time: '24小时'
    },
    {
      name: '星星充电(大宁国际广场)',
      type: 'charging_station',
      address: '上海市闸北区共和新路1878号',
      latitude: 31.2530,
      longitude: 121.4600,
      rating: 4.4,
      capacity: 25,
      open_time: '24小时'
    }
  ];

  try {
    for (const facility of sampleFacilities) {
      await Facility.create(facility);
    }
    console.log('Sample data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};
