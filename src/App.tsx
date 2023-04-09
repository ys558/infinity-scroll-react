import React, { useState, useEffect, useRef } from 'react';

type Data = {
  title: string;
  body: string;
};

type UseInfiniteScrollProps = {
  getData: () => Promise<Data[]>;
  setData: React.Dispatch<React.SetStateAction<Data[]>>;
};

const useInfiniteScroll = ({ getData, setData }: UseInfiniteScrollProps) => {
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    const newData = await getData();
    setData((prevData) => [...prevData, ...newData]);
    setLoading(false);
  };

  return loadMore;
};

const App = () => {
  const [data, setData] = useState<Data[]>([]);
  const loadMore = useInfiniteScroll({ getData, setData });

  const observer = useRef(
    new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1 }
    )
  );

  const [endRef, setEndRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const current = endRef;
    const observerCurrent = observer.current;

    if (current) {
      observerCurrent.observe(current);
    }

    return () => {
      if (current) {
        observerCurrent.unobserve(current);
      }
    };
  }, [endRef]);

  async function getData() {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await response.json();
    return data;
  }

  return (
    <div>
      {data.map((item, index) => (
        <div key={index}>
          <h2>{item.title}</h2>
          <p>{item.body}</p>
        </div>
      ))}
      <div ref={setEndRef} style={{ color: 'red' }}>Loading...</div>
    </div>
  );
};

export default App;