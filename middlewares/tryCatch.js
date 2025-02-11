const tryCatch = (handle) => {
    return async (req, res, next) => {
        try {
            await handle(req, res, next)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
}

module.exports = tryCatch