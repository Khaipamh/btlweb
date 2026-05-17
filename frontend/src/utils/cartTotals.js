export function cartTotalItems(items) {
  return (items || []).reduce((t, i) => t + Number(i.quantity || 0), 0);
}

export function cartTotalPrice(items) {
  return (items || []).reduce((t, i) => t + Number(i.price || 0) * Number(i.quantity || 0), 0);
}
