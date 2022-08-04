import { GetStaticProps } from 'next';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from "react-icons/fi";

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useEffect, useState } from 'react';
import Head from 'next/Head';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState(postsPagination.results);



  async function handleLoadMore() {
    if (nextPage) {
      getPosts(nextPage);
    }
  }

  async function getPosts(nextPage: string) {
    const response = await fetch(nextPage)
    const { results, next_page } = await response.json();

    setNextPage(next_page);
    setPosts([...posts, ...results]);
  }

  return (
    <>
    <Head>
      <title>Posts | spacetraveling.</title>
    </Head>
      <main className={commonStyles.container}>
        <div className={styles.posts}>

          {posts.map((post) => {
            const first_publication_date = format(
              new Date(post.first_publication_date),
              "d MMM yyyy",
              {
                locale: ptBR,
              }
            )
            return (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a>
                  <h1>{post.data.title}</h1>
                  <p>{post.data.subtitle}</p>
                  <div className={commonStyles.author}>
                    <time> <FiCalendar />{first_publication_date}</time>
                    <span> <FiUser /> {post.data.author}</span>
                  </div>
                </a>
              </Link>
            )

          })}

          {
            nextPage &&
            <button
              className={styles.nextPage}
              onClick={handleLoadMore}
            >
              Carregar mais posts
            </button>
          }

        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({})

  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1
  })

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: postsResponse.results,
      }
    }
  }
};
