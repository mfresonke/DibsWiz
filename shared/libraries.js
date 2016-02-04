;(function (exports) {
  'use strict'

  exports.sms = {
    requestReservation: {
      msg: "Hello there! It's your turn to book <room_name> at <book_time> for your <group>. Please reply when you have completed the booking!",
      validReplies: [
        'confirmed', 'room not available', 'already booked room', "I'm busy", "don't want to"
      ]
    }
  }

  function Time (hour, minute) {
    if (arguments.length < 1) {
      throw new Error('Time recieved incorrect length.')
    }
    this.hour = hour
    if (minute) {
      this.minute = minute
    } else {
      this.minute = 0
    }
  }

  // Hours Of Operation takes in an array of days (integer weekdays),
  //  and and open and close time. Open and Close can be omitted if the
  //  library does not open or close on that particular set of days.
  function HoursOfOperation (days, open, close) {
    if (days instanceof Array) {
      this.days = days
    } else if (typeof days === 'number') {
      this.days = [days]
    } else {
      throw new Error('Days Not Formatted Properly.')
    }

    if (open instanceof Time) {
      this.open = open
    } else {
      this.open = null
    }

    if (close instanceof Time) {
      this.close = close
    } else {
      this.close = null
    }
  }

  HoursOfOperation.prototype.openAllDay = function () {
    return !(this.open || this.close)
  }

  const typeHighTop = 'High Top'
  const typeStandard = 'Standard'
  const typeReading = 'Reading'
  const featAirMedia = 'AirMedia'

  function Room (name, room, cap, hasMonitor, type, features) {
    this.name = name
    this.room = room
    this.cap = cap

    this.hasMonitor = hasMonitor
    if (!hasMonitor) {
      this.hasMonitor = false
    }

    this.type = type
    if (!type) {
      this.type = typeStandard
    }

    if (features instanceof Array) {
      this.features = features
    } else if (typeof features === 'string') {
      this.features = [features]
    } else {
      this.features = []
    }
  }

  function Duration (hours, minutes) {
    if (arguments.length < 1) {
      throw new Error('Invalid Duration')
    }
    this.hours = hours
    this.minutes = minutes
    if (!minutes) {
      this.minutes = 0
    }
  }

  // Takes in above duration objects
  function ReservationProperties (length, increments) {
    if (arguments.length !== 2) {
      throw new Error('Invalid number of arguments to booking properties')
    }
    for (let arg of arguments) {
      if (!(arg instanceof Duration)) {
        throw new Error('Invalid type passed to booking properties.')
      }
    }
    this.length = length
    this.increments = increments
  }

  function Library (name, rooms, hours, reservationProps) {
    const numArgs = 5
    if (arguments.length !== numArgs) {
      throw new Error('Not Enough Arguments to Library.')
    }
  }

  exports.marston = new Library(
    'Marston Science Library', [
      new Room('Argon', 'L201G', 6),
      new Room('Babbage', 'L115', 6, true, typeStandard, featAirMedia),
      new Room('Cade', 'L116', 4, true, typeReading),
      new Room('Carr', 'L117', 6, true, typeHighTop, featAirMedia),
      new Room('Carson', 'L118', 14, true),
      new Room('Carver', 'L119', 4, true, typeReading, featAirMedia),
      new Room('Darwin', 'L120', 12, true, typeStandard, featAirMedia),
      new Room('Einstien', 'L121', 12, true, typeStandard, featAirMedia),
      new Room('Franklin', 'L122', 6, true, typeHighTop, featAirMedia),
      new Room('Goodall', 'L123', 4, true, typeReading, featAirMedia),
      new Room('Hawking', 'L124', 6, true, typeStandard, featAirMedia),
      new Room('Heisenberg', 'L125', 4, true, typeReading, featAirMedia),
      new Room('Jemison', 'L126', 6, true, typeStandard, featAirMedia),
      new Room('Krypton', 'L201F', 8, true),
      new Room('Neon', 'L201H', 6, true),
      new Room('Newton', 'L127', 4, true, typeReading, featAirMedia),
      new Room('Nirenberg', 'L128', 6, true, typeHighTop, featAirMedia),
      new Room('Nye', 'L129', 12, true, typeStandard, featAirMedia),
      new Room('Raman', 'L130', 6, true, typeStandard, featAirMedia),
      new Room('Schrodinger', 'L131', 6, true, typeStandard, featAirMedia),
      new Room('Tesla', 'L132', 6, true, typeStandard, featAirMedia),
      new Room('Tyson', 'L133', 6, true, typeStandard, featAirMedia),
      new Room('Watson', 'L134', 6, true, typeStandard, featAirMedia),
      new Room('Wu', 'L135', 6, true, typeStandard, featAirMedia)
    ], [
      new HoursOfOperation(0, new Time(10)),
      new HoursOfOperation([1, 2, 3, 4]),
      new HoursOfOperation(5, null, new Time(22)),
      new HoursOfOperation(6, new Time(10), new Time(18))
    ], new ReservationProperties(new Duration(2), new Duration(0, 30))
  )
})(exports === undefined ? this.libraries = {} : exports)
