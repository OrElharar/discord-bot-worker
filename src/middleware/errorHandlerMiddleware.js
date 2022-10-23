const errorHandlerMiddleware = (err, req, res, next) => {
    res.status(err.status || 500).send({
        status: err.status || 500,
        message: err.message
    })
}

module.exports = errorHandlerMiddleware