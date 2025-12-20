export interface ParkingLot {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  totalSpots: number;
  availableSpots: number;
  pricePerHour: number;
  distance?: number;
}

const mockParkingLots: ParkingLot[] = [
  {
    id: 1,
    name: '中央商务区停车场',
    address: '上海市浦东新区陆家嘴金融中心',
    latitude: 31.2304,
    longitude: 121.5090,
    totalSpots: 500,
    availableSpots: 120,
    pricePerHour: 15
  },
  {
    id: 2,
    name: '人民广场停车场',
    address: '上海市黄浦区人民大道',
    latitude: 31.2302,
    longitude: 121.4737,
    totalSpots: 300,
    availableSpots: 45,
    pricePerHour: 10
  },
  {
    id: 3,
    name: '虹桥火车站停车场',
    address: '上海市闵行区虹桥枢纽',
    latitude: 31.1944,
    longitude: 121.3782,
    totalSpots: 1000,
    availableSpots: 350,
    pricePerHour: 8
  },
  {
    id: 4,
    name: '上海体育场停车场',
    address: '上海市徐汇区天钥桥路',
    latitude: 31.1900,
    longitude: 121.4490,
    totalSpots: 800,
    availableSpots: 200,
    pricePerHour: 12
  },
  {
    id: 5,
    name: '静安寺停车场',
    address: '上海市静安区南京西路',
    latitude: 31.2363,
    longitude: 121.4464,
    totalSpots: 400,
    availableSpots: 80,
    pricePerHour: 18
  }
];

export const getParkingLots = async (): Promise<ParkingLot[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockParkingLots), 100);
  });
};

export const getParkingLotById = async (id: number): Promise<ParkingLot | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockParkingLots.find(lot => lot.id === id)), 100);
  });
};