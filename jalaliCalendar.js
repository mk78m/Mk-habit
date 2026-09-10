/**
 * =========================================================================
 * ACCURATE JALALI (PERSIAN) ASTRONOMICAL CONVERTER IMPLEMENTATION
 * Converts between Gregorian and Jalali calendar without external network.
 * Displays Persian months in English Finglish transliteration.
 * =========================================================================
 */
export const JalaliCalendar = {
  persianMonths: [
    "Farvardin", "Ordibehesht", "Khordad",
    "Tir", "Mordad", "Shahrivar",
    "Mehr", "Aban", "Azar",
    "Dey", "Bahman", "Esfand"
  ],
  gregorianMonths: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ],

  /**
   * Converts Gregorian (year, month: 1-12, day: 1-31) to Jalali {jy, jm, jd}
   */
  toJalali(gy, gm, gd) {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let gy2 = (gm > 2) ? (gy + 1) : gy;
    let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
    let jy = -1595 + (33 * Math.floor(days / 12053));
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    let jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
    let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
    return { jy, jm, jd, monthName: this.persianMonths[jm - 1] };
  },

  formatDualDate(date, mode = 'both') {
    const gy = date.getFullYear();
    const gm = date.getMonth() + 1;
    const gd = date.getDate();
    const jalali = this.toJalali(gy, gm, gd);

    const gregStr = `${this.gregorianMonths[gm - 1]} ${gd}, ${gy}`;
    const jalaliStr = `${jalali.jd} ${jalali.monthName} ${jalali.jy}`;

    if (mode === 'gregorian') return gregStr;
    if (mode === 'persian') return jalaliStr;
    return `${gregStr} • ${jalaliStr}`;
  }
};
