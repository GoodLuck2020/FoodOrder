export const getCategoryIndex = (categoryName, menu) => {
  const isCategory = cat => cat.categoryName === categoryName;
  return menu.categories.findIndex(isCategory);
};

export const isUniqueItemName = (itemName, menu, categoryName) => {
  let categoryIndex = getCategoryIndex(categoryName, menu);
  let sameName = menu.categories[categoryIndex].items.filter(
    item => item.itemName === itemName,
  );
  return sameName.length === 0;
};

export const hasChangedCategory = (oldCategory, newCategory) => {
  return oldCategory !== newCategory && newCategory !== '';
};

export const addItemToCategory = (item, newCategory, menu) => {
  let categoryIndex = getCategoryIndex(newCategory, menu);
  menu.categories[categoryIndex].items.push(item);
};

export const removeItemFromCategory = (itemName, itemCategory, menu) => {
  let categoryIndex = getCategoryIndex(itemCategory, menu);
  menu.categories[categoryIndex].items = menu.categories[
    categoryIndex
  ].items.filter(item => item.itemName !== itemName);
};

export const isUniqueOption = (newName, optionList) => {
  for (let i = 0; i < optionList.length; i++) {
    if (newName === optionList[i].optionName) {
      return false;
    }
  }
  return true;
};

export const isUniqueCategory = (newName, menu) => {
  for (let i = 0; i < menu.categories.length; i++) {
    if (newName === menu.categories[i].categoryName) {
      return false;
    }
  }
  return true;
};
