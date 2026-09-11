export const PostType = {
  NEWS: "NEWS",
  EDUCATION: "EDUCATION",
} as const;

export type PostType = (typeof PostType)[keyof typeof PostType];

export const PostStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
} as const;

export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];
