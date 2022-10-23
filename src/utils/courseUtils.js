const createSchedule = (startDate, endDate, intervals) => {
    const intervalsInNumbers = intervals.map(interval => parseInt(interval))
    const schedule = []
    let i = intervalsInNumbers.length - 1

    for (let date = startDate; date.getTime() < endDate.getTime(); date.setDate(date.getDate() + intervalsInNumbers[i])) {
        const currentDate = new Date(date)
        schedule.push(currentDate)

        if (intervalsInNumbers.length === i + 1)
            i = 0
        else
            i++
    }

    return schedule
}

module.exports = {
    createSchedule
}