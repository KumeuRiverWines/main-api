async function getForecast(req, res) {
    const sql = "Select * FROM forecast";

    try {
        const response = await pool.query(sql);
        res.send(response.rows);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getForecast
};