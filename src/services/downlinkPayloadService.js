


//Extracts data from payload and then maps the time to the data in the map
function extractSensorDataFromPayload(map, payload, name, dateTime, totalTime) {
	if (name in payload.sensorData) {
        const count = payload.sensorData[name].length; //Getting the length of the array
        const collectionInterval = totalTime / count; //Colleciton interval in minutes
        for (let index = 0; index < count; index++) {
          const backCount = count - 1 - index; //How many counts backward the time will be
          const collecitonTime = getBackDate(
            collectionInterval,
            dateTime,
            backCount
          );

          //Now we want to save the information in a specific time in the insertion map
          if(map.has(collecitonTime.getTime())) {
            //We want to append the object with this data
            const infoObj = map.get(collecitonTime.getTime());
			console.log("info obj");
			console.log(infoObj);
            if (!(name in infoObj)) {
              //If there isn't already a temperature
              infoObj[name] = payload.sensorData[name][index];
              map.set(collecitonTime.getTime(), infoObj);
            } else {
              console.log("BIG ERROR SOMEHOW BUGGGGGGGGGG");
            }
          } else {
            //We want to create a new object to set the value
            const infoObj = {
              temperature: payload.sensorData[name][index],
            };
            map.set(collecitonTime.getTime(), infoObj);
          }
        }
    }
}

/**
 * Maps date->sensorObj to SQL queries 
 * @param { Map } map 
 * @param { String } nodeId 
 * @returns Array of Strings as SQL queries
 */
function mapToQueries(map, nodeId) {
	let outputQueries = []; //
	const keyArray = Array.from(map.keys());

	for(let index in keyArray) {
		const date = new Date(keyArray[index]); //Getting the date and time for the input
		const data = map.get(keyArray[index]);

		//Adding dew point to data if possible
		if("temperature" in data && "humidity" in data) {
			data["dewPoint"] = calculateDewPoint(data["temperature"], data["humidity"]);
		};

		const tempQuery = `INSERT INTO measurement (entry_id, node_id, timestamp, temperature, humidity, dew_point, wind_speed, leaf_wetness, rainfall) VALUES (1, '${nodeId}', '${date.toISOString()}', ${data["temperature"] ?? "NULL"}, ${data["humidity"] ?? "NULL"}, ${data["dewPoint"] ?? "NULL"}, ${data["windSpeed"] ?? "NULL"}, ${data["leafWetness"] ?? "NULL"}, ${data["rainCollector"] ?? "NULL"})`;
		outputQueries.push(tempQuery);
	}

	return outputQueries;	
}