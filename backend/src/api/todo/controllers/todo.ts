import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::todo.todo",
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be logged in to create a todo.");
      }

      ctx.request.body.data = {
        ...ctx.request.body.data,
        users_permissions_user: user.id,
      };

      const response = await super.create(ctx);
      return response;
    },

    async find(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be logged in to view todos.");
      }

      ctx.query = {
        ...ctx.query,
        filters: {
          ...((ctx.query.filters as object) || {}),
          users_permissions_user: { id: { $eq: user.id } },
        },
      };

      const response = await super.find(ctx);
      return response;
    },

    async update(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be logged in to update a todo.");
      }

      const { id } = ctx.params;
      const todo = await strapi.entityService.findOne("api::todo.todo", id, {
        populate: ["users_permissions_user"],
      });

      if (!todo) {
        return ctx.notFound("Todo not found.");
      }

      const todoOwner = (todo as any).users_permissions_user;
      if (!todoOwner || todoOwner.id !== user.id) {
        return ctx.forbidden("You do not own this todo.");
      }

      const response = await super.update(ctx);
      return response;
    },

    async delete(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be logged in to delete a todo.");
      }

      const { id } = ctx.params;
      const todo = await strapi.entityService.findOne("api::todo.todo", id, {
        populate: ["users_permissions_user"],
      });

      if (!todo) {
        return ctx.notFound("Todo not found.");
      }

      const todoOwner = (todo as any).users_permissions_user;
      if (!todoOwner || todoOwner.id !== user.id) {
        return ctx.forbidden("You do not own this todo.");
      }

      const response = await super.delete(ctx);
      return response;
    },
  }),
);
