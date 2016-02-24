;(function (exports) {
  'use strict'
  exports.submitDateFormat = 'yyyy-mm-dd'

  // defines how far in advance THE SYSTEM is allowed to book days
  exports.userMaxBookAheadDays = 15
  // defines how far in advance PEOPLE are allowed to book days
  exports.userMaxBookAheadDays = 14
})(exports === undefined ? this.config = {} : exports)
