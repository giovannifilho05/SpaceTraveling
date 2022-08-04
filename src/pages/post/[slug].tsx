import React from "react";
import { FiCalendar, FiClock, FiUser } from "react-icons/fi";
import { GetStaticPaths } from 'next';
import Head from 'next/Head'
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';

import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Content {
  heading: string;
  body: {
    text: string;
  }[];
}
interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: Content[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const first_publication_date = format(
    new Date(post.first_publication_date),
    "d MMM yyyy",
    {
      locale: ptBR,
    }
  )

  function calculateEstimatedTeadingTime(contents: Content[]) {
    let totalWords = 0

    contents.map((content) => {
      totalWords += content.heading.split(' ').length
      totalWords += RichText.asText(content.body).split(' ').length
    })

    return Math.ceil(totalWords / 200)
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling.</title>
      </Head>

      <main>
        <div className={styles.banner}>
          <img src={post.data.banner.url} alt="banner" />
        </div>

        <article className={`${commonStyles.container} ${styles.post}`}>
          <header>
            <h1>{post.data.title}</h1>
            <div className={commonStyles.author}>
              <time> <FiCalendar />{first_publication_date}</time>
              <span> <FiUser /> {post.data.author}</span>
              <span> <FiClock /> {calculateEstimatedTeadingTime(post.data.content)} min</span>
            </div>

          </header>

          {post.data.content.map((content, index) => (
            <React.Fragment key={index}>
              <h2>{content.heading}</h2>
              <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }} />
            </React.Fragment>
          ))}

        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({})
  const posts = await prismic.getByType('posts')

  const paths = posts.results.map(post => `/post/${post.uid}`)

  return {
    paths,
    fallback: 'blocking',
  }
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params
  const prismic = getPrismicClient({})
  const post = await prismic.getByUID('posts', slug)

  return {
    props: {
      post
    }
  }
};
