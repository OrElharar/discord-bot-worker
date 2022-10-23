// const connectDb = require('./db/mongoose')

const app = require('./app');

const port = process.env.PORT

app.listen(port, async () => {
    // await connectDb()
    console.log('Server connected, port:', port)
})