export const formatCardNumber = cardNumber => {
    const cardArray = cardNumber.split(' ');
    const formatted = cardArray
        .map((item, index) => {
            let itemNumber = '';
            for (let indexNum = 0; indexNum < item.length; indexNum++) {
                itemNumber += 'X';
            }
            if (index < cardArray.length - 1) {
                return itemNumber;
            } else {
                return item;
            }
        })
        .join(' ');
    return formatted;
};
