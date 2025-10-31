import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: ReturnType<typeof makeClient> | undefined;
}

function makeClient() {
  const base = new PrismaClient();

  // Wrap with a query extension to guard Comment.create
  const guarded = base.$extends({
    query: {
      comment: {
        async create({ args, query }) {
          const rawPostId = (args.data as any)?.postId;
          const postId =
            typeof rawPostId === "number" ? rawPostId : Number(rawPostId);

          if (!Number.isFinite(postId)) {
            const err = new Error("Invalid post id for comment");
            (err as any).code = "INVALID_POST_ID";
            throw err;
          }

          const post = await base.post.findUnique({
            where: { id: postId },
            select: { allowComments: true },
          });

          if (!post) {
            const err = new Error("Post not found");
            (err as any).code = "POST_NOT_FOUND";
            throw err;
          }

          if (!post.allowComments) {
            const err = new Error("Comments are disabled for this post");
            (err as any).code = "COMMENTS_DISABLED";
            throw err;
          }

          // proceed with original create
          return query(args);
        },
      },
    },
  });

  return guarded;
}

const prisma = globalThis.prismaGlobal ?? makeClient();

// Cache the client in dev to avoid re-instantiating on HMR
if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
