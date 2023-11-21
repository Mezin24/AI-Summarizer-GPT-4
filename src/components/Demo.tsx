import { useCallback, useState, FormEvent, useEffect } from 'react';
import { copy, linkIcon, loader, tick } from '../assets';
import { Article } from '../types';
import { useLazyGetSummaryQuery } from '../store/article';

export const Demo = () => {
  const [article, setArticle] = useState<Article>({
    summary: '',
    url: '',
  });

  const [copied, setCopied] = useState('');

  const [allArticles, setAllArticles] = useState<Article[]>([]);

  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const { data } = await getSummary({ articleUrl: article.url });

      if (data?.summary) {
        const newArticle = { ...article, summary: data.summary };

        setArticle(newArticle);
        const updatedArticles = [newArticle, ...allArticles];
        setAllArticles(updatedArticles);

        localStorage.setItem('articles', JSON.stringify(updatedArticles));
      }
    },
    [allArticles, article, getSummary]
  );

  const handleCopy = useCallback((copyUrl: string) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => {
      setCopied('');
    }, 3000);
  }, []);

  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(
      localStorage.getItem('articles')!
    );
    setAllArticles(articlesFromLocalStorage || []);
  }, []);

  return (
    <section className='mt-16 w-full max-w-xl'>
      <div className='flex flex-col w-full gap-2'>
        <form
          className='relative flex justify-center items-center'
          onSubmit={handleSubmit}
        >
          <img
            src={linkIcon}
            alt='link_icon'
            className='absolute left-0 my-2 ml-3 w-5'
          />
          <input
            type='url'
            placeholder='Enter a URL'
            value={article.url}
            onChange={(e) =>
              setArticle((article) => ({ ...article, url: e.target.value }))
            }
            required
            className='url_input peer'
          />
          <button
            className='submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700'
            type='submit'
          >
            ↵
          </button>
        </form>
        <div className='flex flex-col gap-1 max-h-60 overflow-y-auto'>
          {allArticles.map((item, index) => (
            <div
              key={`link-${index}`}
              onClick={() => setArticle(item)}
              className='link_card'
            >
              <div className='copy_btn' onClick={() => handleCopy(item.url)}>
                <img
                  src={copied === item.url ? tick : copy}
                  alt='copy_icon'
                  className='w-[40%] h-[40%] object-contain'
                />
              </div>
              <p className='flex-1 font-medium text-sm truncate text-blue-700'>
                {item.url}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className='my-10 max-w-full flex justify-center items-center'>
        {isFetching ? (
          <img src={loader} alt='loader' className='h-20 w-20 object-contain' />
        ) : error ? (
          <p className='font-inter font-bold text-black text-center'>
            Well, that wasn't supposed to happen <br />
          </p>
        ) : (
          article.summary && (
            <div className='flex flex-col gap-3'>
              <h2 className='fotn-satoshi font-bold text-gray-600 text-xl'>
                Article <span className='blue_gradient'>Summary</span>
              </h2>
              <div className='summary_box'>
                <p className='font-inter font-medium text-sm text-gray-700'>
                  {article.summary}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};
