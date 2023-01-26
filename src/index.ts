import logger from "./helpers/Logger";

const port = process.env.PORT;

import app from "./app";

app.listen(port, async () => {
    // await connectDb()
    logger.info(`Server connected, port: ${port}`);
})
