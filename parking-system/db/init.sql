CREATE TABLE IF NOT EXISTS parking_lots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    total_spots INTEGER NOT NULL,
    available_spots INTEGER NOT NULL,
    price_per_hour NUMERIC(10, 2) NOT NULL
);

INSERT INTO parking_lots (name, address, latitude, longitude, total_spots, available_spots, price_per_hour)
VALUES
('中央商务区停车场', '上海市浦东新区陆家嘴金融中心', 31.2304, 121.5090, 500, 120, 15.00),
('人民广场停车场', '上海市黄浦区人民大道', 31.2302, 121.4737, 300, 45, 10.00),
('虹桥火车站停车场', '上海市闵行区虹桥枢纽', 31.1944, 121.3782, 1000, 350, 8.00),
('上海体育场停车场', '上海市徐汇区天钥桥路', 31.1900, 121.4490, 800, 200, 12.00),
('静安寺停车场', '上海市静安区南京西路', 31.2363, 121.4464, 400, 80, 18.00)
ON CONFLICT DO NOTHING;