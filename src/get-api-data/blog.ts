import { prisma } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";


// get all blogs
export const getBlogs = unstable_cache(
  async () => {
    return await prisma.post.findMany({
      orderBy: {updatedAt: "desc"},
    });
  },
  ['posts'],{tags: ['posts'] }
);

// GET POST CATEGORY
export const getPostCategory = unstable_cache(
  async () => {
    const postCategories = await prisma.postCategory.findMany({
      orderBy: {updatedAt: "desc"},
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: {
            posts: true
          }
        },
      }
    });
    return postCategories.map((item) => ({
      ...item,
      postCounts: item._count.posts
    }))
  },
  ['postCategories'],{tags: ['postCategories'] }
);

// GET POST TAGS
export const getPostTags = unstable_cache(
  async () => {
    return await prisma.post.findMany({
      select: {
        tags: true
      }
    });
  },
  ['posts'],{tags: ['posts'] }
);

// GET SINGLE BLOG
export const getSingleBlog = unstable_cache(
  async (slug: string) => {
    return await prisma.post.findUnique({
      where: {
        slug: slug
      },
      include: {
        author:{
          select: {
            name: true,
            image: true
          }
        }
      }
    });
  },
  ['posts'],{tags: ['posts'] }
);

// GET POSTS BY CATEGORY
export const getPostsByCategory = unstable_cache(
  async (slug: string) => {
    return await prisma.post.findMany({
      where: {
        category: {
          slug: slug
        }
      }
    });
  },
  ['posts'],{tags: ['posts'] }
);

// GET CATEGORY BY SLUG
export const getPostCategoryBySlug = unstable_cache(
  async (slug: string) => {
    return await prisma.postCategory.findUnique({
      where: {
        slug: slug
      }
    });
  },
  ['postCategories'],{tags: ['postCategories'] }
);

// GET POST CATEGORIES
export const getPostCategories = unstable_cache(
  async () => {
    return await prisma.postCategory.findMany({
      orderBy: {updatedAt: "desc"},
    });
  },
  ['postCategories'],{tags: ['postCategories'] }
);

// GET POST BY TAG
export const getPostsByTag = unstable_cache(
  async (slug: string) => {
    return await prisma.post.findMany({
      where: {
        tags: {
          has: slug
        }
      }
    });
  },
  ['posts'],{tags: ['posts'] }
)