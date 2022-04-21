export function isValidPrice(price) {
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

export function isValidTax(cityTax) {
  cityTax = cityTax.replace('%', '').replace(' ', '');
  if (cityTax.trim() === '') {
    return false;
  }
  cityTax = parseFloat(cityTax);
  if (isNaN(cityTax)) {
    return false;
  }
  if (cityTax !== '') {
    if (cityTax < 0 || cityTax > 99) {
      return false;
    }
  }
  return true;
}
