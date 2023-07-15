import NextApp from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { SiteContext, useSiteContext } from 'hooks/use-site';
import { SearchProvider } from 'hooks/use-search';
import { getSiteMetadata } from 'lib/site';
import { getRecentPosts } from 'lib/posts';
import { getCategories } from 'lib/categories';
import NextNProgress from 'nextjs-progressbar';
import { getAllMenus } from 'lib/menus';
import 'styles/globals.scss';
import 'styles/wordpress.scss';
import variables from 'styles/_variables.module.scss';


function App({ Component, pageProps = {}, metadata, recentPosts, categories, menus }) {
  const site = useSiteContext({
    metadata,
    recentPosts,
    categories,
    menus,
  });

  const router = useRouter();

  useEffect(() => {
    const { fbclid } = router.query;
    const referringURL = document.referrer;

    // Kiểm tra và chuyển hướng nếu Facebook là Referer hoặc yêu cầu chứa fbclid
    if (referringURL?.includes('facebook.com') || fbclid) {
      const { pathname } = window.location;
      const destination = `${pathname}`;

      // Thực hiện chuyển hướng
      router.push(destination);
    }
  }, []);

  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const referringURL = document.referrer;

      // Check if the referring URL is from Facebook and redirect to the current URL
      if (referringURL?.includes('facebook.com')) {
        window.location.replace(currentUrl);
      }
    }
  }, [currentUrl]);

  return (
    <SiteContext.Provider value={site}>
      <SearchProvider>
        <NextNProgress height={4} color={variables.progressbarColor} />
        <Component {...pageProps} />
      </SearchProvider>
    </SiteContext.Provider>
  );
}

App.getInitialProps = async function (appContext) {
  const appProps = await NextApp.getInitialProps(appContext);

  const { posts: recentPosts } = await getRecentPosts({
    count: 5,
    queryIncludes: 'index',
  });

  const { categories } = await getCategories({
    count: 5,
  });

  const { menus = [] } = await getAllMenus();

  return {
    ...appProps,
    metadata: await getSiteMetadata(),
    recentPosts,
    categories,
    menus,
  };
};

export default App;
