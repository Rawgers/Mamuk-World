export const concatenate = array => {
  if (array.length <= 2) {
    return array.join(' and ');
  } else {
    return array.slice(0, -1).join(', ') + ', and ' + array[array.length - 1];
  }
};
