/**
 * dateModel - Used for creating and manipulating dates
 */

//Imports
const moment = require("moment");


//Functions
/**
 * getClosestCollectionDateTime - Create a new date that is aligned to the nearest update interval
 *  
 * @param { Integer } updateTime 
 * @returns Date 
 */
function getClosestCollectionDateTime(updateTime) {
    updateTime = parseInt(updateTime); //Parsing parameter to check for int value
    if(Number.isInteger(updateTime)) {
        let date = new Date(); //Getting the current time
    
        //Setting seconds and miliseconds to zero
        date.setSeconds(0);	
        date.setMilliseconds(0);

        //Getting the date minutes and gettings the difference 
        const minutes = date.getMinutes();
        let minutesToAdjust = -(minutes % updateTime);
        if((-minutesToAdjust) >= (updateTime / 2)) {
            minutesToAdjust = (updateTime + minutesToAdjust);
        }

        //Updating the minutes	
        const newDate = new Date(date.getTime() + (minutesToAdjust * 60000));
        return newDate;
    } else {
        return null;
    }
}

//Will be given count as (length-1)-index
function getBackDate(updateTime, date, count) {
	const countBackTime = count * updateTime;

	const momentDate = moment(date);	
	const updatedDate = momentDate.subtract(countBackTime, "minutes");

	return updatedDate.toDate();
}

module.exports = {
    getClosestCollectionDateTime,
    getBackDate
}