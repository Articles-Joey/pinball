
const adjectives = [
    'Rotten', 'Stinky', 'Slimy', 'Crusty', 'Greasy', 'Rusty', 'Moldy', 'Grimy',
    'Filthy', 'Soggy', 'Sticky', 'Soggy', 'Gross', 'Dank', 'Funky', 'Rancid',
    'Sour', 'Dusty', 'Soggy', 'Broken', 'Torn', 'Used', 'Discarded', 'Old',
    'Busted', 'Worn', 'Soggy', 'Bent', 'Crushed', 'Leaky', 'Scrappy'
];

const trashNouns = [
    'BananaPeel', 'SodaCan', 'PizzaBox', 'PlasticBag', 'BottleCap', 'OldShoe',
    'Toothbrush', 'Sock', 'Newspaper', 'MilkCarton', 'Eggshell', 'AppleCore',
    'ChipBag', 'CandyWrapper', 'Tire', 'Lightbulb', 'Battery', 'Rag', 'Sponge',
    'TinFoil', 'Straw', 'Fork', 'Spoon', 'Cup', 'Plate', 'Napkin', 'Glove',
    'Jug', 'Jar', 'Matchstick', 'CigaretteButt'
];


/**
 * Generates a random trash-themed nickname.
 * @returns {string} A random nickname like "StinkyBananaPeel42" or "RustySodaCan7".
 */
export const generateRandomNickname = () => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = trashNouns[Math.floor(Math.random() * trashNouns.length)];
    const num = Math.floor(Math.random() * 100);
    return `${adj}${noun}${num}`;
};
