import type { NextPage } from 'next';
import Header from '../components/common/header';
import Main from '../components/home/main';

const Home: NextPage = () => {
  return (
    <>
      <Header />
      <Main />
    </>
  );
};

export default Home;
