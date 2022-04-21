export function validatePrice(price) {
  price = price.replace('$', '').replace(' ', '');
  if (price.trim() === '') {
    return false;
  }
  price = parseFloat(price);
  if (isNaN(price)) {
    return false;
  }
  if (price !== '') {
    if (!/^\d*(?:\.\d{0,2})?$/.test(price)) {
      return false;
    }
  }
  if (price < 0) {
    return false;
  }

  return true;
}

export function validateDistance(distance) {
  if (distance.trim() === '') {
    return false;
  }
  distance = parseFloat(distance);
  if (isNaN(distance)) {
    return false;
  }
  if (distance !== '') {
    if (!/^\d*(?:\.\d{0,2})?$/.test(distance)) {
      return false;
    }
  }
  if (distance < 0) {
    return false;
  }

  return true;
}
