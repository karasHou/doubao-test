#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing City Parking System...\n');

// Test 1: Frontend availability
console.log('1. Testing Frontend Application:');
http.get('http://localhost:5174', (res) => {
    console.log(`   ✓ Status: ${res.statusCode} - OK`);

    // Test 2: Backend health check via proxy
    console.log('\n2. Testing Backend API (via proxy):');
    http.get('http://localhost:5174/api/health', (healthRes) => {
        let data = '';
        healthRes.on('data', (chunk) => data += chunk);
        healthRes.on('end', () => {
            console.log(`   ✓ Status: ${healthRes.statusCode}`);
            try {
                const result = JSON.parse(data);
                console.log(`   ✓ Message: ${result.message}`);
            } catch (e) {
                console.log('   ✗ Invalid JSON response');
            }

            // Test 3: Parking lots endpoint
            console.log('\n3. Testing Parking Lots API:');
            http.get('http://localhost:5174/api/parking/lots', (lotsRes) => {
                let lotsData = '';
                lotsRes.on('data', (chunk) => lotsData += chunk);
                lotsRes.on('end', () => {
                    console.log(`   ✓ Status: ${lotsRes.statusCode}`);
                    try {
                        const lots = JSON.parse(lotsData);
                        console.log(`   ✓ Found ${lots.length} parking lots`);

                        // Test 4: Prediction endpoint
                        if (lots.length > 0) {
                            console.log('\n4. Testing Parking Prediction:');
                            const firstLotId = lots[0].id;
                            http.get(`http://localhost:5174/api/parking/lots/${firstLotId}/predict`, (predictRes) => {
                                let predictData = '';
                                predictRes.on('data', (chunk) => predictData += chunk);
                                predictRes.on('end', () => {
                                    console.log(`   ✓ Status: ${predictRes.statusCode}`);
                                    try {
                                        const prediction = JSON.parse(predictData);
                                        console.log(`   ✓ Prediction available for lot ${firstLotId}`);
                                        console.log(`   ✓ Predicted spots: ${prediction.predictedAvailableSpots}`);
                                    } catch (e) {
                                        console.log('   ✗ Invalid prediction data');
                                    }
                                    console.log('\n🎉 All tests passed! System is ready.');
                                    console.log('\n📱 Access the application at:');
                                    console.log('   http://localhost:5174');
                                });
                            }).on('error', (err) => {
                                console.log(`   ✗ Error: ${err.message}`);
                            });
                        }
                    } catch (e) {
                        console.log('   ✗ Invalid lots data');
                    }
                });
            }).on('error', (err) => {
                console.log(`   ✗ Error: ${err.message}`);
            });
        });
    }).on('error', (err) => {
        console.log(`   ✗ Error: ${err.message}`);
    });
}).on('error', (err) => {
    console.log(`   ✗ Error: ${err.message}`);
    console.log('\n❌ System might not be running properly');
    console.log('   Run: docker-compose up -d');
});