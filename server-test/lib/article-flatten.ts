import prisma from '#configs/prisma.js';

export async function fetchArticles(
  opts: {
    categoryId?: number;
    userId?: number;
  } = {}
) {
  return prisma.article.findMany({
    where: {
      ...(opts.categoryId !== undefined
        ? { category_id: opts.categoryId }
        : {}),
      ...(opts.userId !== undefined ? { user_id: opts.userId } : {}),
    },
    include: {
      category: true,
      author: { select: { name: true, nickname: true, img: true } },
      comments: {
        include: { commenter: { select: { name: true, img: true } } },
      },
    },
    orderBy: { id: 'asc' },
  });
}

export type ArticleRow = Awaited<ReturnType<typeof fetchArticles>>[number];

// useNickname=true → article_author_name = author.nickname (GET /, /homepageArticle, /MyArticle)
// useNickname=false → article_author_name = author.name   (GET /comments, /sharing)
export function flattenArticleList(articles: ArticleRow[], useNickname = true) {
  return articles.flatMap((a) => {
    const { category, author, comments, ...articleFields } = a;
    const base = {
      ...articleFields,
      category_name: category.name,
      article_author_name: useNickname ? author.nickname : author.name,
      article_author_img: author.img,
    };
    if (comments.length === 0) {
      return [
        { ...base, comment_likes: null, user_name: null, user_img: null },
      ];
    }
    return comments.map((c) => ({
      ...base,
      comment_likes: c.likes,
      user_name: c.commenter.name,
      user_img: c.commenter.img,
    }));
  });
}
