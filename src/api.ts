import mock from './mocks2.json';

export const getProducts = async () => {
  // if (import.meta.env.MODE === 'production') {
  //   const response = await fetch(
  //     'https://tilda.ru/projects/store/getproductslist/?storepartuid=712258094912&recid=1129331351&c=1751297043475&getparts=true&getoptions=true&slice=1&size=100&projectid=5596837'
  //   );
  //   if (!response.ok) {
  //     throw new Error('Failed to fetch products');
  //   }
  //   return response.json();
  // } else {
  // const mockData = await import('./mocks2.json');
  // return mockData;
  return mock;
  // }
};
