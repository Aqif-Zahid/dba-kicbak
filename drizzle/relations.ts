import { relations } from "drizzle-orm/relations";
import { users, communities, groups, profiles, comments, posts, mentions, organizations, referralCodes, referrals, votes, rewardsLedger, groupsToUsers, postsToCategories, categories } from "./schema";

export const communitiesRelations = relations(communities, ({one, many}) => ({
	user: one(users, {
		fields: [communities.ownerId],
		references: [users.id]
	}),
	posts: many(posts),
}));

export const usersRelations = relations(users, ({many}) => ({
	communities: many(communities),
	groups: many(groups),
	mentions: many(mentions),
	organizations: many(organizations),
	referralCodes: many(referralCodes),
	referrals_referrerUserId: many(referrals, {
		relationName: "referrals_referrerUserId_users_id"
	}),
	referrals_referredUserId: many(referrals, {
		relationName: "referrals_referredUserId_users_id"
	}),
	votes: many(votes),
	profiles: many(profiles),
	rewardsLedgers: many(rewardsLedger),
	groupsToUsers: many(groupsToUsers),
}));

export const groupsRelations = relations(groups, ({one, many}) => ({
	user: one(users, {
		fields: [groups.ownerId],
		references: [users.id]
	}),
	groupsToUsers: many(groupsToUsers),
}));

export const commentsRelations = relations(comments, ({one, many}) => ({
	profile: one(profiles, {
		fields: [comments.authorProfileId],
		references: [profiles.id]
	}),
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id]
	}),
	mentions: many(mentions),
	votes: many(votes),
}));

export const profilesRelations = relations(profiles, ({one, many}) => ({
	comments: many(comments),
	posts: many(posts),
	user: one(users, {
		fields: [profiles.userId],
		references: [users.id]
	}),
}));

export const postsRelations = relations(posts, ({one, many}) => ({
	comments: many(comments),
	mentions: many(mentions),
	profile: one(profiles, {
		fields: [posts.authorProfileId],
		references: [profiles.id]
	}),
	community: one(communities, {
		fields: [posts.communityId],
		references: [communities.id]
	}),
	votes: many(votes),
	postsToCategories: many(postsToCategories),
}));

export const mentionsRelations = relations(mentions, ({one}) => ({
	user: one(users, {
		fields: [mentions.userId],
		references: [users.id]
	}),
	post: one(posts, {
		fields: [mentions.postId],
		references: [posts.id]
	}),
	comment: one(comments, {
		fields: [mentions.commentId],
		references: [comments.id]
	}),
}));

export const organizationsRelations = relations(organizations, ({one}) => ({
	user: one(users, {
		fields: [organizations.ownerId],
		references: [users.id]
	}),
}));

export const referralCodesRelations = relations(referralCodes, ({one, many}) => ({
	user: one(users, {
		fields: [referralCodes.userId],
		references: [users.id]
	}),
	referrals: many(referrals),
}));

export const referralsRelations = relations(referrals, ({one}) => ({
	user_referrerUserId: one(users, {
		fields: [referrals.referrerUserId],
		references: [users.id],
		relationName: "referrals_referrerUserId_users_id"
	}),
	user_referredUserId: one(users, {
		fields: [referrals.referredUserId],
		references: [users.id],
		relationName: "referrals_referredUserId_users_id"
	}),
	referralCode: one(referralCodes, {
		fields: [referrals.referralCode],
		references: [referralCodes.code]
	}),
}));

export const votesRelations = relations(votes, ({one}) => ({
	user: one(users, {
		fields: [votes.userId],
		references: [users.id]
	}),
	post: one(posts, {
		fields: [votes.postId],
		references: [posts.id]
	}),
	comment: one(comments, {
		fields: [votes.commentId],
		references: [comments.id]
	}),
}));

export const rewardsLedgerRelations = relations(rewardsLedger, ({one}) => ({
	user: one(users, {
		fields: [rewardsLedger.userId],
		references: [users.id]
	}),
}));

export const groupsToUsersRelations = relations(groupsToUsers, ({one}) => ({
	group: one(groups, {
		fields: [groupsToUsers.groupId],
		references: [groups.id]
	}),
	user: one(users, {
		fields: [groupsToUsers.userId],
		references: [users.id]
	}),
}));

export const postsToCategoriesRelations = relations(postsToCategories, ({one}) => ({
	post: one(posts, {
		fields: [postsToCategories.postId],
		references: [posts.id]
	}),
	category: one(categories, {
		fields: [postsToCategories.categoryId],
		references: [categories.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	postsToCategories: many(postsToCategories),
}));