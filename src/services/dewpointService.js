
/**
 * Calculates dew point based of temperature and humidity values  
 * @param { Float } temperature 
 * @param { Float} relativeHumidity 
 * @returns Float as dewPoint
 */
function calculateDewPoint(temperature, relativeHumidity) {
  const a = 17.625;
  const b = 243.04;
  const lnRH = Math.log(relativeHumidity / 100);
  const term1 = (a * temperature) / (b + temperature);
  const term2 = lnRH + term1;
  const dewPoint = (b * term2) / (a - term2);

  return dewPoint.toFixed(2); // Round to two decimal places
}

module.exports = {
    calculateDewPoint
};