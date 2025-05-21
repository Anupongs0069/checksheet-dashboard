// ./src/app/components/DownTime/utils/shiftUtils.js
export const getShiftInfo = () => {
  const now = new Date();
  const currentHour = now.getHours();
  // If it is between 00:00-05:59, count it as the night shift of the previous day.
  if (currentHour >= 0 && currentHour < 6) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return {
      shift: 'N',
      date: yesterday.toISOString().split('T')[0],
      checked_at: now.toISOString()
    };
  }
  // If it is between 06:00-17:59, count it as the daytime shift of the current day.
  if (currentHour >= 6 && currentHour < 18) {
    return {
      shift: 'D',
      date: now.toISOString().split('T')[0],
      checked_at: now.toISOString()
    };
  }
  // If it is between 18:00-23:59, count it as the night shift of the current day.
  return {
    shift: 'N',
    date: now.toISOString().split('T')[0],
    checked_at: now.toISOString()
  };
};

export const getCurrentShift = () => {
  return getShiftInfo().shift;
};