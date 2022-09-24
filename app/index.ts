const getRandomBoolean = (): boolean => Math.floor(Math.random() * 2) == 1;

const main = () => {
  const randomBoolean = getRandomBoolean();

  if (randomBoolean) {
    console.log('I\'m alive!')
  } else {
    const message = `Send help!`;
    console.error(message)
    throw Error(message);
  }
};

main();
